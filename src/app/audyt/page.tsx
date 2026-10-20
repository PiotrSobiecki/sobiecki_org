import type { Metadata } from "next";
import { AuditTool } from "@/components/audit/audit-tool";
import { Footer } from "@/components/ui/footer";
import { Navbar } from "@/components/ui/navbar";

const description =
  "Darmowy audyt SEO do 500 podstron i szybki skan bezpieczeństwa strony: SSL, nagłówki, SPF, DKIM, DMARC. Wynik od razu, bez rejestracji.";

export const metadata: Metadata = {
  title: "Darmowy audyt SEO i bezpieczeństwa strony",
  description,
  alternates: { canonical: "/audyt" },
  openGraph: {
    title: "Darmowy audyt SEO i bezpieczeństwa strony | Piotr Sobiecki",
    description,
    url: "https://sobiecki.org/audyt",
  },
};

export default function AudytPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <section className="section">
        <div className="container">
          <div className="section-header" style={{ textAlign: "center", marginBottom: "48px" }}>
            <p className="eyebrow">darmowe narzędzie</p>
            <h1 style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)" }}>
              Darmowy audyt SEO i bezpieczeństwa strony
            </h1>
            <p>
              Wpisz adres i zobacz, co poprawić. Wynik od razu, bez rejestracji. Narzędzie korzysta
              tylko z danych publicznych.
            </p>
          </div>
          <AuditTool />
        </div>
      </section>
      <Footer />
    </main>
  );
}
