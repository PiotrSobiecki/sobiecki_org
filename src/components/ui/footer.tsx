import Link from "next/link";
import { Facebook } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo i dane kontaktowe */}
          <div className="space-y-4">
            <div className="flex items-center">
              <h3 className="text-lg font-bold text-white mr-4">
                Piotr Sobiecki
              </h3>
              <span className="text-lg font-bold text-white">
                Usługi Informatyczne
              </span>
            </div>
            <div>
              <span className="text-gray-300 mr-1">Email:</span>
              <a
                href="mailto:it@sobiecki.org"
                className="hover:text-white underline"
              >
                it@sobiecki.org
              </a>
            </div>
          </div>

          {/* Linki */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Linki</h4>
            <div className="flex space-x-4">
              <a href="#kontakt" className="hover:text-white transition-colors">
                Kontakt
              </a>
              <Link
                href="/polityka-prywatnosci"
                className="hover:text-white transition-colors"
              >
                Polityka prywatności
              </Link>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Social Media</h4>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/piotr.sobiecki.33"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-primary hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-4 text-center text-xs text-gray-500">
          &copy; {currentYear} Piotr Sobiecki Usługi Informatyczne. Wszystkie
          prawa zastrzeżone.
        </div>
      </div>
    </footer>
  );
}
