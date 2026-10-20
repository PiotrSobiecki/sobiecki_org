import { admitAudit, errorResponse, putJob, readBody, takeJob } from "@/lib/audit-api";
import { AuditError } from "@/lib/audit/errors";
import { SeoAuditRequestSchema, type SeoAuditResponse, type SeoState } from "@/lib/audit/schema";
import { runSeoAudit } from "@/lib/audit/seo";

/** Without `job` starts an audit; with it, crawls the next batch until `job` comes back null. */
export async function POST(req: Request) {
  try {
    const input = await readBody(req, SeoAuditRequestSchema);
    let state: SeoState | undefined;
    if (input.job) {
      state = takeJob(input.job) ?? undefined;
      if (!state) throw new AuditError("Audyt wygasł. Zacznij od nowa.", "NOT_FOUND", 404, "job");
    } else {
      await admitAudit(input.token);
    }

    const step = await runSeoAudit({ url: input.url, state }, process.env.PAGESPEED_API_KEY ?? "");
    const job = input.job ?? crypto.randomUUID();
    if (step.state) putJob(job, step.state);
    const data: SeoAuditResponse = { report: step.report, job: step.state ? job : null };
    return Response.json({ data });
  } catch (err) {
    return errorResponse(err);
  }
}
