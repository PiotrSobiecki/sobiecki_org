import assert from "node:assert/strict";
import dns from "node:dns/promises";
import { afterEach, beforeEach, mock, test } from "node:test";
import { runSeoAudit } from "../../src/lib/audit/seo.ts";

type Route = { status?: number; body?: string; headers?: Record<string, string> };

const page = (title: string, links: string[] = [], head = "") =>
	`<html lang="pl"><head><title>${title}</title><meta name="description" content="Opis strony ${title} wystarczająco długi, żeby przejść próg pięćdziesięciu znaków."><meta name="viewport" content="width=device-width">${head}</head><body><h1>${title}</h1>${links.map((l) => `<a href="${l}">x</a>`).join("")}</body></html>`;

const canonical = (href: string) => `<link rel="canonical" href="${href}">`;

const SITE: Record<string, Route> = {
	"https://example.com/": {
		body: page("Strona główna firmy Example", [
			"/a",
			"/b",
			"/broken",
			"/old",
			"https://other.com/",
		]),
	},
	"http://example.com/": { status: 301, headers: { location: "https://example.com/" } },
	"https://www.example.com/": { status: 301, headers: { location: "https://example.com/" } },
	"https://example.com/robots.txt": {
		body: "User-agent: *\nDisallow: /admin\nSitemap: https://example.com/sitemap.xml",
		headers: { "content-type": "text/plain" },
	},
	// The root without a trailing slash and a repeated entry: both are the same pages again.
	"https://example.com/sitemap.xml": {
		body: "<urlset><url><loc>https://example.com</loc></url><url><loc>https://example.com/c</loc></url><url><loc>https://example.com/c</loc></url></urlset>",
		headers: { "content-type": "application/xml" },
	},
	"https://example.com/a": { body: page("Ten sam tytuł") },
	"https://example.com/b": { body: page("Ten sam tytuł") },
	"https://example.com/c": { body: page("Podstrona C") },
	"https://example.com/broken": { status: 404, body: "nie ma" },
	"https://example.com/old": { status: 301, headers: { location: "https://example.com/a" } },

	// Filtered listings that point their canonical at the plain listing.
	"https://lista.example.com/": {
		body: page("Strona z listą", ["/lista", "/lista?typ=1", "/lista?typ=2"]),
	},
	"https://lista.example.com/lista": {
		body: page("Lista", [], canonical("https://lista.example.com/lista")),
	},
	"https://lista.example.com/lista?typ=1": {
		body: page("Lista", [], canonical("https://lista.example.com/lista")),
	},
	"https://lista.example.com/lista?typ=2": {
		body: page("Lista", [], canonical("/lista")),
	},
};

const originalFetch = globalThis.fetch;
const requested: string[] = [];

beforeEach(() => {
	requested.length = 0;
	mock.method(dns, "lookup", async () => [{ address: "93.184.216.34", family: 4 }]);
	globalThis.fetch = async (input: string | URL | Request) => {
		const url = String(input);
		requested.push(url);
		if (url.startsWith("https://www.googleapis.com/pagespeedonline/")) {
			return Response.json({
				lighthouseResult: {
					categories: { performance: { score: 0.42 } },
					audits: {
						"largest-contentful-paint": { numericValue: 5200 },
						"cumulative-layout-shift": { numericValue: 0.05 },
						"total-blocking-time": { numericValue: 300 },
						"first-contentful-paint": { numericValue: 2100 },
					},
				},
			});
		}
		const route = SITE[url];
		if (!route) {
			return new Response("nie ma", { status: 404, headers: { "content-type": "text/html" } });
		}
		return new Response(route.body ?? null, {
			status: route.status ?? 200,
			headers: { "content-type": "text/html; charset=utf-8", ...route.headers },
		});
	};
});

afterEach(() => {
	globalThis.fetch = originalFetch;
	mock.restoreAll();
});

const check = (checks: { id: string; status: string; detail: string }[], id: string) =>
	checks.find((c) => c.id === id);

test("runSeoAudit crawls a small site once per address and reports what is wrong with it", async () => {
	const { report, state } = await runSeoAudit({ url: "example.com" }, "");

	assert.equal(state, null);
	assert.equal(report.done, true);
	assert.equal(report.target, "https://example.com");
	assert.deepEqual(
		report.pages.map((p) => new URL(p.url).pathname).sort(),
		["/", "/a", "/b", "/broken", "/c", "/old"].sort(),
	);
	for (const [id, expected] of [
		["https", "ok"],
		["http-redirect", "ok"],
		["www", "ok"],
		["robots-block", "ok"],
		["sitemap", "ok"],
		["broken", "fail"],
		["redirect-links", "warn"],
		["duplicate-titles", "warn"],
		["psi-score", "fail"],
		["lcp", "fail"],
	]) {
		assert.equal(check(report.checks, id)?.status, expected, id);
	}
	assert.match(check(report.checks, "sitemap")?.detail ?? "", /\(2 adresów\)/);
	assert.doesNotMatch(check(report.checks, "duplicate-titles")?.detail ?? "", /Strona główna/);
	assert.equal(report.speed?.score, 42);
	assert.ok(report.score > 0 && report.score < 100);
	assert.ok(!requested.includes("https://other.com/"));
});

test("runSeoAudit does not count pages that point their canonical elsewhere as duplicates", async () => {
	const { report } = await runSeoAudit({ url: "lista.example.com" }, "");
	const duplicates = check(report.checks, "duplicate-titles");

	assert.equal(report.pages.length, 4);
	assert.equal(duplicates?.status, "ok");
	assert.match(duplicates?.detail ?? "", /pominięto 2 z canonical na inny adres/);
});

test("runSeoAudit never fetches queued URLs from another host or a private address", async () => {
	const { report } = await runSeoAudit(
		{
			url: "example.com",
			state: {
				origin: "https://example.com",
				queue: ["http://127.0.0.1/admin", "https://evil.com/", "https://example.com/c"],
				seen: [],
				pages: [],
				siteChecks: [],
				speed: null,
			},
		},
		"",
	);

	assert.ok(!requested.includes("http://127.0.0.1/admin"));
	assert.ok(!requested.includes("https://evil.com/"));
	assert.ok(report.pages.map((p) => p.url).includes("https://example.com/c"));
});
