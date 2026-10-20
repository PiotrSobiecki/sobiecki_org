export type AuditErrorCode = "VALIDATION" | "NOT_FOUND" | "FORBIDDEN" | "RATE_LIMITED";

/** A failure the audit API reports to the visitor as `{ error, code, field? }` with `status`. */
export class AuditError extends Error {
	code: AuditErrorCode;
	status: number;
	field?: string;

	constructor(message: string, code: AuditErrorCode, status: number, field?: string) {
		super(message);
		this.name = "AuditError";
		this.code = code;
		this.status = status;
		this.field = field;
	}
}
