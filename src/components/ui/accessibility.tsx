"use client";

import { useState, useEffect } from "react";
import {
  Accessibility,
  Eye,
  MonitorSmartphone,
  Text,
  X,
} from "lucide-react";

export function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [dyslexicFont, setDyslexicFont] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+1 (lub Option+1 na Mac)
      if ((e.altKey || e.metaKey) && e.key === "1") {
        e.preventDefault();
        const mainContent = document.querySelector("main");
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    document.documentElement.classList.toggle("high-contrast");
  };

  const toggleLargeText = () => {
    setLargeText(!largeText);
    document.documentElement.classList.toggle("large-text");
  };

  const toggleDyslexicFont = () => {
    setDyslexicFont(!dyslexicFont);
    document.documentElement.classList.toggle("dyslexic-font");
  };

  return (
    <>
      <style jsx global>{`
        .high-contrast {
          filter: contrast(1.5);
        }
        .large-text {
          font-size: 120% !important;
          line-height: 1.5 !important;
        }
        .dyslexic-font {
          font-family: "Comic Sans MS", cursive, sans-serif !important;
          letter-spacing: 0.05em;
          word-spacing: 0.1em;
        }
        .dark {
          color-scheme: dark;
        }
        .dark body {
          background-color: #121212;
          color: #e4e4e4;
        }
        .dark .bg-white,
        .dark .bg-gray-50,
        .dark .bg-gray-100,
        .dark .bg-gray-200 {
          background-color: #1e1e1e !important;
        }
        .dark .bg-secondary\/50 {
          background: #101010 !important;
          background-image: none !important;
        }
        .dark .bg-gradient-to-br {
          background: black !important;
          background-image: none !important;
        }
        .dark .bg-[#f7fafd] {
          background-color: #1a1a1a !important;
        }
        .dark .text-gray-600,
        .dark .text-gray-700 {
          color: #b0b0b0 !important;
        }
        .dark .border-gray-100,
        .dark .border-gray-200,
        .dark .border-gray-300 {
          border-color: #333 !important;
        }
        .dark .shadow-sm,
        .dark .shadow-lg {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3) !important;
        }
        /* Górna część strony */
        .dark .bg-primary {
          background-color: #1e8449 !important;
        }
        .dark nav,
        .dark header,
        .dark .navbar {
          background-color: #121212 !important;
          border-color: #333 !important;
        }
        .dark .navbar a,
        .dark nav a {
          color: #e4e4e4 !important;
        }
        .dark .navbar a:hover,
        .dark nav a:hover {
          color: #fff !important;
        }
        /* Hero section i image container */
        .dark [class*="hero-"],
        .dark [class*="hero"],
        .dark [class*="Hero"] {
          background-color: #121212 !important;
        }
        .dark img,
        .dark .image-container,
        .dark .img-container {
          filter: brightness(0.85);
        }
        /* Menu dostępności */
        .dark .fixed.bottom-20.right-6 {
          background-color: #1e1e1e !important;
          border-color: #333 !important;
          color: #e4e4e4 !important;
        }
        .dark .fixed.bottom-20.right-6 .text-gray-500 {
          color: #b0b0b0 !important;
        }
        .dark .hover\:bg-gray-100:hover {
          background-color: #2a2a2a !important;
        }
      `}</style>

      <button
        onClick={toggleMenu}
        className="fixed bottom-6 right-6 p-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full shadow-lg z-50 transition-colors backdrop-blur-sm"
        aria-label="Ustawienia dostępności"
      >
        <Accessibility className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 bg-[#000000] border-2 border-white rounded-xl shadow-xl p-5 z-50 w-72 animate-in fade-in slide-in-from-right-5" style={{ fontFamily: '"Courier New", monospace' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl text-white text-left" style={{ fontSize: "1.25rem", fontWeight: 600 }}>Dostępność</h3>
            <button
              onClick={toggleMenu}
              className="text-white hover:text-white transition-colors"
              aria-label="Zamknij menu dostępności"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <ul className="space-y-3">
            <li>
              <button
                onClick={toggleHighContrast}
                className={`flex items-center w-full p-3 rounded-lg transition-colors text-left ${
                  highContrast
                    ? "bg-white text-black border-2 border-white"
                    : "hover:bg-white/20 text-white border border-white/40"
                }`}
                style={{ fontSize: "1rem", fontWeight: 500 }}
                aria-pressed={highContrast}
              >
                <MonitorSmartphone className="h-6 w-6 mr-3 flex-shrink-0" />
                <span className="text-left">Wysoki kontrast</span>
              </button>
            </li>
            <li>
              <button
                onClick={toggleLargeText}
                className={`flex items-center w-full p-3 rounded-lg transition-colors text-left ${
                  largeText ? "bg-white text-black border-2 border-white" : "hover:bg-white/20 text-white border border-white/40"
                }`}
                style={{ fontSize: "1rem", fontWeight: 500 }}
                aria-pressed={largeText}
              >
                <Text className="h-6 w-6 mr-3 flex-shrink-0" />
                <span className="text-left">Powiększony tekst</span>
              </button>
            </li>
            <li>
              <button
                onClick={toggleDyslexicFont}
                className={`flex items-center w-full p-3 rounded-lg transition-colors text-left ${
                  dyslexicFont
                    ? "bg-white text-black border-2 border-white"
                    : "hover:bg-white/20 text-white border border-white/40"
                }`}
                style={{ fontSize: "1rem", fontWeight: 500 }}
                aria-pressed={dyslexicFont}
              >
                <Eye className="h-6 w-6 mr-3 flex-shrink-0" />
                <span className="text-left">Czcionka dla dysleksji</span>
              </button>
            </li>
          </ul>

          <p className="text-sm text-white mt-5 text-left" style={{ fontSize: "0.875rem", fontWeight: 400 }}>
            Naciśnij Alt+1 aby przejść do głównej zawartości
          </p>
        </div>
      )}
    </>
  );
}
