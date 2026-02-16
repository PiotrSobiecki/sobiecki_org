"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Code, Database, Bot, Mail } from "lucide-react";
import useRevealOnIntersect from "@/hooks/useRevealOnIntersect";

const CHARS = "01";

export function HeroSection() {
  const scrollTextRef = useRef<HTMLSpanElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const { ref: heroRef, isVisible: isHeroVisible } = useRevealOnIntersect({
    threshold: 0.2,
    rootMargin: "0px 0px -20% 0px",
  });

  const leadText =
    "TWORZENIE NOWOCZESNYCH APLIKACJI I STRON INTERNETOWYCH, ANALIZA DANYCH BLOCKCHAIN, BUDOWA BOTÓW MONITORUJĄCYCH ORAZ KOMPLEKSOWE DORADZTWO IT. ROZWIĄZANIA STABILNE, PRZEJRZYSTE I DOSTOSOWANE DO TWOICH POTRZEB.";

  useEffect(() => {
    const lead = leadRef.current;
    if (!lead) return;

    if (!isHeroVisible) {
      lead.textContent = leadText;
      lead.style.opacity = "1";
      return;
    }

    lead.textContent = leadText;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const runScramble = () => {
      lead.style.opacity = "1";
      let iteration = 0;
      const maxIterations = leadText.length;
      let currentIteration = 0;

      intervalId = setInterval(() => {
        if (currentIteration >= maxIterations) {
          lead.textContent = leadText;
          if (intervalId) {
            clearInterval(intervalId);
          }
          return;
        }

        lead.textContent = leadText
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration) {
              return leadText[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("");

        iteration += 1;
        currentIteration++;
      }, 20);
    };

    timeoutId = setTimeout(runScramble, 400);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
      lead.textContent = leadText;
      lead.style.opacity = "1";
    };
  }, [isHeroVisible, leadText]);

  useEffect(() => {
    const scrollText = scrollTextRef.current;
    if (!scrollText) return;

    const originalText = "Przewiń w dół";
    let isScrambling = false;

    const scrambleText = () => {
      if (isScrambling) return;
      isScrambling = true;

      let iteration = 0;
      const maxIterations = originalText.length * 3;
      let currentIteration = 0;

      const interval = setInterval(() => {
        if (currentIteration >= maxIterations) {
          scrollText.textContent = originalText;
          clearInterval(interval);
          isScrambling = false;
          return;
        }

        scrollText.textContent = originalText
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration) {
              return originalText[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("");

        iteration += 1 / 3;
        currentIteration++;
      }, 30);
    };

    const handleClick = () => {
      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth",
      });
    };

    scrollText.addEventListener("mouseenter", scrambleText);
    scrollText.addEventListener("click", handleClick);
    scrollText.style.cursor = "pointer";

    return () => {
      scrollText.removeEventListener("mouseenter", scrambleText);
      scrollText.removeEventListener("click", handleClick);
    };
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section className="hero" ref={heroRef}>
      {/* Background Video - Full Section */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          style={{ opacity: 0.6, objectPosition: "center 40%" }}
        >
          <source src="/images/coding.mp4" type="video/mp4" />
        </video>
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              180deg,
              rgba(10, 10, 10, 0.95) 0%,
              rgba(10, 10, 10, 0.75) 15%,
              rgba(10, 10, 10, 0.65) 50%,
              rgba(10, 10, 10, 0.85) 75%,
              rgba(10, 10, 10, 0.98) 90%,
              rgba(10, 10, 10, 1) 100%
            )`
          }}
        ></div>
      </div>
      <div className="container hero__grid relative z-10">
        <div className="hero__content">
          <h1
            className={`hero__title${
              isHeroVisible ? " hero__title--visible" : ""
            }`}
          >
            ROZWIĄZANIA CYFROWE DOSTOSOWANE DO TWOICH POTRZEB
          </h1>
        </div>
        <div className="hero__panel">
          <p ref={leadRef} className="hero__lead">
            {leadText}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="#uslugi">
              <button className="btn btn_secondary">
                Moje usługi
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
            <Link href="#kontakt">
              <button className="btn btn_primary">
                <Mail className="h-5 w-5" />
                Skontaktuj się
              </button>
            </Link>
          </div>
          <div className="flex items-center gap-6 mt-8">
            <div className="flex items-center gap-2">
              <Code className="h-6 w-6 text-white" />
              <span className="text-sm font-medium text-white/80">
                Aplikacje Webowe
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6 text-white" />
              <span className="text-sm font-medium text-white/80">
                Blockchain
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-white" />
              <span className="text-sm font-medium text-white/80">Boty</span>
            </div>
          </div>
        </div>
      </div>
      <div className="hero__scroll">
        <span ref={scrollTextRef} className="font-mono">
          Przewiń w dół
        </span>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}
