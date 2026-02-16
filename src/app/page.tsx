"use client";
import { Navbar } from "@/components/ui/navbar";
import { HeroSection } from "@/components/ui/hero-section";
import { Footer } from "@/components/ui/footer";
import { ProjectCard } from "@/components/ui/project-card";
import { ServiceCard } from "@/components/ui/service-card";
import { BinaryBackground } from "@/components/ui/binary-background";
import Link from "next/link";
import { Code, Database, Bot, Shield, Mail } from "lucide-react";
import { useRef, useState, useMemo } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import useRevealOnIntersect from "@/hooks/useRevealOnIntersect";
import { getRevealStyle } from "@/utils/reveal";

export default function Home() {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const { ref: projectsRef, isVisible: isProjectsVisible } =
    useRevealOnIntersect({
      threshold: 0.08,
      rootMargin: "-5% 0px",
    });

  const { ref: servicesRef, isVisible: isServicesVisible } =
    useRevealOnIntersect({
      threshold: 0.08,
      rootMargin: "0px",
    });

  const services = [
    {
      title: "Aplikacje Webowe",
      description:
        "Tworzenie nowoczesnych aplikacji i stron internetowych dopasowanych do indywidualnych potrzeb.",
      category: "Development",
      accentImage:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
    },
    {
      title: "Blockchain",
      description:
        "Analiza danych blockchain – przetwarzanie logów, generowanie statystyk i monitorowanie aktywności.",
      category: "Analytics",
      accentImage:
        "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
    },
    {
      title: "Boty",
      description:
        "Budowa botów do monitorowania i powiadamiania o wybranych zdarzeniach on-chain.",
      category: "Automation",
      accentImage:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    },
  ];

  const projects = [
    {
      name: "OddajHajs",
      description:
        "Platforma do zarządzania wspólnymi wydatkami. Umożliwia łatwe rozliczanie się między znajomymi, współlokatorami czy członkami grupy. Dodatkowo oferuje czat, kalendarz oraz system przypomnień, co ułatwia komunikację i organizację rozliczeń.",
      url: "https://oddajhajs.org",
    },
    {
      name: "Signum Wallet",
      description:
        "Portfel webowy obsługujący Arbitrum, Ethereum, Polygon i Base. Umożliwia zakładanie portfeli, przesyłanie tokenów i NFT oraz przeglądanie historii transakcji. Narzędzie ma pełną funkcjonalność, lecz służy głównie celom demonstracyjnym.",
      url: "https://wallet.sobiecki.org",
    },
    {
      name: "MindWander",
      description:
        "Rozszerzenie do przeglądarki pomagające odkrywać nowe tematy poza bańką informacyjną. Wykorzystuje AI do proponowania zaskakujących połączeń między zagadnieniami. Oferuje analizę treści, kreatywne wyszukiwanie, sugestie i nieinwazyjny interfejs.",
      url: "https://mind-wander.org",
    },
    {
      name: "ETHFinder",
      description:
        "Bezpieczny generator adresów Ethereum z niestandardowymi wzorcami. Generuje adresy z określonymi prefiksami i sufiksami całkowicie w przeglądarce - bez komunikacji z serwerem, maksymalne bezpieczeństwo. Zawiera kalkulator prawdopodobieństwa i nowoczesny interfejs.",
      url: "https://ethfinder.org",
    },
  ];

  const sectionHeaderStyle = useMemo(
    () => getRevealStyle(isProjectsVisible, { offset: 35, duration: "1s" }),
    [isProjectsVisible],
  );

  const servicesHeaderStyle = useMemo(
    () => getRevealStyle(isServicesVisible, { offset: 35, duration: "1s" }),
    [isServicesVisible],
  );

  const getCardStyle = (index: number) =>
    getRevealStyle(isProjectsVisible, {
      delay: index * 70,
      offset: 55,
    });

  const getServiceCardDelayStyle = (index: number) => ({
    transitionDelay: `${index * 140 + 200}ms`,
  });

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
          data.error || "Wystąpił błąd podczas wysyłania wiadomości.",
        );
      }

      setSuccess("Wiadomość została wysłana!");
      form.reset();
      recaptcha?.reset();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]" tabIndex={-1}>
      <Navbar />
      <HeroSection />

      {/* Sekcja Usługi */}
      <section id="uslugi" className="services" ref={servicesRef}>
        <div className="container">
          <div
            className={`section-header services__intro ${
              isServicesVisible ? "services__intro--visible" : ""
            }`}
            style={servicesHeaderStyle}
          >
            <p className="eyebrow">usługi</p>
            <h2>Kompleksowe rozwiązania IT dostosowane do Twoich potrzeb</h2>
          </div>
          <div className="services__stack">
            {services.map((service, index) => (
              <ServiceCard
                key={service.title}
                service={service}
                index={index}
                isVisible={isServicesVisible}
                delayStyle={getServiceCardDelayStyle(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Sekcja Przykładowe Aplikacje */}
      <section
        id="projekty"
        className="projects section-with-video"
        ref={projectsRef}
      >
        <video className="section-bg-video" autoPlay muted loop playsInline>
          <source src="/images/kafelek.mp4" type="video/mp4" />
        </video>
        <div className="container">
          <div className="section-header" style={sectionHeaderStyle}>
            <p className="eyebrow">projekty</p>
            <h2>Przykładowe Projekty</h2>
            <p>Zobacz przykłady moich realizacji</p>
          </div>
          <div className="projects__grid">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.name}
                {...project}
                style={getCardStyle(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Sekcja Kontakt */}
      <section id="kontakt" className="section resources">
        <BinaryBackground />
        <div className="container">
          <div
            className="section-header"
            style={{
              textAlign: "center",
              marginTop: "20px",
              marginBottom: "20px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <h2>Kontakt</h2>
            <p>Skontaktuj się ze mną, aby omówić Twoje potrzeby</p>
          </div>

          <div className="max-w-xl mx-auto card">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-white/80 mb-1"
                >
                  Imię i nazwisko
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-white/20 text-white focus:ring-2 focus:ring-white focus:border-white"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white/80 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-white/20 text-white focus:ring-2 focus:ring-white focus:border-white"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-white/80 mb-1"
                >
                  Wiadomość
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-white/20 text-white focus:ring-2 focus:ring-white focus:border-white"
                ></textarea>
              </div>
              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={recaptchaSiteKey}
                  size="normal"
                  theme="dark"
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
                <div className="text-green-400 text-sm">{success}</div>
              )}
              {error && <div className="text-red-400 text-sm">{error}</div>}
              <button
                type="submit"
                className="btn btn_primary w-full"
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
