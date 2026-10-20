import { z } from "zod";
import { type CheckDef, result, sample, score } from "./checks.ts";
import { SECURITY as S } from "./defs.ts";
import { AuditError } from "./errors.ts";
import { checkTarget, fetchJson, fetchOnce, follow } from "./net.ts";
import { parsePage } from "./page.ts";
import type { Check, Report } from "./schema.ts";

// Selectors of popular mail services. A key can sit under any selector: these only name it.
const DKIM_SELECTORS = [
	"resend",
	"google",
	"selector1",
	"selector2",
	"default",
	"k1",
	"s1",
	"s2",
	"mail",
	"dkim",
	"cf2024-1",
	"pm",
];
// Services such as Resend often sign mail for a subdomain (powiadomienia@send.example.com).
const MAIL_SUBDOMAINS = [
	"send",
	"mail",
	"email",
	"mg",
	"notifications",
	"updates",
	"news",
	"newsletter",
];
const RISKY_SUBDOMAIN =
	/^(admin|panel|cpanel|whm|plesk|webmail|test|testing|dev|develop|staging|stage|stg|beta|demo|old|backup|bak|preview|uat|qa|sandbox|git|gitlab|jenkins|phpmyadmin|pma|db|crm|erp|new)[0-9-]*\./;
const DAY_MS = 86_400_000;

const DnsSchema = z.object({
	Status: z.number(),
	AD: z.boolean().optional(),
	Answer: z.array(z.object({ type: z.number(), data: z.string() })).optional(),
});
const DNS_TYPES = { TXT: 16, MX: 15, CAA: 257 } as const;
const CrtShSchema = z.array(z.object({ name_value: z.string(), not_after: z.string() }));
const CertSpotterSchema = z.array(
	z.object({ dns_names: z.array(z.string()), not_after: z.string() }),
);
const WpCoreSchema = z.object({ offers: z.array(z.object({ current: z.string() })).min(1) });
const WpPluginSchema = z.object({ version: z.string() });

/**
 * Lookup over DNS-over-HTTPS. `exists` is NOERROR as opposed to NXDOMAIN: per RFC 8020 a name
 * with nothing at it but records below it still exists. `signed` is the resolver's DNSSEC
 * validation (AD) flag. Null when DNS did not answer.
 */
async function dnsQuery(
	name: string,
	type: keyof typeof DNS_TYPES = "TXT",
): Promise<{ exists: boolean; signed: boolean; records: string[] } | null> {
	const parsed = DnsSchema.safeParse(
		await fetchJson(
			`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
			{
				accept: "application/dns-json",
				timeoutMs: 8_000,
			},
		),
	);
	if (!parsed.success || (parsed.data.Status !== 0 && parsed.data.Status !== 3)) return null;
	return {
		exists: parsed.data.Status === 0,
		signed: parsed.data.AD === true,
		records: (parsed.data.Answer ?? [])
			.filter((a) => a.type === DNS_TYPES[type])
			.map((a) => (type === "TXT" ? a.data.replace(/"\s*"/g, "").replace(/^"|"$/g, "") : a.data)),
	};
}

async function txt(name: string): Promise<string[] | null> {
	return (await dnsQuery(name))?.records ?? null;
}

/** CAA applies from the closest name up the tree that has one (RFC 8659), so a parent's record counts. */
async function caaCheck(domain: string): Promise<Check> {
	const labels = domain.split(".");
	const names = labels.slice(0, -1).map((_, i) => labels.slice(i).join("."));
	const answers = await Promise.all(names.map((name) => dnsQuery(name, "CAA")));
	if (answers.every((a) => a === null)) return result(S.caa, "skip", "DNS nie odpowiedział");
	const records = answers.find((a) => a?.records.length)?.records;
	return records
		? result(S.caa, "ok", sample(records))
		: result(S.caa, "warn", "Brak: certyfikat dla domeny może wystawić dowolny urząd");
}

/**
 * Where the domain keeps DKIM keys. `_domainkey.<name>` exists exactly when some
 * <selector>._domainkey.<name> does, so a key under an unknown selector or on a sending
 * subdomain is still found; a wildcard record would fake that, hence the random-name check.
 */
async function findDkim(domain: string): Promise<{ keys: string[]; hosts: string[] } | null> {
	const names = [domain, ...MAIL_SUBDOMAINS.map((sub) => `${sub}.${domain}`)];
	const [wildcard, ...probes] = await Promise.all([
		dnsQuery(`brak-takiej-nazwy-${Date.now().toString(36)}.${domain}`),
		...names.map((name) => dnsQuery(`_domainkey.${name}`)),
	]);
	if (probes.every((p) => p === null)) return null;
	const hosts = wildcard?.exists === false ? names.filter((_, i) => probes[i]?.exists) : [];
	const candidates = (hosts.length ? hosts : [domain]).slice(0, 2);
	const found = await Promise.all(
		candidates.flatMap((name) =>
			DKIM_SELECTORS.map(async (selector) => {
				const key = `${selector}._domainkey.${name}`;
				return (await dnsQuery(key))?.records.some((r) => /p=\S/.test(r)) ? key : null;
			}),
		),
	);
	return { keys: found.filter((key): key is string => key !== null), hosts };
}

interface Cert {
	names: string[];
	notAfter: number;
}

/** Certificates from Certificate Transparency logs: crt.sh, or Cert Spotter when crt.sh is down (often). */
async function certificates(domain: string): Promise<Cert[] | null> {
	const q = encodeURIComponent(`%.${domain}`);
	const crtsh = CrtShSchema.safeParse(
		await fetchJson(`https://crt.sh/?q=${q}&output=json&exclude=expired`, { timeoutMs: 25_000 }),
	);
	if (crtsh.success) {
		return crtsh.data.map((c) => ({
			names: c.name_value.toLowerCase().split("\n"),
			notAfter: Date.parse(`${c.not_after}Z`),
		}));
	}
	const spotter = CertSpotterSchema.safeParse(
		await fetchJson(
			`https://api.certspotter.com/v1/issuances?domain=${encodeURIComponent(domain)}&include_subdomains=true&expand=dns_names`,
			{ timeoutMs: 20_000 },
		),
	);
	if (!spotter.success) return null;
	return spotter.data.map((c) => ({
		names: c.dns_names.map((n) => n.toLowerCase()),
		notAfter: Date.parse(c.not_after),
	}));
}

export function compareVersions(a: string, b: string): number {
	const pa = a.split(".").map(Number);
	const pb = b.split(".").map(Number);
	for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
		const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
		if (diff !== 0) return Math.sign(diff);
	}
	return 0;
}

function headerChecks(h: Headers | null, https: boolean): Check[] {
	if (!h) {
		const defs = [S.hsts, S.hstsPreload, S.csp, S.frame, S.nosniff, S.referrer, S.permissions];
		return [...defs, S.coop, S.cookies, S.serverVersion].map((d) =>
			result(d, "skip", "Strona nie odpowiedziała"),
		);
	}
	const has = (name: string) => h.get(name) !== null;
	const hsts = h.get("strict-transport-security") ?? "";
	const maxAge = Number(hsts.match(/max-age=(\d+)/i)?.[1] ?? 0);
	const csp = h.get("content-security-policy") ?? "";
	const leaks = [h.get("server"), h.get("x-powered-by")].filter(
		(v): v is string => v !== null && /\d/.test(v),
	);
	const weakCookies = h
		.getSetCookie()
		.filter((c) => (https && !/;\s*secure/i.test(c)) || !/;\s*httponly/i.test(c))
		.map((c) => c.split("=")[0] ?? "");

	return [
		!hsts
			? result(S.hsts, "fail", "Brak nagłówka")
			: result(S.hsts, maxAge >= 15_552_000 ? "ok" : "warn", hsts),
		result(S.hstsPreload, /preload/i.test(hsts) ? "ok" : "warn", hsts || "Brak HSTS"),
		csp
			? result(S.csp, "ok", csp.slice(0, 120))
			: result(
					S.csp,
					"warn",
					has("content-security-policy-report-only") ? "Tylko Report-Only" : "Brak",
				),
		has("x-frame-options") || /frame-ancestors/i.test(csp)
			? result(S.frame, "ok", h.get("x-frame-options") ?? "frame-ancestors w CSP")
			: result(S.frame, "warn", "Brak"),
		result(
			S.nosniff,
			h.get("x-content-type-options") === "nosniff" ? "ok" : "warn",
			h.get("x-content-type-options") ?? "Brak",
		),
		result(S.referrer, has("referrer-policy") ? "ok" : "warn", h.get("referrer-policy") ?? "Brak"),
		result(
			S.permissions,
			has("permissions-policy") ? "ok" : "warn",
			has("permissions-policy") ? "Jest" : "Brak",
		),
		result(
			S.coop,
			has("cross-origin-opener-policy") ? "ok" : "warn",
			h.get("cross-origin-opener-policy") ?? "Brak",
		),
		h.getSetCookie().length === 0
			? result(S.cookies, "skip", "Strona główna nie ustawia ciasteczek")
			: weakCookies.length
				? result(S.cookies, "warn", `Bez Secure lub HttpOnly: ${sample(weakCookies)}`)
				: result(S.cookies, "ok", "Wszystkie mają Secure i HttpOnly"),
		leaks.length
			? result(S.serverVersion, "warn", `Widać: ${leaks.join(", ")}`)
			: result(S.serverVersion, "ok", h.get("server") ?? "Brak nagłówka Server"),
	];
}

async function mailChecks(domain: string): Promise<Check[]> {
	const [apex, dmarcRecords, dkim, mx, mtaSts, tlsRpt] = await Promise.all([
		dnsQuery(domain),
		txt(`_dmarc.${domain}`),
		findDkim(domain),
		dnsQuery(domain, "MX"),
		txt(`_mta-sts.${domain}`),
		txt(`_smtp._tls.${domain}`),
	]);
	const spf = apex?.records.filter((r) => /^v=spf1/i.test(r)) ?? null;
	const dmarc = dmarcRecords?.find((r) => /^v=DMARC1/i.test(r));
	const policy = dmarc?.match(/;\s*p=(\w+)/i)?.[1]?.toLowerCase();
	// "0 ." is a null MX (RFC 7505): the domain says it takes no mail.
	const mailHosts = mx?.records.filter((r) => !/^\d+\s+\.$/.test(r)) ?? null;
	const inboundTls = (def: CheckDef, records: string[] | null, tag: RegExp, missing: string) =>
		mailHosts === null || records === null
			? result(def, "skip", "DNS nie odpowiedział")
			: mailHosts.length === 0
				? result(def, "skip", "Domena nie przyjmuje poczty (brak MX)")
				: result(
						def,
						records.some((r) => tag.test(r)) ? "ok" : "warn",
						records.find((r) => tag.test(r)) ?? missing,
					);

	return [
		spf === null
			? result(S.spf, "skip", "DNS nie odpowiedział")
			: spf.length === 0
				? result(S.spf, "fail", `Brak: każdy może wysyłać maile jako @${domain}`)
				: spf.length > 1
					? result(S.spf, "fail", "Kilka rekordów SPF naraz, więc żaden nie działa")
					: /[+]all/i.test(spf[0] ?? "")
						? result(S.spf, "fail", `+all przepuszcza każdego: ${spf[0]}`)
						: /[-~]all/i.test(spf[0] ?? "")
							? result(S.spf, "ok", spf[0] ?? "")
							: result(S.spf, "warn", `Bez -all/~all: ${spf[0]}`),
		dmarcRecords === null
			? result(S.dmarc, "skip", "DNS nie odpowiedział")
			: !dmarc
				? result(S.dmarc, "fail", "Brak rekordu _dmarc")
				: policy === "none"
					? result(S.dmarc, "warn", `p=none tylko obserwuje: ${dmarc}`)
					: result(S.dmarc, "ok", dmarc),
		!dkim
			? result(S.dkim, "skip", "DNS nie odpowiedział")
			: dkim.keys.length
				? result(S.dkim, "ok", `Klucz: ${sample(dkim.keys)}`)
				: dkim.hosts.length
					? result(
							S.dkim,
							"ok",
							`Klucz jest pod ${dkim.hosts.map((h) => `_domainkey.${h}`).join(", ")} (selektor spoza listy typowych)`,
						)
					: result(
							S.dkim,
							"warn",
							`Nie znaleziono w ${domain} ani w subdomenach wysyłkowych (${MAIL_SUBDOMAINS.join(", ")})`,
						),
		inboundTls(S.mtaSts, mtaSts, /^v=STSv1/i, "Brak rekordu _mta-sts"),
		inboundTls(S.tlsRpt, tlsRpt, /^v=TLSRPTv1/i, "Brak rekordu _smtp._tls"),
		!apex
			? result(S.dnssec, "skip", "DNS nie odpowiedział")
			: apex.signed
				? result(S.dnssec, "ok", "Odpowiedzi DNS są podpisane")
				: result(S.dnssec, "warn", "Odpowiedzi DNS nie są podpisane"),
	];
}

async function wordpressChecks(html: string): Promise<Check[]> {
	if (!/\/wp-(content|includes)\//.test(html)) {
		return [S.wpCore, S.wpPlugins].map((d) => result(d, "skip", "To nie WordPress"));
	}
	const version = parsePage(html, "https://x.invalid/").generator.match(
		/WordPress\s+([\d.]+)/i,
	)?.[1];
	const plugins = new Map<string, string>();
	for (const m of html.matchAll(
		/\/wp-content\/plugins\/([a-z0-9_-]+)\/[^"'\s>]*?\?ver=([\d.]+)/gi,
	)) {
		if (m[1] && m[2] && !plugins.has(m[1])) plugins.set(m[1], m[2]);
	}
	const checked = [...plugins].slice(0, 6);
	const [core, ...latest] = await Promise.all([
		fetchJson("https://api.wordpress.org/core/version-check/1.7/"),
		...checked.map(([slug]) =>
			fetchJson(
				`https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request[slug]=${slug}`,
			),
		),
	]);
	const current = WpCoreSchema.safeParse(core).data?.offers[0]?.current;
	const outdated = checked.flatMap(([slug, used], i) => {
		const newest = WpPluginSchema.safeParse(latest[i]).data?.version;
		return newest && compareVersions(used, newest) < 0 ? [`${slug} ${used} → ${newest}`] : [];
	});

	return [
		!version
			? result(S.wpCore, "ok", "WordPress, wersja ukryta")
			: !current
				? result(S.wpCore, "skip", `Wersja ${version}; nie udało się pobrać najnowszej`)
				: compareVersions(version, current) < 0
					? result(S.wpCore, "fail", `${version}, aktualna to ${current}`)
					: result(S.wpCore, "ok", `${version} (aktualna, ale widoczna w kodzie)`),
		checked.length === 0
			? result(S.wpPlugins, "skip", "Nie widać wersji wtyczek w kodzie strony")
			: outdated.length
				? result(S.wpPlugins, "fail", `Według ?ver= w adresach plików: ${sample(outdated, 6)}`)
				: result(S.wpPlugins, "ok", `Sprawdzono: ${checked.map(([s]) => s).join(", ")}`),
	];
}

async function certChecks(host: string, domain: string): Promise<Check[]> {
	const certs = await certificates(domain);
	if (!certs) {
		const why = "Rejestry certyfikatów (crt.sh, Cert Spotter) nie odpowiedziały";
		return [result(S.certExpiry, "skip", why), result(S.subdomains, "skip", why)];
	}
	const names = new Set(certs.flatMap((c) => c.names).map((n) => n.replace(/^\*\./, "")));
	const expiries = certs.filter((c) => c.names.includes(host)).map((c) => c.notAfter);
	// Newest, not the one the server presents (a Worker cannot see it): after a renewal the
	// old certificate stays valid in the logs for weeks, and the earliest would raise false alarms.
	const newest = expiries.length ? Math.max(...expiries) : 0;
	const days = Math.floor((newest - Date.now()) / DAY_MS);

	const subdomains = [...names].filter(
		(n) => n.endsWith(`.${domain}`) && n !== `www.${domain}` && /^[a-z0-9.-]+$/.test(n),
	);
	const risky = subdomains.filter((n) => RISKY_SUBDOMAIN.test(n)).slice(0, 6);
	const probes = await Promise.all(
		risky.map((n) => fetchOnce(`https://${n}/`, { timeoutMs: 6_000, readBody: false })),
	);
	const open = risky.flatMap((n, i) => {
		const status = probes[i]?.status ?? 0;
		return status >= 200 && status < 300 ? [`${n} (${status})`] : [];
	});

	return [
		!newest
			? result(S.certExpiry, "skip", `Brak certyfikatu dla ${host} w rejestrze`)
			: result(
					S.certExpiry,
					days <= 7 ? "fail" : days <= 20 ? "warn" : "ok",
					`Najnowszy certyfikat w publicznym rejestrze ważny do ${new Date(newest).toISOString().slice(0, 10)} (${days} dni)`,
				),
		open.length
			? result(S.subdomains, "warn", `Odpowiadają bez hasła: ${sample(open, 6)}`)
			: result(
					S.subdomains,
					"ok",
					`${subdomains.length} subdomen w rejestrze, ${risky.length} o nazwach paneli lub testów, żadna nie jest otwarta`,
				),
	];
}

/** Quick external scan: only what any browser or DNS resolver can already see. */
export async function runSecurityAudit(url: string): Promise<Report> {
	const target = await checkTarget(url);
	const host = target.hostname;
	const domain = host.replace(/^www\./, "");
	const [home, http, securityTxt, mail, certs, caa] = await Promise.all([
		follow(`https://${host}/`),
		follow(`http://${host}/`),
		fetchOnce(`https://${host}/.well-known/security.txt`),
		mailChecks(domain),
		certChecks(host, domain),
		caaCheck(domain),
	]);
	if (!home && !http) {
		throw new AuditError(
			`${host} nie odpowiada ani po https, ani po http`,
			"VALIDATION",
			400,
			"url",
		);
	}
	const https = home !== null && new URL(home.final.url).protocol === "https:";

	const checks: Check[] = [
		https
			? result(S.https, "ok", home?.final.url ?? "")
			: result(S.https, "fail", "Brak działającego połączenia HTTPS"),
		!http
			? result(S.httpRedirect, "skip", "http:// nie odpowiada")
			: result(
					S.httpRedirect,
					new URL(http.final.url).protocol === "https:" ? "ok" : "fail",
					`http:// kończy na ${http.final.url}`,
				),
		...certs.slice(0, 1),
		caa,
		...headerChecks(home?.final.headers ?? null, https),
		...mail,
		securityTxt?.status === 200 && /contact:/i.test(securityTxt.body)
			? result(S.securityTxt, "ok", "Jest")
			: result(S.securityTxt, "warn", "Brak"),
		...(await wordpressChecks(home?.final.body ?? "")),
		...certs.slice(1),
	];
	return {
		kind: "bezp",
		target: host,
		score: score(checks),
		checks,
		pages: [],
		speed: null,
		done: true,
	};
}
