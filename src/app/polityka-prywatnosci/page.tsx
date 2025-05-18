import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

export default function PolitykaPrywatnosci() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Polityka prywatności
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Niniejsza polityka prywatności określa zasady przetwarzania i
              ochrony danych osobowych użytkowników korzystających z serwisu
              Piotr Sobiecki Usługi Informatyczne.
            </p>
          </div>

          <div className="grid gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-2 text-primary">
                1. Administrator danych
              </h2>
              <p>
                Administratorem danych osobowych jest Piotr Sobiecki Usługi
                Informatyczne, e-mail:{" "}
                <a
                  href="mailto:it@sobiecki.org"
                  className="underline text-primary"
                >
                  it@sobiecki.org
                </a>
                .
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-2 text-primary">
                2. Zakres i cel przetwarzania danych
              </h2>
              <ul className="list-disc pl-6 space-y-1">
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
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-2 text-primary">
                3. Podstawa prawna przetwarzania
              </h2>
              <p>
                Dane przetwarzane są na podstawie zgody użytkownika oraz w celu
                realizacji usług świadczonych drogą elektroniczną.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-2 text-primary">
                4. Przekazywanie danych
              </h2>
              <p>
                Dane nie są przekazywane podmiotom trzecim, z wyjątkiem
                przypadków wymaganych przepisami prawa.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-2 text-primary">
                5. Prawa użytkownika
              </h2>
              <ul className="list-disc pl-6 space-y-1">
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
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-2 text-primary">
                6. Okres przechowywania danych
              </h2>
              <p>
                Dane przechowywane są przez okres niezbędny do realizacji celu,
                dla którego zostały zebrane, lub do czasu cofnięcia zgody.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-2 text-primary">
                7. Pliki cookies
              </h2>
              <p>
                Serwis może wykorzystywać pliki cookies w celach statystycznych,
                funkcjonalnych oraz bezpieczeństwa. Użytkownik może zarządzać
                plikami cookies w ustawieniach swojej przeglądarki.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-2 text-primary">
                8. Kontakt
              </h2>
              <p>
                W sprawach związanych z polityką prywatności prosimy o kontakt
                na adres:{" "}
                <a
                  href="mailto:it@sobeicki.org"
                  className="underline text-primary"
                >
                  it@sobeicki.org
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
