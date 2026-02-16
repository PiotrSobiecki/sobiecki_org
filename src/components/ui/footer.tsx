"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Facebook } from "lucide-react";

const CHARS = "01";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);

  const TILE_LINKS = [
    { label: "usługi", href: "/#uslugi" },
    { label: "przykładowe projekty", href: "/#projekty" },
    { label: "kontakt", href: "#kontakt" },
    { label: "polityka prywatności", href: "/polityka-prywatnosci" },
  ];

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const targets = Array.from(
      footer.querySelectorAll<HTMLElement>("[data-binary-link='true']")
    );
    if (!targets.length) return;

    const originalTexts = new Map<HTMLElement, string>();
    const handlers = new Map<HTMLElement, () => void>();
    const runningTimers = new Map<HTMLElement, number>();

    targets.forEach((element) => {
      originalTexts.set(element, element.textContent?.trim() || "");
    });

    const scrambleText = (element: HTMLElement) => {
      const originalText = originalTexts.get(element) || "";
      if (!originalText) return;

      const width = element.offsetWidth;
      element.style.minWidth = `${width}px`;

      if (runningTimers.has(element)) {
        window.clearInterval(runningTimers.get(element)!);
      }

      let iteration = 0;
      const maxIterations = Math.max(6, originalText.length * 3);
      let currentIteration = 0;

      const intervalId = window.setInterval(() => {
        if (currentIteration >= maxIterations) {
          element.textContent = originalText;
          element.style.minWidth = "";
          window.clearInterval(intervalId);
          runningTimers.delete(element);
          return;
        }

        element.textContent = originalText
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

      runningTimers.set(element, intervalId);
    };

    targets.forEach((element) => {
      const handler = () => scrambleText(element);
      handlers.set(element, handler);
      element.addEventListener("mouseenter", handler);
      element.addEventListener("focus", handler);
    });

    return () => {
      handlers.forEach((handler, element) => {
        element.removeEventListener("mouseenter", handler);
        element.removeEventListener("focus", handler);
      });
      runningTimers.forEach((id) => window.clearInterval(id));
    };
  }, []);

  return (
    <footer className="site-footer" ref={footerRef}>
      <div className="container footer__tiles">
        {TILE_LINKS.map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className="footer__tile"
            data-binary-link="true"
          >
            {tile.label}
          </Link>
        ))}
      </div>
      <div className="container footer__about">
        <div className="flex items-center justify-center mb-6">
          <h3 className="text-lg font-bold text-white mr-4">
            Piotr Sobiecki
          </h3>
          <span className="text-lg font-bold text-white">
            Usługi Informatyczne
          </span>
        </div>
        <div className="mb-6">
          <span className="text-white/70 mr-1">Email:</span>
          <a
            href="mailto:it@sobiecki.org"
            className="hover:text-white underline"
          >
            it@sobiecki.org
          </a>
        </div>
        <div className="flex justify-center gap-4 mb-6">
          <a
            href="https://www.facebook.com/piotr.sobiecki.33"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 hover:border-white hover:bg-white/10 transition-colors"
            aria-label="Facebook"
          >
            <Facebook className="h-5 w-5" />
          </a>
        </div>
        <p>
          Profesjonalne usługi informatyczne - wsparcie IT na najwyższym poziomie.
        </p>
      </div>
      <div className="footer__bottom">
        <p>© {currentYear} Piotr Sobiecki Usługi Informatyczne. Wszystkie prawa zastrzeżone.</p>
      </div>
    </footer>
  );
}
