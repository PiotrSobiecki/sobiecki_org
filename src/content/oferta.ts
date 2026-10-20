// Teksty strony głównej. Komponenty tylko je renderują.

export type Service = {
  title: string;
  description: string;
  category: string;
  examples: string[];
  accentImage?: string;
  link?: { href: string; label: string };
};

export type CaseStudy = {
  category: string;
  status: string;
  title: string;
  description: string;
  facts: string[];
  tech: string;
  // Tylko własne narzędzia; wdrożenia u klientów nie mają linków.
  link?: { href: string; label: string };
};

const AUDIT_LINK = { href: "https://audyt.sobiecki.org", label: "Sprawdź swoją stronę za darmo" };

export type Product = {
  name: string;
  description: string;
  url: string;
};

export type ProcessStep = {
  title: string;
  description: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type HeroStat = {
  value: string;
  label: string;
};

export const hero = {
  badge: "Agenci AI · CRM · Automatyzacje",
  title: "Automatyzuję obsługę klienta, sprzedaż i papierologię w firmach",
  lead: "Voiceboty, które dzwonią i odbierają telefony. CRM zamiast arkuszy. Faktury, które same trafiają do księgowości. Projektuję, buduję i utrzymuję sam: od rozmowy o procesie po monitoring na produkcji.",
  primaryCta: "Umów 30 minut rozmowy",
  secondaryCta: "Zobacz wdrożenia",
  auditCta: "Sprawdź swoją stronę: darmowy audyt SEO i bezpieczeństwa",
  auditUrl: "https://audyt.sobiecki.org",
  stats: [
    { value: "~14 tys.", label: "rekordów w kampanii voicebota" },
    { value: "1000+", label: "commitów w jednym systemie CRM na produkcji" },
    { value: "500", label: "podstron w jednym audycie SEO" },
    {
      value: "0 zł",
      label: "za wyjście z umowy, bo kod i klucze zostają u Ciebie",
    },
  ] satisfies HeroStat[],
};

export const problems: string[] = [
  "Leady z formularzy, maili i telefonów lądują w trzech miejscach i część ginie.",
  "Ktoś co miesiąc przepisuje faktury do arkusza albo systemu księgowego.",
  "Po 17:00 nikt nie odbiera telefonu, a klient dzwoni do konkurencji.",
  "Abonament za system SaaS rośnie, a i tak nie pasuje do procesu.",
  "Awaria wychodzi dopiero wtedy, gdy klient zgłasza problem.",
  "Strona jest wolna, niewidoczna w Google albo ma luki bezpieczeństwa.",
];

export const services: Service[] = [
  {
    title: "Agenci głosowi i czat",
    description:
      "Voicebot dzwoni i odbiera telefony, a czat odpowiada klientom na piśmie. Agent przedstawia się jako automat, zgodnie z AI Act.",
    category: "agenci AI",
    examples: [
      "Odbieranie i wykonywanie połączeń",
      "Kwalifikacja leadów",
      "Odpowiedzi z bazy wiedzy",
    ],
    accentImage: "/images/uslugi-boty.jpg",
  },
  {
    title: "CRM i ERP na miarę",
    description:
      "Leady, lejek, oferty i zadania w jednym miejscu, bez abonamentu za stanowisko. Opcjonalnie serwer MCP, przez który asystent AI obsługuje kontakty.",
    category: "CRM / ERP",
    examples: [
      "Faktury przez KSeF",
      "Panel klienta",
      "Konwersje wracają do Google Ads i GA4",
    ],
    accentImage: "/images/uslugi-web.jpg",
  },
  {
    title: "Automatyzacje i integracje",
    description:
      "Łączę n8n, API, Telegram, Google Workspace i KSeF. Dane przepływają między systemami bez przepisywania.",
    category: "automatyzacje",
    examples: [
      "Przeniesienie firmy do Google Workspace",
      "Leady z kilku stron w jednym backendzie",
      "Zamówienia w serwisie bez API",
    ],
    accentImage: "/images/uslugi-boty.jpg",
  },
  {
    title: "Dokumenty i faktury",
    description:
      "OCR i model językowy wyciągają numer, kwoty, VAT i kontrahenta. Rekord trafia do bazy, a plik do archiwum.",
    category: "dokumenty",
    examples: [
      "Faktury z poczty i Telegrama",
      "Archiwum na Dysku Google",
      "Wysyłka faktur przez KSeF",
    ],
    accentImage: "/images/uslugi-web.jpg",
  },
  {
    title: "Monitoring i alerty",
    description:
      "Maszyny, urządzenia IoT i aplikacje zgłaszają problemy na Telegram. Filtry usuwają duplikaty i pojedyncze restarty.",
    category: "monitoring",
    examples: [
      "Osobny wątek dla każdej lokalizacji",
      "Wyciszone alerty dalej się zapisują",
      "Kilkadziesiąt maszyn w jednej grupie",
    ],
    accentImage: "/images/uslugi-boty.jpg",
  },
  {
    title: "Strony i aplikacje webowe",
    description:
      "Szybkie strony z lejkiem leadów i aplikacje z panelem klienta. Formularze trafiają prosto do CRM i automatyzacji.",
    category: "strony",
    examples: [
      "Strony produktowe ze wspólnym backendem leadów",
      "Marketplace z rezerwacjami i afiszem",
      "Aplikacje PWA",
    ],
    accentImage: "/images/uslugi-web.jpg",
  },
  {
    title: "Web3 i trading",
    description:
      "Boty handlowe, portfele jako usługa i aplikacje dApp. Klucze nie opuszczają sejfu.",
    category: "web3",
    examples: [
      "Boty grid na dwóch giełdach",
      "Portfele w 4 sieciach blockchain",
      "Logowanie portfelem",
    ],
    accentImage: "/images/uslugi-blockchain.jpg",
  },
  {
    title: "Audyt SEO i bezpieczeństwa",
    description:
      "Raport z listą poprawek i ich wdrożenie. Agent AI poprawia kod strony albo pisze kroki naprawy.",
    category: "audyt",
    examples: [
      "Crawl do 500 podstron",
      "SSL i nagłówki bezpieczeństwa",
      "Poczta: SPF, DKIM, DMARC",
    ],
    accentImage: "/images/uslugi-web.jpg",
    link: AUDIT_LINK,
  },
];

export const caseStudies: CaseStudy[] = [
  {
    category: "Agenci AI",
    status: "Wdrożone",
    title: "Voicebot kampanii wychodzącej",
    description:
      "Agent dzwoni do bazy kontaktów, przedstawia się jako automat i rozpoznaje pocztę głosową. Gorące leady przekazuje doradcom, resztę zamyka statusem w CRM.",
    facts: [
      "~14 tys. rekordów w kampanii",
      "dzwoni tylko do kontaktów ze zgodą",
      "wynik rozmowy ustala kod, nie model",
    ],
    tech: "Python, LiveKit SIP, Claude, ElevenLabs, Postgres",
  },
  {
    category: "Agenci AI",
    status: "Wdrożone",
    title: "Agent mailowy obsługi klienta",
    description:
      "Czyta zgłoszenia, sprawdza dane klienta w CRM i przygotowuje odpowiedź do akceptacji konsultanta. Brakujące procedury dopisuje do bazy wiedzy, oznaczając je do weryfikacji.",
    facts: [
      "człowiek zatwierdza każdą odpowiedź",
      "baza wiedzy rośnie z każdym zgłoszeniem",
    ],
    tech: "Python, RAG, Claude",
  },
  {
    category: "CRM / ERP",
    status: "Na produkcji",
    title: "CRM operacyjny dla firmy z infrastrukturą serwerową",
    description:
      "Jeden panel prowadzi klientów, maszyny, portfele i miesięczne rozliczenia. Faktury idą przez KSeF, zużycie energii przychodzi z inteligentnych gniazdek, klient ma własny panel.",
    facts: ["1000+ commitów w 8 miesięcy", "KSeF", "panel klienta"],
    tech: "TanStack Start, Hono, Cloudflare, Postgres",
  },
  {
    category: "CRM / ERP",
    status: "Na produkcji",
    title: "ERP sprzedażowy zamiast abonamentu SaaS",
    description:
      "Leady z formularzy, lejek, oferty, zadania i powiadomienia zespołu w jednym systemie. Konwersje wracają do Google Ads i GA4, a asystent AI obsługuje kontakty przez MCP.",
    facts: [
      "0 zł abonamentu za stanowisko",
      "konwersje do Google Ads",
      "serwer MCP",
    ],
    tech: "TanStack Start, Hono, Cloudflare, Postgres",
  },
  {
    category: "Monitoring",
    status: "Na produkcji",
    title: "Alerty z infrastruktury na Telegramie",
    description:
      "Komunikaty z kilkudziesięciu maszyn trafiają do grupy, z osobnym wątkiem dla każdej lokalizacji. Filtry usuwają duplikaty, pojedyncze restarty i wahania temperatury.",
    facts: ["kilkadziesiąt maszyn", "wyciszone alerty dalej się zapisują"],
    tech: "Cloudflare Durable Objects, Telegram",
  },
  {
    category: "Automatyzacje",
    status: "Wdrożone",
    title: "Faktury z maila prosto do arkusza",
    description:
      "Faktury z poczty i Telegrama przechodzą przez OCR i model językowy. Rekord z kwotami i VAT trafia do bazy, a plik na Dysk Google.",
    facts: ["0 ręcznego przepisywania"],
    tech: "n8n, OCR, OpenAI, Airtable",
  },
  {
    category: "Automatyzacje",
    status: "Wdrożone",
    title: "Przeniesienie firmy do Google Workspace",
    description:
      "Portal prowadzi pracowników przez przeniesienie dokumentów z prywatnych kont na wspólne dyski. Postęp każdej osoby jest widoczny, a backup uruchamia się z panelu.",
    facts: ["bez SSH i bez instrukcji w PDF"],
    tech: "Cloudflare Workers, Google APIs, R2",
  },
  {
    category: "Strony",
    status: "Na produkcji",
    title: "Cztery strony produktowe, jeden backend leadów",
    description:
      "Wszystkie formularze trafiają do jednego API, które odsiewa spam i przekazuje lead do ERP i automatyzacji. Gdy któryś system nie odpowiada, lead czeka w buforze.",
    facts: ["4 strony", "0 zgubionych leadów przy awarii"],
    tech: "TanStack Start, Cloudflare, Postgres, n8n",
  },
  {
    category: "Strony",
    status: "Na produkcji",
    title: "Marketplace muzyków i lokali",
    description:
      "Muzyk wystawia profil, cennik i kalendarz, lokal rezerwuje termin. Potwierdzona rezerwacja sama staje się wydarzeniem na publicznym afiszu.",
    facts: ["PWA", "rezerwacje i afisz w jednym"],
    tech: "TanStack Start, Hono, Cloudflare",
  },
  {
    category: "Automatyzacje",
    status: "Własne narzędzie",
    title: "Zamówienia w serwisie bez API",
    description:
      "Gdy zewnętrzny serwis otwiera zapisy, system sam składa koszyk i wysyła maila. Decyzję i płatność zostawia człowiekowi.",
    facts: ["działa na harmonogramie i kolejkach"],
    tech: "Cloudflare Workers, D1, Queues",
  },
  {
    category: "Web3",
    status: "Własny produkt",
    title: "Platforma botów tradingowych GRID",
    description:
      "Boty grid na dwóch giełdach, logowanie portfelem i adaptacyjny trailing take-profit dla pozycji long i short.",
    facts: ["2 giełdy", "8 miesięcy rozwoju"],
    tech: "React, wagmi, Express, Docker",
  },
  {
    category: "Web3",
    status: "Wdrożone",
    title: "Portfele jako usługa",
    description:
      "API generuje adresy, sprawdza salda i wykonuje transfery. Klucze nie opuszczają sejfu.",
    facts: ["4 sieci blockchain", "klucze w HashiCorp Vault"],
    tech: "Hono, Cloudflare Workers, Vault",
  },
  {
    category: "Bezpieczeństwo",
    status: "Własne narzędzie",
    title: "Audyt SEO i bezpieczeństwa z agentem naprawczym",
    description:
      "Crawl do 500 podstron, PageSpeed, SSL, nagłówki i poczta. Agent AI poprawia kod strony albo pisze kroki naprawy.",
    facts: ["500 podstron w kilka minut", "raport z priorytetami"],
    tech: "TanStack Start, Cloudflare, Claude Code",
    link: AUDIT_LINK,
  },
];

// Własne produkty Piotra: jedyne karty z nazwą i linkiem.
export const products: Product[] = [
  {
    name: "OddajHajs",
    description:
      "Platforma do zarządzania wspólnymi wydatkami. Umożliwia łatwe rozliczanie się między znajomymi, współlokatorami czy członkami grupy. Dodatkowo oferuje czat, kalendarz oraz system przypomnień, co ułatwia komunikację i organizację rozliczeń.",
    url: "https://oddajhajs.org",
  },
  {
    name: "HomeCashflow",
    description:
      "Aplikacja do zarządzania budżetem domowym i wspólnymi finansami. Pomaga kontrolować wydatki, planować oszczędności i śledzić prognozy finansowe. Umożliwia też sterowanie inteligentnymi wtyczkami i urządzeniami oraz monitorowanie zużycia energii i jej kosztów.",
    url: "https://homecashflow.org",
  },
  {
    name: "MindWander",
    description:
      "Rozszerzenie do przeglądarki pomagające odkrywać nowe tematy poza bańką informacyjną. Wykorzystuje AI do proponowania zaskakujących połączeń między zagadnieniami. Oferuje analizę treści, kreatywne wyszukiwanie, sugestie i nieinwazyjny interfejs.",
    url: "https://mind-wander.org",
  },
  {
    name: "ETHFinder",
    description:
      "Bezpieczny generator adresów Ethereum z niestandardowymi wzorcami. Generuje adresy z określonymi prefiksami i sufiksami całkowicie w przeglądarce - bez komunikacji z serwerem, maksymalne bezpieczeństwo. Zawiera kalkulator prawdopodobieństwa i nowoczesny interfejs.",
    url: "https://ethfinder.org",
  },
];

export const processSteps: ProcessStep[] = [
  {
    title: "Rozmowa, 30 minut",
    description: "Który proces kosztuje najwięcej czasu.",
  },
  {
    title: "Audyt",
    description:
      "Mapa procesu, ile godzin miesięcznie da się odzyskać, stała cena pilota.",
  },
  {
    title: "Pilot w 1–2 tygodnie",
    description: "Jeden proces działa na prawdziwych danych.",
  },
  {
    title: "Wdrożenie i utrzymanie",
    description: "Monitoring, changelog i możliwość wycofania każdej zmiany.",
  },
];

export const reasons: string[] = [
  "Jedna osoba od audytu po utrzymanie, więc nikt nie traci kontekstu.",
  "Kod, konta i klucze zostają u Ciebie, bez uzależnienia od dostawcy.",
  "Testy i automatyczne sprawdzanie przy każdej zmianie.",
  "RODO, KSeF i AI Act wbudowane w system, a nie w regulamin.",
  "Utrzymanie na Cloudflare, często za kilkadziesiąt złotych miesięcznie.",
  "Pracuję z narzędziami AI, a każdą zmianę i tak sprawdza człowiek.",
];

export const techStack: string[] = [
  "TypeScript",
  "React",
  "Next.js",
  "TanStack",
  "Hono",
  "Cloudflare Workers",
  "Postgres",
  "Python",
  "LiveKit",
  "Claude",
  "OpenAI",
  "n8n",
  "Docker",
  "Terraform",
  "Solidity",
];

export const cooperation: string[] = [
  "Pilot za stałą cenę po audycie.",
  "Wdrożenie wycenione po pilocie.",
  "Utrzymanie w miesięcznym abonamencie.",
];

export const faq: FaqItem[] = [
  {
    question: "Ile to kosztuje?",
    answer:
      "Wycena po 30-minutowej rozmowie. Pilot ma stałą cenę, znaną przed startem.",
  },
  {
    question: "Ile trwa wdrożenie?",
    answer:
      "Pilot 1–2 tygodnie, większy system kilka tygodni w etapach, z działającą częścią po każdym etapie.",
  },
  {
    question: "Czy moje dane są bezpieczne?",
    answer:
      "Dane zostają na Twoich kontach. Dostęp jest ograniczony do niezbędnego, a hosting może być w UE.",
  },
  {
    question: "Czy muszę znać się na technologii?",
    answer:
      "Nie. Wystarczy opis procesu, a resztę pokazuję na działającym pilocie.",
  },
  {
    question: "Co, jeśli coś przestanie działać?",
    answer:
      "Monitoring zgłasza awarię, zanim zgłosi ją klient. Każdą zmianę da się wycofać.",
  },
  {
    question: "Czy voicebot może legalnie dzwonić do klientów?",
    answer:
      "Tak, jeśli przedstawia się jako automat i dzwoni do osób ze zgodą. Oba warunki wymusza kod, nie scenariusz.",
  },
];

// Formularz pokazuje te tematy, a API przyjmuje tylko je.
export const contactTopics = [
  "Agent AI",
  "CRM/ERP",
  "Automatyzacja",
  "Strona lub aplikacja",
  "Web3",
  "Audyt SEO/bezpieczeństwa",
  "Inne",
] as const;
