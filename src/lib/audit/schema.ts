import { z } from "zod";

// Internal shapes: the crawl state stays on the server, so no runtime validation is needed.

export type CheckStatus = "ok" | "warn" | "fail" | "skip";

export interface Check {
	id: string;
	group: string;
	label: string;
	status: CheckStatus;
	weight: number;
	detail: string;
	fix: string;
}

export interface PageRow {
	url: string;
	status: number;
	title: string;
	description: string;
	h1: number;
	words: number;
	ms: number;
	noindex: boolean;
	location?: string;
	/** Set only when the page points its canonical at another address. */
	canonical?: string;
}

export interface Speed {
	score: number;
	lcpMs: number;
	cls: number;
	tbtMs: number;
	fcpMs: number;
}

/** Crawl state kept on the server between batches, under a random job id. */
export interface SeoState {
	origin: string;
	queue: string[];
	seen: string[];
	pages: PageRow[];
	siteChecks: Check[];
	speed: Speed | null;
}

const UrlSchema = z.string().trim().min(1, "Podaj adres strony").max(2000);
const CaptchaTokenSchema = z.string().max(8192).optional();

/** Without `job` this starts an audit (reCAPTCHA token required); with it, continues one. */
export const SeoAuditRequestSchema = z.object({
	url: UrlSchema,
	job: z.uuid().optional(),
	token: CaptchaTokenSchema,
});

export const SecurityAuditRequestSchema = z.object({
	url: UrlSchema,
	zgoda: z.literal(true, "Potwierdź, że masz zgodę właściciela domeny"),
	token: CaptchaTokenSchema,
});

export interface Report {
	kind: "seo" | "bezp";
	target: string;
	score: number;
	checks: Check[];
	pages: PageRow[];
	speed: Speed | null;
	done: boolean;
}

/** One crawl step; `state` is null once the audit is done. */
export interface SeoStep {
	report: Report;
	state: SeoState | null;
}

/** What the API answers; pass `job` back until it is null. */
export interface SeoAuditResponse {
	report: Report;
	job: string | null;
}
