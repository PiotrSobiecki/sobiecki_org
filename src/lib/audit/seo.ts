import { z } from "zod";
import { result, sample, score } from "./checks.ts";
import { SEO } from "./defs.ts";
import { AuditError } from "./errors.ts";
import { checkTarget, fetchJson, fetchOnce, follow, isPublicUrl, normalizeTarget } from "./net.ts";
import { type ParsedPage, parsePage } from "./page.ts";
import type { Check, PageRow, Report, SeoState, SeoStep, Speed } from "./schema.ts";

const MAX_PAGES = 500;
// Each call stays well under the Workers subrequest limit; the client calls again with `state`.
const FIRST_BATCH = 10;
const BATCH = 25;
const CONCURRENCY = 5;
const NOT_A_PAGE =
	/\.(jpe?g|png|gif|webp|avif|svg|ico|pdf|zip|rar|7z|gz|mp[34]|avi|mov|webm|docx?|xlsx?|pptx?|css|js|mjs|xml|txt|json|woff2?|ttf|eot)$/i;

/** One spelling per address: sitemaps write "https://x.pl", links resolve to "https://x.pl/". */
function toHref(raw: string, base?: string): string | null {
	try {
		const url = new URL(raw.trim(), base);
		url.hash = "";
		return url.href;
	} catch {
		return null;
	}
}

function crawlable(href: string, origin: string): boolean {
	try {
		const url = new URL(href);
		return url.origin === origin && isPublicUrl(url) && !NOT_A_PAGE.test(url.pathname);
	} catch {
		return false;
	}
}

function blocksEverything(robots: string): boolean {
	let agents: string[] = [];
	let inRules = false;
	for (const raw of robots.split("\n")) {
		const [rawKey = "", ...rest] = raw.replace(/#.*/, "").split(":");
		const key = rawKey.trim().toLowerCase();
		const value = rest.join(":").trim();
		if (key === "user-agent") {
			if (inRules) agents = [];
			inRules = false;
			agents.push(value);
		} else if (key === "disallow" || key === "allow") {
			inRules = true;
			if (key === "disallow" && value === "/" && agents.includes("*")) return true;
		}
	}
	return false;
}

async function readSitemaps(candidates: string[]): Promise<{ found: string; locs: string[] }> {
	const queue = candidates.slice(0, 2);
	const locs: string[] = [];
	let found = "";
	for (let budget = 5; budget > 0; budget--) {
		const next = queue.shift();
		if (!next) break;
		if (!URL.canParse(next) || !isPublicUrl(new URL(next))) continue;
		const res = await fetchOnce(next, { timeoutMs: 15_000 });
		if (!res || res.status !== 200 || !/<(urlset|sitemapindex)/i.test(res.body)) continue;
		found ||= next;
		const entries = [...res.body.matchAll(/<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]\s]+)/gi)]
			.map((m) => toHref((m[1] ?? "").replace(/&amp;/g, "&")))
			.filter((href): href is string => href !== null);
		if (/<sitemapindex/i.test(res.body)) queue.push(...entries.slice(0, 3));
		else locs.push(...entries);
	}
	return { found, locs: [...new Set(locs)] };
}

const PageSpeedSchema = z.object({
	lighthouseResult: z.object({
		categories: z.object({ performance: z.object({ score: z.number().nullable() }) }),
		audits: z.record(z.string(), z.object({ numericValue: z.number().optional() })),
	}),
});

async function pageSpeed(url: string, apiKey: string): Promise<Speed | null> {
	const query = new URLSearchParams({ url, strategy: "mobile", category: "performance" });
	if (apiKey) query.set("key", apiKey);
	const parsed = PageSpeedSchema.safeParse(
		await fetchJson(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${query}`, {
			timeoutMs: 90_000,
		}),
	);
	if (!parsed.success) return null;
	const { categories, audits } = parsed.data.lighthouseResult;
	const metric = (id: string) => audits[id]?.numericValue ?? 0;
	return {
		score: Math.round((categories.performance.score ?? 0) * 100),
		lcpMs: Math.round(metric("largest-contentful-paint")),
		cls: Math.round(metric("cumulative-layout-shift") * 1000) / 1000,
		tbtMs: Math.round(metric("total-blocking-time")),
		fcpMs: Math.round(metric("first-contentful-paint")),
	};
}

function homepageChecks(page: ParsedPage, xRobots: string): Check[] {
	const t = page.title.length;
	const d = page.description.length;
	const quoted = (s: string) => `„${s.slice(0, 80)}”`;
	return [
		t === 0
			? result(SEO.title, "fail", "Brak tytułu")
			: result(SEO.title, t < 10 || t > 65 ? "warn" : "ok", `${t} znaków: ${quoted(page.title)}`),
		d === 0
			? result(SEO.description, "fail", "Brak opisu")
			: result(SEO.description, d < 50 || d > 170 ? "warn" : "ok", `${d} znaków`),
		result(
			SEO.h1,
			page.h1Count === 1 ? "ok" : page.h1Count === 0 ? "fail" : "warn",
			`Nagłówków H1: ${page.h1Count}`,
		),
		page.canonical
			? result(SEO.canonical, "ok", page.canonical)
			: result(SEO.canonical, "warn", "Brak"),
		page.noindex || /noindex/i.test(xRobots)
			? result(SEO.noindex, "fail", "Strona główna ma noindex: Google jej nie pokaże")
			: result(SEO.noindex, "ok", "Brak noindex"),
		page.jsonLd > 0
			? result(SEO.structured, "ok", `Bloków JSON-LD: ${page.jsonLd}`)
			: result(SEO.structured, "warn", "Brak"),
		result(SEO.viewport, page.viewport ? "ok" : "fail", page.viewport ? "Jest" : "Brak"),
		result(SEO.lang, page.lang ? "ok" : "warn", page.lang || "Brak"),
		page.images === 0
			? result(SEO.alt, "skip", "Brak obrazków na stronie głównej")
			: result(
					SEO.alt,
					page.imagesWithoutAlt === 0 ? "ok" : "warn",
					`Bez alt: ${page.imagesWithoutAlt} z ${page.images}`,
				),
		result(SEO.words, page.words >= 300 ? "ok" : "warn", `${page.words} słów`),
	];
}

async function start(target: URL, apiKey: string): Promise<SeoState> {
	const [home, speed] = await Promise.all([follow(target.href), pageSpeed(target.href, apiKey)]);
	if (!home) {
		throw new AuditError(`${target.host} nie odpowiada`, "VALIDATION", 400, "url");
	}
	const finalUrl = new URL(home.final.url);
	const origin = finalUrl.origin;
	const page = parsePage(home.final.body, home.final.url);
	const altHost = finalUrl.hostname.startsWith("www.")
		? finalUrl.hostname.slice(4)
		: `www.${finalUrl.hostname}`;

	const [http, alt, robots] = await Promise.all([
		follow(`http://${finalUrl.hostname}/`),
		follow(`${finalUrl.protocol}//${altHost}/`),
		fetchOnce(`${origin}/robots.txt`),
	]);
	const robotsText = robots?.status === 200 ? robots.body : "";
	const declared = [...robotsText.matchAll(/^\s*sitemap:\s*(\S+)/gim)].map((m) => m[1] ?? "");
	const sitemap = await readSitemaps(declared.length ? declared : [`${origin}/sitemap.xml`]);
	const altOrigin = alt ? new URL(alt.final.url).origin : "";

	const siteChecks: Check[] = [
		result(SEO.https, finalUrl.protocol === "https:" ? "ok" : "fail", finalUrl.href),
		!http
			? result(SEO.httpRedirect, "skip", "http:// nie odpowiada")
			: result(
					SEO.httpRedirect,
					new URL(http.final.url).protocol === "https:" ? "ok" : "fail",
					`http:// kończy na ${http.final.url}`,
				),
		!alt || altOrigin === origin || alt.final.status >= 400
			? result(SEO.www, "ok", alt ? `${altHost} → ${altOrigin}` : `${altHost} nie odpowiada`)
			: result(SEO.www, "warn", `${altHost} działa osobno, bez przekierowania na ${origin}`),
		robotsText
			? result(SEO.robots, "ok", "Jest")
			: result(SEO.robots, "warn", `Brak (status ${robots?.status ?? "brak odpowiedzi"})`),
		!robotsText
			? result(SEO.robotsBlock, "skip", "Brak robots.txt")
			: blocksEverything(robotsText)
				? result(SEO.robotsBlock, "fail", "Disallow: / dla wszystkich robotów")
				: result(SEO.robotsBlock, "ok", "Nie blokuje"),
		sitemap.found
			? result(SEO.sitemap, "ok", `${sitemap.found} (${sitemap.locs.length} adresów)`)
			: result(SEO.sitemap, "fail", "Nie znaleziono w robots.txt ani pod /sitemap.xml"),
		...homepageChecks(page, home.final.headers.get("x-robots-tag") ?? ""),
	];

	return {
		origin,
		queue: [...new Set([...page.links, ...sitemap.locs])].filter((u) => crawlable(u, origin)),
		seen: [target.href, home.final.url, ...home.hops],
		pages: [toRow(home.final.url, home.final.status, home.final.ms, page, false)],
		siteChecks,
		speed,
	};
}

function toRow(
	url: string,
	status: number,
	ms: number,
	page: ParsedPage | null,
	noindexHeader: boolean,
): PageRow {
	const canonical = page?.canonical ? toHref(page.canonical, url) : null;
	return {
		url,
		status,
		ms,
		title: page?.title.slice(0, 200) ?? "",
		description: page?.description.slice(0, 300) ?? "",
		h1: page?.h1Count ?? 0,
		words: page?.words ?? 0,
		noindex: Boolean(page?.noindex) || noindexHeader,
		...(canonical && canonical !== url ? { canonical } : {}),
	};
}

async function visit(url: string): Promise<{ row: PageRow | null; links: string[] }> {
	const res = await fetchOnce(url);
	if (!res) return { row: toRow(url, 0, 0, null, false), links: [] };
	if (res.location) {
		return {
			row: { ...toRow(url, res.status, res.ms, null, false), location: res.location },
			links: [res.location],
		};
	}
	if (res.status >= 400) return { row: toRow(url, res.status, res.ms, null, false), links: [] };
	if (!/html/.test(res.headers.get("content-type") ?? "")) return { row: null, links: [] };
	const page = parsePage(res.body, url);
	const noindexHeader = /noindex/i.test(res.headers.get("x-robots-tag") ?? "");
	return { row: toRow(url, res.status, res.ms, page, noindexHeader), links: page.links };
}

async function crawl(state: SeoState, limit: number): Promise<void> {
	const seen = new Set(state.seen);
	const batch: string[] = [];
	while (batch.length < limit && state.pages.length + batch.length < MAX_PAGES) {
		const raw = state.queue.shift();
		if (raw === undefined) break;
		const next = toHref(raw);
		if (!next || seen.has(next) || !crawlable(next, state.origin)) continue;
		seen.add(next);
		batch.push(next);
	}
	for (let i = 0; i < batch.length; i += CONCURRENCY) {
		const visited = await Promise.all(batch.slice(i, i + CONCURRENCY).map(visit));
		for (const { row, links } of visited) {
			if (row) state.pages.push(row);
			state.queue.push(...links.filter((l) => !seen.has(l) && crawlable(l, state.origin)));
		}
	}
	state.seen = [...seen];
	state.queue = [...new Set(state.queue)].filter((u) => !seen.has(u)).slice(0, 5000);
}

function duplicates(rows: PageRow[], key: (r: PageRow) => string): string[] {
	const groups = new Map<string, number>();
	for (const r of rows) {
		const k = key(r);
		if (k) groups.set(k, (groups.get(k) ?? 0) + 1);
	}
	return [...groups].filter(([, n]) => n > 1).map(([k, n]) => `„${k.slice(0, 60)}” ×${n}`);
}

function crawlChecks(pages: PageRow[]): Check[] {
	const html = pages.filter((p) => p.status >= 200 && p.status < 300);
	if (html.length === 0) {
		return [SEO.broken, SEO.missingTitles, SEO.dupTitles].map((d) =>
			result(d, "skip", "Brak przeczytanych podstron"),
		);
	}
	// Google lists a page that points its canonical elsewhere, or has noindex, under another
	// address or not at all, so it cannot duplicate or thin out anything.
	const indexable = html.filter((p) => !p.canonical && !p.noindex);
	const skipped = html.length - indexable.length;
	const aside = skipped ? ` (pominięto ${skipped} z canonical na inny adres albo noindex)` : "";
	const urls = (rows: PageRow[]) => sample(rows.map((r) => r.url));
	const broken = pages.filter((p) => p.status === 0 || p.status >= 400);
	const redirected = pages.filter((p) => p.status >= 300 && p.status < 400);
	const noTitle = indexable.filter((p) => !p.title);
	const noDesc = indexable.filter((p) => !p.description);
	const noH1 = indexable.filter((p) => p.h1 === 0);
	const noindex = html.filter((p) => p.noindex);
	const thin = indexable.filter((p) => p.words < 150);
	const dupTitles = duplicates(indexable, (r) => r.title);
	const dupDesc = duplicates(indexable, (r) => r.description);
	const times = html.map((p) => p.ms).sort((a, b) => a - b);
	const median = times[Math.floor(times.length / 2)] ?? 0;
	const count = (rows: PageRow[], all: PageRow[]) => `${rows.length} z ${all.length}`;

	return [
		broken.length
			? result(SEO.broken, "fail", `${count(broken, pages)}: ${urls(broken)}`)
			: result(SEO.broken, "ok", `0 z ${pages.length}`),
		redirected.length
			? result(SEO.redirects, "warn", `${count(redirected, pages)}: ${urls(redirected)}`)
			: result(SEO.redirects, "ok", "Brak"),
		noTitle.length
			? result(SEO.missingTitles, "fail", `${count(noTitle, indexable)}: ${urls(noTitle)}`)
			: result(SEO.missingTitles, "ok", `Wszystkie mają tytuł${aside}`),
		dupTitles.length
			? result(SEO.dupTitles, "warn", `${sample(dupTitles)}${aside}`)
			: result(SEO.dupTitles, "ok", `Brak powtórzeń${aside}`),
		noDesc.length
			? result(SEO.missingDesc, "warn", `${count(noDesc, indexable)}: ${urls(noDesc)}`)
			: result(SEO.missingDesc, "ok", `Wszystkie mają opis${aside}`),
		dupDesc.length
			? result(SEO.dupDesc, "warn", `${sample(dupDesc)}${aside}`)
			: result(SEO.dupDesc, "ok", `Brak powtórzeń${aside}`),
		noH1.length
			? result(SEO.missingH1, "warn", `${count(noH1, indexable)}: ${urls(noH1)}`)
			: result(SEO.missingH1, "ok", `Wszystkie mają H1${aside}`),
		noindex.length
			? result(SEO.noindexPages, "warn", `${count(noindex, html)}: ${urls(noindex)}`)
			: result(SEO.noindexPages, "ok", "Brak"),
		result(
			SEO.thin,
			thin.length > indexable.length / 5 ? "warn" : "ok",
			`${count(thin, indexable)} poniżej 150 słów${aside}`,
		),
		result(
			SEO.slow,
			median <= 800 ? "ok" : median <= 1500 ? "warn" : "fail",
			`Mediana ${median} ms`,
		),
	];
}

function speedChecks(speed: Speed | null): Check[] {
	if (!speed) {
		const why = "PageSpeed nie odpowiedział (limit zapytań Google albo strona ładuje się za długo)";
		return [SEO.perf, SEO.lcp, SEO.cls, SEO.tbt].map((d) => result(d, "skip", why));
	}
	const grade = (v: number, good: number, poor: number) =>
		v <= good ? "ok" : v <= poor ? "warn" : "fail";
	return [
		result(SEO.perf, grade(100 - speed.score, 10, 50), `${speed.score}/100`),
		result(SEO.lcp, grade(speed.lcpMs, 2500, 4000), `${(speed.lcpMs / 1000).toFixed(1)} s`),
		result(SEO.cls, grade(speed.cls, 0.1, 0.25), String(speed.cls)),
		result(SEO.tbt, grade(speed.tbtMs, 200, 600), `${speed.tbtMs} ms`),
	];
}

function toReport(state: SeoState, done: boolean): Report {
	const checks = [...state.siteChecks, ...crawlChecks(state.pages), ...speedChecks(state.speed)];
	return {
		kind: "seo",
		target: state.origin,
		score: score(checks),
		checks,
		pages: state.pages,
		speed: state.speed,
		done,
	};
}

/** One step of an SEO audit: the first call starts it, later calls pass back `state` until done. */
export async function runSeoAudit(
	input: { url: string; state?: SeoState },
	apiKey: string,
): Promise<SeoStep> {
	let state: SeoState;
	if (input.state) {
		state = { ...input.state, origin: normalizeTarget(input.state.origin).origin };
		await crawl(state, BATCH);
	} else {
		state = await start(await checkTarget(input.url), apiKey);
		await crawl(state, FIRST_BATCH);
	}
	const done = state.queue.length === 0 || state.pages.length >= MAX_PAGES;
	return { report: toReport(state, done), state: done ? null : state };
}
