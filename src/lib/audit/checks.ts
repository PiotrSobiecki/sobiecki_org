import type { Check, CheckStatus } from "./schema.ts";

export interface CheckDef {
	id: string;
	group: string;
	label: string;
	weight: number;
	fix: string;
}

export function result(def: CheckDef, status: CheckStatus, detail: string): Check {
	return { ...def, status, detail };
}

const CREDIT: Record<CheckStatus, number> = { ok: 1, warn: 0.5, fail: 0, skip: 0 };

/** 0–100: weighted share of passed checks; skipped checks count neither way. */
export function score(checks: Check[]): number {
	const counted = checks.filter((c) => c.status !== "skip");
	const total = counted.reduce((sum, c) => sum + c.weight, 0);
	if (total === 0) return 0;
	const earned = counted.reduce((sum, c) => sum + c.weight * CREDIT[c.status], 0);
	return Math.round((100 * earned) / total);
}

/** Failures first, then warnings, heaviest first — the order a person should fix them in. Optional (weight 0) checks are left out. */
export function toFix(checks: Check[]): Check[] {
	const rank = (c: Check) => (c.status === "fail" ? 0 : 1);
	return checks
		.filter((c) => c.weight > 0 && (c.status === "fail" || c.status === "warn"))
		.sort((a, b) => rank(a) - rank(b) || b.weight - a.weight);
}

/** "a, b, c i 4 więcej" — keeps check details readable when a list is long. */
export function sample(items: string[], max = 3): string {
	const shown = items.slice(0, max).join(", ");
	return items.length > max ? `${shown} i ${items.length - max} więcej` : shown;
}
