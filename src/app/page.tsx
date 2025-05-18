"use client";
import { Navbar } from "@/components/ui/navbar";
import { HeroSection } from "@/components/ui/hero-section";
import { Footer } from "@/components/ui/footer";
import Link from "next/link";
import { Code, Database, Bot, Download } from "lucide-react";
import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export default function Home() {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const recaptchaSiteKey = "6Lc2IT8rAAAAANLZruh6aCBQCvm0xuIg67Ek-hQK";

  if (!recaptchaSiteKey) {
    console.error("Brak klucza reCAPTCHA!");
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement)
      .value;
    const recaptcha = recaptchaRef.current;
    const token = recaptcha?.getValue();

    if (!token) {
      setError("Potwierdź, że nie jesteś robotem.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Wystąpił błąd podczas wysyłania wiadomości."
        );
      }

      setSuccess("Wiadomość została wysłana!");
      form.reset();
      recaptcha?.reset();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      {/* Top CTA bar */}
      <div className="bg-primary text-white py-2 text-center">
        <div className="container mx-auto px-4 flex justify-center md:justify-between items-center">
          <p className="hidden md:block font-medium">
            Profesjonalne usługi informatyczne - wsparcie IT na najwyższym
            poziomie
          </p>
          <Link
            href="#kontakt"
            className="hidden md:flex items-center gap-2 bg-white text-primary px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            <Download className="h-4 w-4" />
            Skontaktuj się
          </Link>
        </div>
      </div>

      <Navbar />
      <HeroSection />

      {/* Sekcja Usługi */}
      <section id="uslugi" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Moje Usługi</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Oferuję kompleksowe rozwiązania IT dostosowane do Twoich potrzeb
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Aplikacje Webowe */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Aplikacje Webowe</h3>
              <p className="text-gray-600">
                Tworzenie nowoczesnych aplikacji i stron internetowych
                dopasowanych do indywidualnych potrzeb.
              </p>
            </div>

            {/* Blockchain */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Blockchain</h3>
              <p className="text-gray-600">
                Analiza danych blockchain – przetwarzanie logów, generowanie
                statystyk i monitorowanie aktywności.
              </p>
            </div>

            {/* Boty */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Boty</h3>
              <p className="text-gray-600">
                Budowa botów do monitorowania i powiadamiania o wybranych
                zdarzeniach on-chain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sekcja Przykładowe Aplikacje */}
      <section id="projekty" className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Przykładowe Projekty
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Zobacz przykłady moich realizacji
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* OddajHajs */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">OddajHajs</h3>
              <p className="text-gray-600 mb-4">
                Platforma do zarządzania wspólnymi wydatkami. Umożliwia łatwe
                rozliczanie się między znajomymi, współlokatorami czy członkami
                grupy. Dodatkowo oferuje czat, kalendarz oraz system
                przypomnień, co ułatwia komunikację i organizację rozliczeń.
              </p>
              <Link
                href="https://oddajhajs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
              >
                Odwiedź stronę
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            </div>

            {/* MindWander */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">MindWander</h3>
              <p className="text-gray-600 mb-4">
                Rozszerzenie do przeglądarki pomagające odkrywać nowe tematy
                poza bańką informacyjną. Wykorzystuje AI do proponowania
                zaskakujących połączeń między zagadnieniami. Oferuje analizę
                treści, kreatywne wyszukiwanie, sugestie i nieinwazyjny
                interfejs.
              </p>
              <Link
                href="https://mind-wander.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
              >
                Odwiedź stronę
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            </div>

            {/* Wallet */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Signum Wallet</h3>
              <p className="text-gray-600 mb-4">
                Portfel webowy obsługujący Arbitrum, Ethereum, Polygon i Base.
                Umożliwia zakładanie portfeli, przesyłanie tokenów i NFT oraz
                przeglądanie historii transakcji. Narzędzie ma pełną
                funkcjonalność, lecz służy głównie celom demonstracyjnym.
              </p>
              <Link
                href="https://wallet.sobiecki.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
              >
                Odwiedź stronę
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sekcja Kontakt */}
      <section id="kontakt" className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Kontakt</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Skontaktuj się ze mną, aby omówić Twoje potrzeby
            </p>
          </div>

          <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Imię i nazwisko
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Wiadomość
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                ></textarea>
              </div>
              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={recaptchaSiteKey}
                  size="normal"
                  theme="light"
                  onChange={(token) => {
                    if (!token) {
                      setError("Potwierdź, że nie jesteś robotem.");
                    } else {
                      setError("");
                    }
                  }}
                />
              </div>
              {success && (
                <div className="text-green-600 text-sm">{success}</div>
              )}
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Wysyłanie..." : "Wyślij wiadomość"}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
