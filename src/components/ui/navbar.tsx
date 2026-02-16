"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Facebook, Menu, X } from "lucide-react";
import { Minesweeper } from "../games/minesweeper";

const CHARS = "01";

const NAV_ITEMS = [
  { label: "usługi", href: "/#uslugi" },
  { label: "przykładowe projekty", href: "/#projekty" },
  {
    label: "saper",
    href: "#",
    onClick: () => {
      if (typeof window !== "undefined" && "openMinesweeper" in window) {
        (window as { openMinesweeper?: () => void }).openMinesweeper?.();
      }
    },
  },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const links = navRef.current?.querySelectorAll("a");
    if (!links) return;

    const handlers = new Map<HTMLAnchorElement, () => void>();
    const originalTexts = new Map<HTMLAnchorElement, string>();

    links.forEach((link, index) => {
      const text = NAV_ITEMS[index]?.label || "";
      originalTexts.set(link, text);
      link.dataset.text = text;
    });

    const scrambleText = (element: HTMLAnchorElement) => {
      const originalText = originalTexts.get(element) || "";
      if (!originalText) return;

      const originalWidth = element.offsetWidth;
      element.style.minWidth = `${originalWidth}px`;

      let iteration = 0;
      const maxIterations = originalText.length * 3;
      let currentIteration = 0;

      const interval = setInterval(() => {
        if (currentIteration >= maxIterations) {
          element.textContent = originalText;
          clearInterval(interval);
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
    };

    links.forEach((link) => {
      const handler = () => scrambleText(link);
      handlers.set(link, handler);
      link.addEventListener("mouseenter", handler);
    });

    return () => {
      handlers.forEach((handler, link) => {
        link.removeEventListener("mouseenter", handler);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflowY = !isMobileMenuOpen ? "hidden" : "auto";
  };

  return (
    <>
      <Minesweeper />
      <header className="site-header">
        <div className="container header__inner">
          <Link href="/" className="brand">
            <span className="text-2xl font-bold text-white">sobiecki.org</span>
          </Link>

          <nav className="site-nav" ref={navRef}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header__cta">
            <Link
              href="https://www.facebook.com/piotr.sobiecki.33"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 flex items-center justify-center border border-white/40 hover:border-white hover:bg-white/10 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="#kontakt" className="btn btn_primary hidden md:inline-flex">
              Kontakt
            </Link>
            <button
              className="button_mobile"
              onClick={toggleMobileMenu}
              aria-label="Open mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[110] opacity-100 transition-opacity"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}
      <div
        className={`fixed top-[88px] right-4 max-w-[360px] w-[calc(100%-28px)] bg-[#050505] border border-white/12 rounded-xl p-4 flex flex-col gap-4 shadow-2xl z-[110] transition-all ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 pointer-events-none -translate-y-2"
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-white/55">
            menu
          </p>
          <button
            className="w-10 h-10 border border-white/40 rounded-md flex items-center justify-center text-white"
            onClick={toggleMobileMenu}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1.5" style={{ fontFamily: '"Courier New", monospace' }}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick();
                }
                toggleMobileMenu();
              }}
              className="block text-white text-base lowercase tracking-widest py-3 border-b border-white/8"
              style={{ fontFamily: '"Courier New", monospace' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="#kontakt"
          className="btn btn_primary w-full justify-center"
          onClick={toggleMobileMenu}
          style={{ fontFamily: '"Courier New", monospace' }}
        >
          Skontaktuj się
        </Link>
      </div>
    </>
  );
}
