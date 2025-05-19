import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AccessibilityWidget } from "@/components/ui/accessibility";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Piotr Sobiecki - Profesjonalne Usługi Informatyczne",
  description:
    " - tworzenie aplikacji webowych, analiza danych blockchain, budowa botów i doradztwo IT",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Profesjonalne usługi informatyczne - tworzenie aplikacji webowych, analiza danych blockchain, budowa botów i doradztwo IT."
        />
        <meta
          name="keywords"
          content="usługi informatyczne, aplikacje webowe, blockchain, boty, doradztwo IT"
        />
        <meta name="author" content="Piotr Sobiecki" />
        <meta
          property="og:title"
          content="Piotr Sobiecki - Profesjonalne Usługi Informatyczne"
        />
        <meta
          property="og:description"
          content="Profesjonalne usługi informatyczne - tworzenie aplikacji webowych, analiza danych blockchain, budowa botów i doradztwo IT."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sobiecki.org" />
        <meta property="og:image" content="/images/og-image.png" />
      </head>
      <body className={inter.className}>
        {children}
        <AccessibilityWidget />
      </body>
    </html>
  );
}
