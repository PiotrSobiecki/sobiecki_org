import Link from "next/link";
import { Menu, Facebook, Code, Layout } from "lucide-react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              Piotr Sobiecki
            </span>
            <span className="text-2xl font-bold">Usługi Informatyczne</span>
          </Link>

          {/* Nawigacja desktopowa */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#uslugi"
              className="text-gray-700 hover:text-primary transition-colors flex items-center gap-1"
            >
              <Code className="h-4 w-4" />
              Usługi
            </Link>
            <Link
              href="#projekty"
              className="text-gray-700 hover:text-primary transition-colors flex items-center gap-1"
            >
              <Layout className="h-4 w-4" />
              Przykładowe Projekty
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Social Media Icons */}
            <div className="flex space-x-2 mr-4">
              <Link
                href="https://www.facebook.com/piotr.sobiecki.33"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-primary hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </Link>
            </div>
            <Link href="#kontakt">
              <Button>Skontaktuj się</Button>
            </Link>
          </div>

          {/* Menu mobilne */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="#uslugi" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Usługi
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#projekty" className="flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  Przykładowe Projekty
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="flex justify-between items-center"
              >
                <div className="flex space-x-2">
                  <a
                    href="https://www.facebook.com/piotr.sobiecki.33"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
