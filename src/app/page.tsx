"use client";
import { Navbar } from "@/components/ui/navbar";
import { HeroSection } from "@/components/ui/hero-section";
import { Footer } from "@/components/ui/footer";
import { ProjectCard } from "@/components/ui/project-card";
import { ServiceCard } from "@/components/ui/service-card";
import { BinaryBackground } from "@/components/ui/binary-background";
import { BackgroundVideo } from "@/components/ui/background-video";
import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { getRevealStyle } from "@/utils/reveal";
import { RevealSection } from "@/components/ui/reveal-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  services,
  products,
  problems,
  caseStudies,
  processSteps,
  reasons,
  techStack,
  cooperation,
  faq,
  contactTopics,
} from "@/content/oferta";

export default function Home() {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const getCardStyle = (isVisible: boolean, index: number) =>
    getRevealStyle(isVisible, {
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
    const topic = (form.elements.namedItem("topic") as HTMLSelectElement).value;
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
        body: JSON.stringify({ name, email, topic, message, token }),
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

      <RevealSection
        id="problemy"
        eyebrow="problemy"
        title="Z czym przychodzą firmy"
      >
        {(isVisible) => (
          <ol className="tile-grid">
            {problems.map((problem, index) => (
              <li
                key={problem}
                className="card"
                style={getRevealStyle(isVisible, { delay: index * 70 })}
              >
                <span className="index-label" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p>{problem}</p>
              </li>
            ))}
          </ol>
        )}
      </RevealSection>

      <RevealSection
        id="uslugi"
        className="services"
        eyebrow="usługi"
        title="Co mogę wdrożyć"
      >
        {(isVisible) => (
          <div className="services__stack">
            {services.map((service, index) => (
              <ServiceCard
                key={service.title}
                service={service}
                index={index}
                isVisible={isVisible}
                delayStyle={getServiceCardDelayStyle(index)}
              />
            ))}
          </div>
        )}
      </RevealSection>

      <RevealSection
        id="wdrozenia"
        className="projects"
        eyebrow="realizacje"
        title="Wdrożenia"
        intro="Systemy, które działają u klientów i u mnie. Bez nazw firm, bo umowy tego wymagają."
      >
        {(isVisible) => (
          <div className="projects__grid projects__grid--cases">
            {caseStudies.map((item, index) => (
              <ProjectCard
                key={item.title}
                className="project-card--case"
                name={item.title}
                description={item.description}
                label={item.category}
                status={item.status}
                facts={item.facts}
                tech={item.tech}
                style={getCardStyle(isVisible, index)}
              />
            ))}
          </div>
        )}
      </RevealSection>

      <RevealSection
        id="projekty"
        className="projects section-with-video"
        eyebrow="produkty"
        title="Własne produkty"
        background={
          <BackgroundVideo
            className="section-bg-video"
            src="/images/kafelek.mp4"
            poster="/images/kafelek-poster.jpg"
          />
        }
      >
        {(isVisible) => (
          <div className="projects__grid">
            {products.map((product, index) => (
              <ProjectCard
                key={product.name}
                {...product}
                style={getCardStyle(isVisible, index)}
              />
            ))}
          </div>
        )}
      </RevealSection>

      <RevealSection id="proces" eyebrow="proces" title="Jak pracuję">
        {(isVisible) => (
          <ol className="process">
            {processSteps.map((step, index) => (
              <li
                key={step.title}
                className="process__step"
                style={getRevealStyle(isVisible, { delay: index * 120 })}
              >
                <span className="index-label" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        )}
      </RevealSection>

      <RevealSection id="dlaczego" eyebrow="o mnie" title="Dlaczego ze mną">
        {(isVisible) => (
          <>
            <ul className="tile-grid">
              {reasons.map((reason, index) => (
                <li
                  key={reason}
                  className="card"
                  style={getRevealStyle(isVisible, { delay: index * 70 })}
                >
                  <p>{reason}</p>
                </li>
              ))}
            </ul>
            <ul className="tech-bar" aria-label="Technologie">
              {techStack.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          </>
        )}
      </RevealSection>

      <RevealSection id="faq" eyebrow="faq" title="Współpraca i FAQ">
        {(isVisible) => (
          <div style={getRevealStyle(isVisible, { delay: 100 })}>
            <h3 className="faq__heading">Formy współpracy</h3>
            <ul className="tile-grid">
              {cooperation.map((item) => (
                <li key={item} className="card">
                  <p>{item}</p>
                </li>
              ))}
            </ul>
            <Accordion type="single" collapsible className="faq__list">
              {faq.map((item, index) => (
                <AccordionItem
                  key={item.question}
                  value={`faq-${index}`}
                  className="border-white/15"
                >
                  <AccordionTrigger className="rounded-none py-5 text-base">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-white/70">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </RevealSection>

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
            <p>Odpowiadam tego samego dnia roboczego.</p>
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
                  htmlFor="topic"
                  className="block text-sm font-medium text-white/80 mb-1"
                >
                  Temat
                </label>
                <select
                  id="topic"
                  name="topic"
                  required
                  defaultValue=""
                  className="w-full px-4 py-2 bg-[#0a0a0a] border border-white/20 text-white focus:ring-2 focus:ring-white focus:border-white"
                >
                  <option value="" disabled>
                    Wybierz temat
                  </option>
                  {contactTopics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
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
