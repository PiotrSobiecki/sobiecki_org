import assert from "node:assert/strict";
import dns from "node:dns/promises";
import { afterEach, beforeEach, mock, test } from "node:test";
import { compareVersions, runSecurityAudit } from "../../src/lib/audit/security.ts";

const TYPES: Record<string, number> = { TXT: 16, MX: 15, CAA: 257 };

/**
 * DNS-over-HTTPS that answers like a real zone: NXDOMAIN (3) for a name with nothing at or
 * below it, NOERROR (0) otherwise; `wildcard` makes every name exist, `signed` sets the
 * DNSSEC (AD) flag. Keys are bare names for TXT and "<TYPE> <name>" for other types.
 */
function fakeDns(records: Record<string, string[]>, { wildcard = false, signed = false } = {}) {
	const names = Object.keys(records).map((key) => key.split(" ").pop() ?? key);
	return (name: string, type: string) => {
		const exists = wildcard || names.some((n) => n === name || n.endsWith(`.${name}`));
		const key = type === "TXT" ? name : `${type} ${name}`;
		return Response.json({
			Status: exists ? 0 : 3,
			AD: signed,
			Answer: (records[key] ?? []).map((data) => ({
				type: TYPES[type],
				data: type === "TXT" ? `"${data}"` : data,
			})),
		});
	};
}

const WORDPRESS_ZONE: Record<string, string[]> = {
	"example.com": ["v=spf1 include:_spf.google.com ~all"],
	"_dmarc.example.com": ["v=DMARC1; p=none; rua=mailto:d@example.com"],
	"google._domainkey.example.com": ["v=DKIM1; k=rsa; p=MIIBIjAN"],
};

const originalFetch = globalThis.fetch;

function serve(answerDns: (name: string, type: string) => Response) {
	globalThis.fetch = async (input: string | URL | Request) => {
		const url = new URL(String(input));
		if (url.hostname === "cloudflare-dns.com") {
			return answerDns(url.searchParams.get("name") ?? "", url.searchParams.get("type") ?? "TXT");
		}
		if (url.hostname === "crt.sh") return new Response("Bad Gateway", { status: 502 });
		if (url.hostname === "api.certspotter.com") {
			const future = new Date(Date.now() + 60 * 86_400_000).toISOString();
			return Response.json([
				{ dns_names: ["example.com", "www.example.com"], not_after: future },
				{ dns_names: ["test.example.com"], not_after: future },
				{ dns_names: ["blog.example.com"], not_after: future },
			]);
		}
		if (url.hostname === "api.wordpress.org") {
			return url.pathname.startsWith("/core")
				? Response.json({ offers: [{ current: "6.8.3" }] })
				: Response.json({ version: "5.0.0" });
		}
		if (url.href === "http://example.com/") {
			return new Response(null, { status: 301, headers: { location: "https://example.com/" } });
		}
		if (url.href === "https://example.com/") {
			return new Response(
				'<html><head><meta name="generator" content="WordPress 6.1"><link href="/wp-content/plugins/contact-form-7/style.css?ver=5.7.1"></head></html>',
				{
					headers: {
						"content-type": "text/html",
						server: "Apache/2.4.41 (Ubuntu)",
						"x-content-type-options": "nosniff",
						"set-cookie": "sess=1; Path=/",
					},
				},
			);
		}
		if (url.href === "https://test.example.com/") return new Response("panel testowy");
		return new Response("nie ma", { status: 404 });
	};
}

beforeEach(() => {
	mock.method(dns, "lookup", async () => [{ address: "93.184.216.34", family: 4 }]);
	serve(fakeDns(WORDPRESS_ZONE));
});

afterEach(() => {
	globalThis.fetch = originalFetch;
	mock.restoreAll();
});

const dkimOf = async () =>
	(await runSecurityAudit("example.com")).checks.find((c) => c.id === "dkim");

test("runSecurityAudit flags what an outsider can see on a neglected WordPress site", async () => {
	const report = await runSecurityAudit("example.com");
	const status = (id: string) => report.checks.find((c) => c.id === id)?.status;

	assert.equal(report.kind, "bezp");
	for (const [id, expected] of [
		["https", "ok"],
		["http-redirect", "ok"],
		["cert-expiry", "ok"],
		["hsts", "fail"],
		["nosniff", "ok"],
		["server-version", "warn"],
		["cookies", "warn"],
		["spf", "ok"],
		["dmarc", "warn"],
		["dkim", "ok"],
		["security-txt", "warn"],
		["wp-core", "fail"],
		["wp-plugins", "ok"],
		["subdomains", "warn"],
		["caa", "warn"],
		["hsts-preload", "warn"],
		["coop", "warn"],
		["mta-sts", "skip"],
		["tls-rpt", "skip"],
		["dnssec", "warn"],
	]) {
		assert.equal(status(id), expected, id);
	}
	assert.match(
		report.checks.find((c) => c.id === "subdomains")?.detail ?? "",
		/test\.example\.com/,
	);
	assert.ok(report.score > 0 && report.score < 100);
});

test("DKIM: finds a Resend key on a sending subdomain", async () => {
	serve(fakeDns({ "resend._domainkey.send.example.com": ["p=MIGfMA0GCSqGSIb3"] }));
	const dkim = await dkimOf();

	assert.equal(dkim?.status, "ok");
	assert.match(dkim?.detail ?? "", /resend\._domainkey\.send\.example\.com/);
});

test("DKIM: a key under a selector nobody guesses still counts", async () => {
	serve(fakeDns({ "x9q2024._domainkey.example.com": ["v=DKIM1; p=MIIBIjAN"] }));
	const dkim = await dkimOf();

	assert.equal(dkim?.status, "ok");
	assert.match(dkim?.detail ?? "", /_domainkey\.example\.com \(selektor spoza listy typowych\)/);
});

test("DKIM: warns when no key exists anywhere", async () => {
	serve(fakeDns({ "example.com": ["v=spf1 -all"] }));

	assert.equal((await dkimOf())?.status, "warn");
});

test("DKIM: a wildcard zone does not pass for a key", async () => {
	serve(fakeDns({ "example.com": ["v=spf1 -all"] }, { wildcard: true }));

	assert.equal((await dkimOf())?.status, "warn");
});

test("optional checks pass on a hardened zone without moving the score", async () => {
	const before = await runSecurityAudit("example.com");
	serve(
		fakeDns(
			{
				...WORDPRESS_ZONE,
				"MX example.com": ["10 mx.example.com."],
				"_mta-sts.example.com": ["v=STSv1; id=20261020"],
				"_smtp._tls.example.com": ["v=TLSRPTv1; rua=mailto:tls@example.com"],
				"CAA example.com": ['0 issue "letsencrypt.org"'],
			},
			{ signed: true },
		),
	);
	const after = await runSecurityAudit("example.com");
	const status = (id: string) => after.checks.find((c) => c.id === id)?.status;

	for (const id of ["caa", "mta-sts", "tls-rpt", "dnssec"]) assert.equal(status(id), "ok", id);
	assert.equal(after.score, before.score);
});

test("CAA on the parent domain covers its subdomains", async () => {
	serve(fakeDns({ "CAA example.com": ['0 issue "letsencrypt.org"'] }));
	const report = await runSecurityAudit("shop.example.com");

	assert.equal(report.checks.find((c) => c.id === "caa")?.status, "ok");
});

test("runSecurityAudit rejects private addresses before sending anything", async () => {
	await assert.rejects(runSecurityAudit("http://10.0.0.1"), { code: "VALIDATION" });
});

test("compareVersions orders dotted versions numerically", () => {
	assert.equal(compareVersions("6.1", "6.8.3"), -1);
	assert.equal(compareVersions("6.8.3", "6.8.3"), 0);
	assert.equal(compareVersions("6.10", "6.9"), 1);
	assert.equal(compareVersions("5.7", "5.7.0"), 0);
});
