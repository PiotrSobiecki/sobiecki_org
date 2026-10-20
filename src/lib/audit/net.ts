import dns from "node:dns/promises";
import { AuditError } from "./errors.ts";

const USER_AGENT = "AudytStron/1.0 (+https://sobiecki.org/audyt)";
const MAX_BODY_CHARS = 2_000_000;
const BLOCKED_SUFFIXES = [".local", ".localhost", ".internal", ".lan", ".home.arpa", ".test"];

function isPrivateIpv4(host: string): boolean {
	const parts = host.split(".").map(Number);
	if (parts.length !== 4 || parts.some((p) => !Number.isInteger(p))) return false;
	const [a = 0, b = 0] = parts;
	return (
		a === 0 ||
		a === 10 ||
		a === 127 ||
		(a === 169 && b === 254) ||
		(a === 172 && b >= 16 && b <= 31) ||
		(a === 192 && b === 168) ||
		(a === 100 && b >= 64 && b <= 127) ||
		a >= 224
	);
}

function isPrivateIpv6(address: string): boolean {
	const a = address.toLowerCase();
	const mapped = a.match(/^::ffff:(d+.d+.d+.d+)$/);
	if (mapped) return isPrivateIpv4(mapped[1] ?? "");
	return a === "::" || a === "::1" || /^(fc|fd|fe[89ab])/.test(a);
}

type Resolution = "public" | "private" | "missing";
const RESOLVE_TTL_MS = 60_000;
// A crawl asks about the same host hundreds of times; on Workers each lookup is a subrequest.
const resolved = new Map<string, { at: number; answer: Promise<Resolution> }>();

async function lookup(hostname: string): Promise<Resolution> {
	try {
		const addresses = await dns.lookup(hostname, { all: true, verbatim: true });
		if (addresses.length === 0) return "missing";
		const isPrivate = (a: { address: string; family: number }) =>
			a.family === 4 ? isPrivateIpv4(a.address) : isPrivateIpv6(a.address);
		return addresses.some(isPrivate) ? "private" : "public";
	} catch {
		return "missing";
	}
}

/**
 * A Node server can reach private networks, so a public-looking name must also
 * resolve only to public addresses.
 * shortcut: fetch resolves the name again, leaving a DNS-rebinding window;
 * pin the address with a custom dispatcher if the tool ever runs next to sensitive services.
 */
function resolve(hostname: string): Promise<Resolution> {
	const now = Date.now();
	const hit = resolved.get(hostname);
	if (hit && now - hit.at < RESOLVE_TTL_MS) return hit.answer;
	if (resolved.size > 1000) resolved.clear();
	const answer = lookup(hostname);
	resolved.set(hostname, { at: now, answer });
	return answer;
}

/** Whether the URL points at the public internet on a default port, judged by its name. */
export function isPublicUrl(url: URL): boolean {
	const host = url.hostname.toLowerCase();
	return (
		(url.protocol === "https:" || url.protocol === "http:") &&
		url.port === "" &&
		url.username === "" &&
		url.password === "" &&
		host.includes(".") &&
		!host.startsWith("[") &&
		!BLOCKED_SUFFIXES.some((s) => host.endsWith(s)) &&
		!isPrivateIpv4(host)
	);
}

/** Turns what a person typed ("example.pl", "https://example.pl/x") into a checked URL. */
export function normalizeTarget(input: string): URL {
	const raw = /^[a-z][a-z0-9+.-]*:\/\//i.test(input) ? input : `https://${input}`;
	let url: URL;
	try {
		url = new URL(raw);
	} catch {
		throw new AuditError("To nie wygląda na adres strony", "VALIDATION", 400, "url");
	}
	if (!isPublicUrl(url)) {
		throw new AuditError(
			"Sprawdzam tylko publiczne adresy http(s) bez portu",
			"VALIDATION",
			400,
			"url",
		);
	}
	url.hash = "";
	return url;
}

/** normalizeTarget plus DNS: the address must exist and resolve only to public IPs. */
export async function checkTarget(input: string): Promise<URL> {
	const url = normalizeTarget(input);
	const where = await resolve(url.hostname);
	if (where === "missing") {
		throw new AuditError(`Nie znaleziono domeny ${url.hostname}`, "VALIDATION", 400, "url");
	}
	if (where === "private") {
		throw new AuditError("Ten adres prowadzi do sieci prywatnej", "VALIDATION", 400, "url");
	}
	return url;
}

export interface Fetched {
	url: string;
	status: number;
	headers: Headers;
	body: string;
	ms: number;
	location?: string;
}

/** One request, no redirect following; null when the host does not answer in time. */
export async function fetchOnce(
	url: string,
	{ timeoutMs = 10_000, readBody = true } = {},
): Promise<Fetched | null> {
	if ((await resolve(new URL(url).hostname)) !== "public") return null;
	const started = Date.now();
	try {
		const res = await fetch(url, {
			redirect: "manual",
			headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml,*/*" },
			signal: AbortSignal.timeout(timeoutMs),
		});
		const type = res.headers.get("content-type") ?? "";
		const size = Number(res.headers.get("content-length") ?? 0);
		const textual = /text|html|xml|json/.test(type);
		const body =
			readBody && textual && size < 5_000_000 ? (await res.text()).slice(0, MAX_BODY_CHARS) : "";
		if (!body) await res.body?.cancel();
		const location = res.headers.get("location");
		return {
			url,
			status: res.status,
			headers: res.headers,
			body,
			ms: Date.now() - started,
			...(location ? { location: new URL(location, url).href } : {}),
		};
	} catch {
		return null;
	}
}

/** Follows up to five redirects, refusing any hop that leaves the public internet. */
export async function follow(
	url: string,
	opts: { timeoutMs?: number } = {},
): Promise<{ final: Fetched; hops: string[] } | null> {
	const hops: string[] = [];
	let current = url;
	for (let i = 0; i < 6; i++) {
		const res = await fetchOnce(current, opts);
		if (!res) return null;
		if (!res.location || res.status < 300 || res.status >= 400) return { final: res, hops };
		const next = new URL(res.location);
		if (!isPublicUrl(next)) return { final: res, hops };
		hops.push(current);
		current = next.href;
	}
	return null;
}

/** Fetches JSON from a third-party API; null on any failure so callers can skip the check. */
export async function fetchJson(
	url: string,
	{ timeoutMs = 15_000, accept = "application/json" } = {},
): Promise<unknown> {
	try {
		const res = await fetch(url, {
			headers: { "user-agent": USER_AGENT, accept },
			signal: AbortSignal.timeout(timeoutMs),
		});
		if (!res.ok) return null;
		return (await res.json()) as unknown;
	} catch {
		return null;
	}
}
