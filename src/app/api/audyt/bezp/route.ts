import { admitAudit, errorResponse, readBody } from "@/lib/audit-api";
import { SecurityAuditRequestSchema } from "@/lib/audit/schema";
import { runSecurityAudit } from "@/lib/audit/security";

export async function POST(req: Request) {
  try {
    const input = await readBody(req, SecurityAuditRequestSchema);
    await admitAudit(input.token);
    return Response.json({ data: await runSecurityAudit(input.url) });
  } catch (err) {
    return errorResponse(err);
  }
}
