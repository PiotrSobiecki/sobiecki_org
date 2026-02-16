"use client";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

export default function PolitykaPrywatnosci() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <section className="section">
        <div className="container">
          <div className="section-header" style={{ textAlign: "center", marginBottom: "80px" }}>
            <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>Polityka prywatności</h1>
            <p>
              Niniejsza polityka prywatności określa zasady przetwarzania i
              ochrony danych osobowych użytkowników korzystających z serwisu
              Piotr Sobiecki Usługi Informatyczne.
            </p>
          </div>

          <div className="grid gap-8 max-w-4xl mx-auto">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-white">
                1. Administrator danych
              </h2>
              <p className="text-white/70">
                Administratorem danych osobowych jest Piotr Sobiecki Usługi
                Informatyczne, e-mail:{" "}
                <a
                  href="mailto:it@sobiecki.org"
                  className="underline text-white hover:text-white/80"
                >
                  it@sobiecki.org
                </a>
                .
              </p>
            </div>
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-white">
                2. Zakres i cel przetwarzania danych
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li>
                  Przetwarzamy dane podane w formularzu kontaktowym (imię,
                  nazwisko, adres e-mail, treść wiadomości) wyłącznie w celu
                  udzielenia odpowiedzi na zapytanie.
                </li>
                <li>
                  Dane techniczne (np. adres IP, dane o przeglądarce) mogą być
                  przetwarzane w celach statystycznych i bezpieczeństwa.
                </li>
              </ul>
            </div>
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-white">
                3. Podstawa prawna przetwarzania
              </h2>
              <p className="text-white/70">
                Dane przetwarzane są na podstawie zgody użytkownika oraz w celu
                realizacji usług świadczonych drogą elektroniczną.
              </p>
            </div>
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-white">
                4. Przekazywanie danych
              </h2>
              <p className="text-white/70">
                Dane nie są przekazywane podmiotom trzecim, z wyjątkiem
                przypadków wymaganych przepisami prawa.
              </p>
            </div>
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-white">
                5. Prawa użytkownika
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li>
                  Prawo dostępu do swoich danych oraz otrzymania ich kopii.
                </li>
                <li>Prawo do sprostowania (poprawiania) danych.</li>
                <li>
                  Prawo do usunięcia danych („prawo do bycia zapomnianym”).
                </li>
                <li>Prawo do ograniczenia przetwarzania danych.</li>
                <li>
                  Prawo do wniesienia sprzeciwu wobec przetwarzania danych.
                </li>
                <li>Prawo do przenoszenia danych.</li>
                <li>Prawo do cofnięcia zgody w dowolnym momencie.</li>
              </ul>
            </div>
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-white">
                6. Okres przechowywania danych
              </h2>
              <p className="text-white/70">
                Dane przechowywane są przez okres niezbędny do realizacji celu,
                dla którego zostały zebrane, lub do czasu cofnięcia zgody.
              </p>
            </div>
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-white">
                7. Pliki cookies
              </h2>
              <p className="text-white/70">
                Serwis może wykorzystywać pliki cookies w celach statystycznych,
                funkcjonalnych oraz bezpieczeństwa. Użytkownik może zarządzać
                plikami cookies w ustawieniach swojej przeglądarki.
              </p>
            </div>
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-white">
                8. Kontakt
              </h2>
              <p className="text-white/70">
                W sprawach związanych z polityką prywatności prosimy o kontakt
                na adres:{" "}
                <a
                  href="mailto:it@sobiecki.org"
                  className="underline text-white hover:text-white/80"
                >
                  it@sobiecki.org
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
