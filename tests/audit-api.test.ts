import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { admitAudit, putJob, readBody, takeJob } from "../src/lib/audit-api.ts";
import { SeoAuditRequestSchema, type SeoState } from "../src/lib/audit/schema.ts";

const originalFetch = globalThis.fetch;
const env = process.env as Record<string, string | undefined>;
const saved = { secret: env.RECAPTCHA_SECRET_KEY, nodeEnv: env.NODE_ENV };
let verdict: unknown = { success: true };

beforeEach(() => {
  verdict = { success: true };
  globalThis.fetch = async () => Response.json(verdict);
  env.NODE_ENV = "production";
  env.RECAPTCHA_SECRET_KEY = "test-secret";
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  env.NODE_ENV = saved.nodeEnv;
  env.RECAPTCHA_SECRET_KEY = saved.secret;
});

// The start limit is process-wide, so each test stays well under it except the last one.

test("admitAudit lets a request with a valid reCAPTCHA token through", async () => {
  await admitAudit("token");
});

test("admitAudit fails closed: no token, no secret, Google says no, Google unreachable", async () => {
  await assert.rejects(admitAudit(undefined), { code: "FORBIDDEN", status: 403 });

  delete env.RECAPTCHA_SECRET_KEY;
  await assert.rejects(admitAudit("token"), { code: "FORBIDDEN" });
  env.RECAPTCHA_SECRET_KEY = "test-secret";

  verdict = { success: false };
  await assert.rejects(admitAudit("token"), { code: "FORBIDDEN" });

  globalThis.fetch = async () => {
    throw new TypeError("network down");
  };
  await assert.rejects(admitAudit("token"), { code: "FORBIDDEN" });
});

test("admitAudit skips reCAPTCHA only in next dev without a secret", async () => {
  env.NODE_ENV = "development";
  delete env.RECAPTCHA_SECRET_KEY;
  globalThis.fetch = async () => {
    throw new Error("must not call Google");
  };
  await admitAudit(undefined);
});

test("readBody turns the first schema issue into a 400 with its field", async () => {
  const req = (body: string) => new Request("http://x/api", { method: "POST", body });

  assert.deepEqual(await readBody(req('{"url":"example.com"}'), SeoAuditRequestSchema), {
    url: "example.com",
  });
  await assert.rejects(readBody(req("nie json"), SeoAuditRequestSchema), { status: 400 });
  await assert.rejects(readBody(req('{"url":""}'), SeoAuditRequestSchema), {
    status: 400,
    field: "url",
  });
  await assert.rejects(readBody(req(`{"url":"${"x".repeat(20_000)}"}`), SeoAuditRequestSchema), {
    status: 413,
  });
});

test("a job can be taken once, so parallel calls cannot crawl the same batch", () => {
  const state: SeoState = {
    origin: "https://example.com",
    queue: [],
    seen: [],
    pages: [],
    siteChecks: [],
    speed: null,
  };
  putJob("job-1", state);
  assert.equal(takeJob("job-1"), state);
  assert.equal(takeJob("job-1"), null);
});

test("admitAudit stops new audits over the per-minute limit", async () => {
  let refused = 0;
  for (let i = 0; i < 12; i++) {
    await admitAudit("token").catch((err: { code?: string }) => {
      if (err.code === "RATE_LIMITED") refused++;
    });
  }
  assert.ok(refused > 0);
});
