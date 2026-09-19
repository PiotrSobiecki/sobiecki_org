"use client";
import { Navbar } from "@/components/ui/navbar";
import { HeroSection } from "@/components/ui/hero-section";
import { Footer } from "@/components/ui/footer";
import { ProjectCard } from "@/components/ui/project-card";
import { ServiceCard } from "@/components/ui/service-card";
import { BinaryBackground } from "@/components/ui/binary-background";
import { BackgroundVideo } from "@/components/ui/background-video";
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
      accentImage: "/images/uslugi-web.jpg",
    },
    {
      title: "Blockchain",
      description:
        "Analiza danych blockchain – przetwarzanie logów, generowanie statystyk i monitorowanie aktywności.",
      category: "Analytics",
      accentImage: "/images/uslugi-blockchain.jpg",
    },
    {
      title: "Boty",
      description:
        "Budowa botów do monitorowania i powiadamiania o wybranych zdarzeniach on-chain.",
      category: "Automation",
      accentImage: "/images/uslugi-boty.jpg",
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
      name: "HomeCashflow",
      description:
        "Aplikacja do zarządzania budżetem domowym i wspólnymi finansami. Pomaga kontrolować wydatki, planować oszczędności i śledzić prognozy finansowe. Umożliwia też sterowanie inteligentnymi wtyczkami i urządzeniami oraz monitorowanie zużycia energii i jej kosztów.",
      url: "https://homecashflow.org",
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

  // Wstrzykiwany przy buildzie — Dockerfile musi podać ten ARG, inaczej będzie undefined.
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

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
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd.",
      );
    } finally {
      recaptcha?.reset();
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
        <BackgroundVideo
          className="section-bg-video"
          src="/images/kafelek.mp4"
          poster="/images/kafelek-poster.jpg"
        />
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
                  maxLength={200}
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
                  maxLength={320}
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
                  maxLength={5000}
                  rows={4}
                  required
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-white/20 text-white focus:ring-2 focus:ring-white focus:border-white"
                ></textarea>
              </div>
              <div className="flex justify-center">
                {!recaptchaSiteKey ? (
                  <p className="text-sm text-red-400">
                    Formularz jest chwilowo niedostępny.
                  </p>
                ) : (
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
                )}
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
