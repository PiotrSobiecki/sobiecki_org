import Link from "next/link";
import { toFix } from "@/lib/audit/checks";
import type { Check, Report } from "@/lib/audit/schema";

const STATUS: Record<Check["status"], { label: string; className: string }> = {
  ok: { label: "OK", className: "text-emerald-400 border-emerald-400/40" },
  warn: { label: "Uwaga", className: "text-amber-400 border-amber-400/40" },
  fail: { label: "Błąd", className: "text-red-400 border-red-400/40" },
  skip: { label: "Pominięte", className: "text-white/50 border-white/20" },
};

function scoreClass(score: number): string {
  if (score >= 90) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-red-400";
}

function CheckRow({ check }: { check: Check }) {
  const status = STATUS[check.status];
  return (
    <li className="flex items-start gap-4 border-b border-white/10 py-4 last:border-0">
      <span className={`shrink-0 border px-2 py-0.5 text-xs ${status.className}`}>{status.label}</span>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-medium text-white">{check.label}</span>
        <span className="break-words text-sm text-white/60">{check.detail}</span>
        {(check.status === "fail" || check.status === "warn") && (
          <span className="text-sm text-white/80">Jak naprawić: {check.fix}</span>
        )}
      </div>
    </li>
  );
}

export function ReportView({ report, running }: { report: Report; running: boolean }) {
  const priorities = toFix(report.checks).slice(0, 6);
  const groups = [...new Set(report.checks.map((c) => c.group))];
  const speed = report.speed;

  return (
    <section className="flex flex-col gap-8" aria-live="polite">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-white/60">
            {report.kind === "seo" ? "Audyt SEO" : "Bezpieczeństwo"}: {report.target}
          </p>
          <p className={`text-6xl font-semibold ${scoreClass(report.score)}`}>
            {report.score}
            <span className="text-2xl text-white/50"> / 100</span>
          </p>
          {report.kind === "seo" && (
            <p className="text-sm text-white/60">
              {running
                ? `Sprawdzam dalej: przeczytano ${report.pages.length} podstron, wynik może się zmienić.`
                : `Przeczytano ${report.pages.length} podstron.`}
            </p>
          )}
        </div>
        <button type="button" className="btn print:hidden" onClick={() => window.print()}>
          Zapisz jako PDF
        </button>
      </div>

      {speed && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-white">Szybkość na telefonie (Google PageSpeed)</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {[
              ["Wynik", `${speed.score}/100`],
              ["LCP", `${(speed.lcpMs / 1000).toFixed(1)} s`],
              ["CLS", String(speed.cls)],
              ["TBT", `${speed.tbtMs} ms`],
              ["FCP", `${(speed.fcpMs / 1000).toFixed(1)} s`],
            ].map(([name, value]) => (
              <div key={name} className="flex flex-col">
                <span className="text-xs text-white/50">{name}</span>
                <span className="text-lg font-semibold text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {priorities.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-2 text-white">Najważniejsze do poprawy</h2>
          <ul>
            {priorities.map((c) => (
              <CheckRow key={c.id} check={c} />
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-semibold mb-2 text-white">Wszystkie sprawdzenia</h2>
        {groups.map((group) => (
          <div key={group} className="mt-6">
            <h3 className="text-sm font-semibold text-white/60">{group}</h3>
            <ul>
              {report.checks
                .filter((c) => c.group === group)
                .map((c) => (
                  <CheckRow key={c.id} check={c} />
                ))}
            </ul>
          </div>
        ))}
      </div>

      {report.pages.length > 0 && (
        <div className="card overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4 text-white">Podstrony ({report.pages.length})</h2>
          <table className="w-full text-left text-sm text-white/80">
            <thead className="text-white/50">
              <tr>
                <th className="py-2 pr-4 font-normal">Adres</th>
                <th className="py-2 pr-4 font-normal">Status</th>
                <th className="py-2 pr-4 font-normal">Tytuł</th>
                <th className="py-2 pr-4 font-normal">H1</th>
                <th className="py-2 pr-4 font-normal">Słowa</th>
                <th className="py-2 font-normal">Czas</th>
              </tr>
            </thead>
            <tbody>
              {report.pages.map((p) => {
                const bad = p.status === 0 || p.status >= 400;
                const moved = p.status >= 300 && p.status < 400;
                return (
                  <tr key={p.url} className="border-t border-white/10">
                    <td className="max-w-xs truncate py-2 pr-4" title={p.url}>
                      {new URL(p.url).pathname}
                    </td>
                    <td className={`py-2 pr-4 ${bad ? "text-red-400" : moved ? "text-amber-400" : ""}`}>
                      {p.status || "brak"}
                    </td>
                    <td className="max-w-xs truncate py-2 pr-4" title={p.title}>
                      {p.title || "—"}
                    </td>
                    <td className="py-2 pr-4">{p.h1}</td>
                    <td className="py-2 pr-4">{p.words}</td>
                    <td className="py-2">{p.ms ? `${p.ms} ms` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!running && (
        <div className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div>
            <h2 className="text-xl font-semibold text-white">Chcesz, żebym to poprawił?</h2>
            <p className="text-white/70">
              Wynik to lista zadań, a nie gwarancja pozycji w Google. Napisz, a powiem, co z tej listy
              da się zrobić i ile to potrwa.
            </p>
          </div>
          <Link href="/#kontakt" className="btn btn_primary shrink-0">
            Napisz do mnie
          </Link>
        </div>
      )}
    </section>
  );
}
