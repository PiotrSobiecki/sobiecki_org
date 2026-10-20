"use client";

import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import type { Report, SeoAuditResponse } from "@/lib/audit/schema";
import { ReportView } from "./report-view";

type Kind = "seo" | "bezp";

const KINDS: { kind: Kind; label: string; intro: string }[] = [
  {
    kind: "seo",
    label: "Audyt SEO",
    intro:
      "Strona główna, robots.txt, mapa strony, do 500 podstron i szybkość z Google PageSpeed. Pierwszy wynik po około minucie, potem się uzupełnia.",
  },
  {
    kind: "bezp",
    label: "Bezpieczeństwo",
    intro:
      "Certyfikat SSL, nagłówki bezpieczeństwa, poczta (SPF, DKIM, DMARC), subdomeny z rejestrów certyfikatów i wersje WordPressa. Tylko dane publiczne.",
  },
];

const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
// `next dev` without keys runs audits without reCAPTCHA; the API allows the same.
const captchaRequired = Boolean(recaptchaSiteKey) || process.env.NODE_ENV !== "development";

async function post<T>(kind: Kind, body: unknown, signal: AbortSignal): Promise<T> {
  const res = await fetch(`/api/audyt/${kind}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const json = (await res.json().catch(() => null)) as { data?: T; error?: string } | null;
  if (!res.ok || !json?.data) throw new Error(json?.error ?? "Audyt się nie udał. Spróbuj ponownie.");
  return json.data;
}

const fieldClass =
  "w-full px-4 py-2 bg-[#0a0a0a] border border-white/20 text-white focus:ring-2 focus:ring-white focus:border-white";

export function AuditTool() {
  const [kind, setKind] = useState<Kind>("seo");
  const [report, setReport] = useState<Report | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const abort = useRef<AbortController | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const current = KINDS.find((k) => k.kind === kind) ?? KINDS[0];

  async function run(url: string, zgoda: boolean) {
    const ctrl = new AbortController();
    abort.current = ctrl;
    const token = recaptchaRef.current?.getValue() || undefined;
    setReport(null);
    setError("");
    setRunning(true);
    try {
      if (kind === "bezp") {
        setReport(await post<Report>("bezp", { url, zgoda, token }, ctrl.signal));
        return;
      }
      let step = await post<SeoAuditResponse>("seo", { url, token }, ctrl.signal);
      setReport(step.report);
      while (step.job) {
        step = await post<SeoAuditResponse>("seo", { url, job: step.job }, ctrl.signal);
        setReport(step.report);
      }
    } catch (err) {
      if (!ctrl.signal.aborted) setError(err instanceof Error ? err.message : String(err));
    } finally {
      // reCAPTCHA tokens are single-use.
      recaptchaRef.current?.reset();
      setRunning(false);
    }
  }

  return (
    <div className="audit-tool flex flex-col gap-10">
      <div className="max-w-3xl mx-auto w-full card flex flex-col gap-6 print:hidden">
        <div className="flex flex-wrap gap-3" role="tablist" aria-label="Rodzaj audytu">
          {KINDS.map((k) => (
            <button
              key={k.kind}
              type="button"
              role="tab"
              aria-selected={kind === k.kind}
              disabled={running}
              className={`btn ${kind === k.kind ? "btn_primary" : ""}`}
              onClick={() => {
                setKind(k.kind);
                setReport(null);
                setError("");
              }}
            >
              {k.label}
            </button>
          ))}
        </div>
        <p className="text-white/70">{current?.intro}</p>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            void run(String(form.get("url") ?? ""), form.get("zgoda") === "on");
          }}
        >
          <div>
            <label htmlFor="audit-url" className="block text-sm font-medium text-white/80 mb-1">
              Adres strony
            </label>
            <input
              id="audit-url"
              name="url"
              placeholder="example.pl"
              required
              maxLength={2000}
              autoComplete="url"
              disabled={running}
              className={fieldClass}
            />
          </div>
          {kind === "bezp" && (
            <label className="flex items-start gap-3 text-sm text-white/80">
              <input type="checkbox" name="zgoda" required className="mt-1" />
              Jestem właścicielem tej domeny albo mam zgodę jej właściciela na sprawdzenie.
            </label>
          )}
          {recaptchaSiteKey ? (
            <div className="flex justify-center">
              <ReCAPTCHA ref={recaptchaRef} sitekey={recaptchaSiteKey} size="normal" theme="dark" />
            </div>
          ) : (
            captchaRequired && (
              <p className="text-sm text-red-400">Audyt jest chwilowo niedostępny.</p>
            )
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
          {running ? (
            <button type="button" className="btn w-full" onClick={() => abort.current?.abort()}>
              Zatrzymaj
            </button>
          ) : (
            <button type="submit" className="btn btn_primary w-full">
              Sprawdź
            </button>
          )}
          {running && !report && (
            <p className="text-sm text-white/70" aria-live="polite">
              {kind === "seo"
                ? "Czytam stronę główną, robots.txt i mapę strony, mierzę szybkość w PageSpeed…"
                : "Sprawdzam SSL, nagłówki, DNS poczty i rejestry certyfikatów…"}
            </p>
          )}
        </form>
      </div>

      {report && <ReportView report={report} running={running} />}
    </div>
  );
}
