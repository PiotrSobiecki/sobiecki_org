import type { z } from "zod";
import { AuditError } from "./audit/errors.ts";
import type { SeoState } from "./audit/schema.ts";

const MAX_BODY_CHARS = 10_000;
const START_WINDOW_MS = 60_000;
// Process-wide like the contact form: client IP headers are not trusted here.
const MAX_STARTS_PER_WINDOW = 10;
let windowStartedAt = 0;
let starts = 0;

const JOB_TTL_MS = 3_600_000;
const MAX_JOBS = 200;
// shortcut: jobs live in this process's memory; with more than one Railway replica, move them to Redis.
const jobs = new Map<string, { state: SeoState; expires: number }>();

/** Removes and returns a job's state, so two parallel calls cannot crawl the same batch. */
export function takeJob(id: string): SeoState | null {
  const job = jobs.get(id);
  jobs.delete(id);
  return job && job.expires > Date.now() ? job.state : null;
}

export function putJob(id: string, state: SeoState): void {
  const now = Date.now();
  for (const [key, job] of jobs) if (job.expires <= now) jobs.delete(key);
  const oldest = jobs.keys().next().value;
  if (jobs.size >= MAX_JOBS && oldest !== undefined) jobs.delete(oldest);
  jobs.set(id, { state, expires: now + JOB_TTL_MS });
}

/** Reads a small JSON body and validates it; the first issue becomes a 400 with its field. */
export async function readBody<T extends z.ZodType>(req: Request, schema: T): Promise<z.output<T>> {
  const text = await req.text().catch(() => "");
  if (text.length > MAX_BODY_CHARS) throw new AuditError("Za duże zapytanie.", "VALIDATION", 413);
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new AuditError("Nieprawidłowe zapytanie.", "VALIDATION", 400);
  }
  const parsed = schema.safeParse(raw);
  if (parsed.success) return parsed.data;
  const [issue] = parsed.error.issues;
  const field = issue?.path.length ? issue.path.map(String).join(".") : undefined;
  throw new AuditError(issue?.message ?? "Nieprawidłowe zapytanie.", "VALIDATION", 400, field);
}

/**
 * Every new audit costs a crawl and PageSpeed quota: a process-wide limit and
 * reCAPTCHA come first. Fails closed when the secret or Google's answer is missing.
 */
export async function admitAudit(token: string | undefined): Promise<void> {
  const now = Date.now();
  if (now - windowStartedAt >= START_WINDOW_MS) {
    windowStartedAt = now;
    starts = 0;
  }
  if (++starts > MAX_STARTS_PER_WINDOW) {
    throw new AuditError("Za dużo audytów naraz. Spróbuj za minutę.", "RATE_LIMITED", 429);
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  // `next dev` without keys: lets scripts/audyt.sh and local testing run audits.
  if (!secret && process.env.NODE_ENV === "development") return;
  const forbidden = new AuditError("Potwierdź, że nie jesteś robotem.", "FORBIDDEN", 403, "token");
  if (!secret || !token) throw forbidden;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(10_000),
    });
    const verdict: unknown = await res.json();
    const ok = res.ok && typeof verdict === "object" && verdict !== null && "success" in verdict;
    if (!ok || verdict.success !== true) throw forbidden;
  } catch {
    throw forbidden;
  }
}

export function errorResponse(err: unknown): Response {
  if (err instanceof AuditError) {
    return Response.json(
      { error: err.message, code: err.code, ...(err.field ? { field: err.field } : {}) },
      { status: err.status },
    );
  }
  console.error(
    JSON.stringify({ message: "audit failed", error: err instanceof Error ? err.message : String(err) }),
  );
  return Response.json({ error: "Audyt się nie udał. Spróbuj ponownie." }, { status: 500 });
}
