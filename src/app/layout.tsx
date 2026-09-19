import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AccessibilityWidget } from "@/components/ui/accessibility";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://sobiecki.org"),
  title: {
    default: "Piotr Sobiecki — tworzenie stron i aplikacji webowych",
    template: "%s | Piotr Sobiecki",
  },
  description:
    "Tworzę strony i aplikacje webowe, boty monitorujące oraz rozwiązania do analizy danych blockchain. Poznaj moje projekty i skontaktuj się w sprawie współpracy.",
  alternates: { canonical: "/" },
  authors: [{ name: "Piotr Sobiecki", url: "https://sobiecki.org" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "https://sobiecki.org",
    siteName: "Piotr Sobiecki — Usługi Informatyczne",
    title: "Piotr Sobiecki — tworzenie stron i aplikacji webowych",
    description: "Strony i aplikacje webowe, analiza blockchain i boty monitorujące. Sprawdź projekty i porozmawiajmy o współpracy.",
    images: [{ url: "/images/og-cover.jpg", width: 1200, height: 630, alt: "Piotr Sobiecki — tworzenie stron i aplikacji webowych" }],
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = { themeColor: "#8B5CF6" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        {children}
        <AccessibilityWidget />
      </body>
    </html>
  );
}
