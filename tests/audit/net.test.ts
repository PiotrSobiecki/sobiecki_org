import assert from "node:assert/strict";
import dns from "node:dns/promises";
import { afterEach, mock, test } from "node:test";
import { checkTarget, isPublicUrl, normalizeTarget } from "../../src/lib/audit/net.ts";

afterEach(() => mock.restoreAll());

test("normalizeTarget adds https:// to a bare domain and drops the fragment", () => {
	assert.equal(normalizeTarget("example.pl/oferta#cennik").href, "https://example.pl/oferta");
});

for (const input of [
	"localhost",
	"http://127.0.0.1/",
	"http://2130706433/",
	"http://10.1.2.3",
	"http://172.20.0.1",
	"http://192.168.0.10",
	"http://169.254.169.254/latest/meta-data",
	"http://[::1]/",
	"https://router.local",
	"https://app.railway.internal",
	"https://example.com:8080",
	"https://user:pass@example.com",
	"ftp://example.com",
	"https://",
]) {
	test(`normalizeTarget refuses ${input}`, () => {
		assert.throws(() => normalizeTarget(input));
	});
}

test("isPublicUrl accepts ordinary public sites", () => {
	assert.equal(isPublicUrl(new URL("https://livemusicplay.pl/")), true);
	assert.equal(isPublicUrl(new URL("http://8.8.8.8/")), true);
});

test("checkTarget refuses a public-looking name that resolves to a private address", async () => {
	mock.method(dns, "lookup", async () => [{ address: "10.0.0.5", family: 4 }]);
	await assert.rejects(checkTarget("rebind.example.com"), { code: "VALIDATION", field: "url" });

	mock.method(dns, "lookup", async () => [{ address: "fd00::1", family: 6 }]);
	await assert.rejects(checkTarget("rebind.example.com"), { code: "VALIDATION" });
});

test("checkTarget refuses a domain that does not exist", async () => {
	mock.method(dns, "lookup", async () => {
		throw Object.assign(new Error("ENOTFOUND"), { code: "ENOTFOUND" });
	});
	await assert.rejects(checkTarget("nie-ma-takiej.example"), /Nie znaleziono domeny/);
});

test("checkTarget accepts a domain with public addresses", async () => {
	mock.method(dns, "lookup", async () => [{ address: "93.184.216.34", family: 4 }]);
	assert.equal((await checkTarget("example.com")).href, "https://example.com/");
});
