import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AccessibilityWidget } from "@/components/ui/accessibility";
import { services } from "@/content/oferta";

const inter = Inter({ subsets: ["latin"] });

const title = "Piotr Sobiecki: agenci AI, CRM i automatyzacje dla firm";
const description =
  "Wdrażam voiceboty, agentów AI, systemy CRM i automatyzacje dla firm, także faktury przez KSeF. Projektuję, buduję i utrzymuję, a kod zostaje u klienta.";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Piotr Sobiecki Usługi Informatyczne",
  url: "https://sobiecki.org",
  email: "it@sobiecki.org",
  image: "https://sobiecki.org/images/og-cover.jpg",
  description,
  areaServed: "PL",
  founder: {
    "@type": "Person",
    name: "Piotr Sobiecki",
    email: "it@sobiecki.org",
    url: "https://sobiecki.org",
    knowsAbout: services.map((service) => service.title),
  },
};

export const metadata: Metadata = {
  metadataBase: new URL("https://sobiecki.org"),
  title: {
    default: title,
    template: "%s | Piotr Sobiecki",
  },
  description,
  alternates: { canonical: "/" },
  authors: [{ name: "Piotr Sobiecki", url: "https://sobiecki.org" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "https://sobiecki.org",
    siteName: "Piotr Sobiecki — Usługi Informatyczne",
    title,
    description,
    images: [{ url: "/images/og-cover.jpg", width: 1200, height: 630, alt: title }],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
        <AccessibilityWidget />
      </body>
    </html>
  );
}
