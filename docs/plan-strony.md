# Plan przebudowy sobiecki.org (październik 2026)

Cel: strona ma w 10 sekund powiedzieć firmie, co Piotr dla niej zrobi, i pokazać
dowody w postaci działających wdrożeń. Wzorem jest układ aimatic.works (konkretne
procesy w nagłówku, liczby zamiast przymiotników, wdrożenia ze statusem, proces,
FAQ). Treść jest własna.

Pozycjonowanie: jedna osoba, która od rozmowy o procesie po utrzymanie buduje
agentów AI, systemy CRM/ERP i automatyzacje dla firm. Do tego strony i aplikacje
webowe oraz Web3. Wyróżniki: systemy na produkcji, a nie makiety; kod i klucze
należą do klienta; zgodność z RODO, KSeF i AI Act; tanie utrzymanie na Cloudflare.

## Zasady wykonania (dla agenta)

- Pracuj w `C:\Users\piotr\repos\sobiecki.org` na gałęzi `strona-oferta`. Nie
  commituj i nie pushuj: Railway wdraża `main` automatycznie, a zmiany przejrzy
  Piotr.
- Realizuj punkty po kolei. Po każdym uruchom `npm run lint`, `npm run typecheck`,
  `npm test` i `npm run build`, a błędy naprawiaj przed przejściem dalej.
- Trzymaj się istniejącego wyglądu: ciemne tło, akcent `#8b5cf6`, nagłówki Courier
  New, `--radius: 0`, klasy w stylu `blok__element` w `src/app/globals.css`.
  Używaj istniejących komponentów (`ServiceCard`, `ProjectCard`, `useRevealOnIntersect`,
  `getRevealStyle`, obsługa reduced-motion). Bez nowych zależności.
- Teksty strony trzymaj w jednym pliku danych `src/content/oferta.ts` (usługi,
  wdrożenia, proces, FAQ), a komponenty tylko je renderują.
- Przykłady wdrożeń bez nazw firm, bez nazw produktów klientów i bez linków.
- Styl tekstu: krótkie zdania z faktem. Bez „kompleksowy”, „kluczowy”,
  „innowacyjny”, „szyty na miarę”, bez emoji i bez wersalików dla emfazy.
- Nie dodawaj widżetu czatu AI. Gdyby powstał, art. 50 AI Act wymaga ujawnienia
  AI przy pierwszej wiadomości (od 2.08.2026).
- Nie czytaj plików `.env*`. Formularz kontaktowy używa zmiennych tylko z nazwy.
- Dostępność: kolejność nagłówków h1 → h2 → h3, widoczny focus, opisy dla ikon,
  sekcje dostępne z klawiatury.

## Punkty

### 1. Dane treści w `src/content/oferta.ts`

Wydziel z `src/app/page.tsx` tablice `services` i `projects` do nowego pliku
i dodaj tam dane z punktów 3–8. Zachowaj typy (TypeScript, bez `any`).

### 2. Hero

- Plakietka nad nagłówkiem: „Agenci AI · CRM · Automatyzacje”.
- H1: „Automatyzuję obsługę klienta, sprzedaż i papierologię w firmach”.
- Lead: „Voiceboty, które dzwonią i odbierają telefony. CRM zamiast arkuszy.
  Faktury, które same trafiają do księgowości. Projektuję, buduję i utrzymuję
  sam: od rozmowy o procesie po monitoring na produkcji.”
- CTA: „Umów 30 minut rozmowy” (do `#kontakt`) i „Zobacz wdrożenia” (do
  `#wdrozenia`).
- Pasek liczb pod CTA, w czterech kaflach:
  - „~14 tys.”: rekordów w kampanii voicebota,
  - „1000+”: commitów w jednym systemie CRM na produkcji,
  - „500”: podstron w jednym audycie SEO,
  - „0 zł”: za wyjście z umowy, bo kod i klucze zostają u Ciebie.
- Zostaw wideo i efekt binarny w tle.

### 3. Sekcja „Z czym przychodzą firmy” (nowa, `#problemy`)

H2: „Z czym przychodzą firmy”. Sześć krótkich kart, numerowanych 01–06:

1. Leady z formularzy, maili i telefonów lądują w trzech miejscach i część ginie.
2. Ktoś co miesiąc przepisuje faktury do arkusza albo systemu księgowego.
3. Po 17:00 nikt nie odbiera telefonu, a klient dzwoni do konkurencji.
4. Abonament za system SaaS rośnie, a i tak nie pasuje do procesu.
5. Awaria wychodzi dopiero wtedy, gdy klient zgłasza problem.
6. Strona jest wolna, niewidoczna w Google albo ma luki bezpieczeństwa.

### 4. Usługi (`#uslugi`, przebudowa istniejącej sekcji)

H2: „Co mogę wdrożyć”. Osiem kafli (tytuł, 2 zdania, 3 przykłady w punktach):

1. Agenci głosowi i czat: odbieranie i wykonywanie połączeń, kwalifikacja
   leadów, odpowiedzi z bazy wiedzy. Agent przedstawia się jako automat,
   zgodnie z AI Act.
2. CRM i ERP na miarę: leady, lejek, oferty i zadania w jednym miejscu, bez
   abonamentu za stanowisko. Opcjonalnie serwer MCP, przez który asystent AI
   obsługuje kontakty.
3. Automatyzacje i integracje: n8n, API, Telegram, Google Workspace, KSeF.
   Dane przepływają między systemami bez przepisywania.
4. Dokumenty i faktury: OCR i model językowy wyciągają numer, kwoty, VAT
   i kontrahenta, a plik trafia do archiwum.
5. Monitoring i alerty: maszyny, urządzenia IoT i aplikacje zgłaszają problemy
   na Telegram, z filtrowaniem szumu.
6. Strony i aplikacje webowe: szybkie strony z lejkiem leadów i aplikacje
   z panelem klienta.
7. Web3 i trading: boty handlowe, portfele jako usługa z kluczami w sejfie,
   aplikacje dApp.
8. Audyt SEO i bezpieczeństwa: crawl do 500 podstron, SSL, nagłówki, poczta
   (SPF, DKIM, DMARC). Raport z listą poprawek i ich wdrożenie.

### 5. Wdrożenia (`#wdrozenia`, nowa sekcja zamiast „Przykładowe projekty”)

H2: „Wdrożenia”. Podtytuł: „Systemy, które działają u klientów i u mnie.
Bez nazw firm, bo umowy tego wymagają.” Każda karta ma kategorię, status, tytuł,
2 zdania opisu, 2–3 fakty i technologie w jednej linii. Nie ma linku.

| # | Kategoria | Status | Tytuł | Opis | Fakty | Technologie |
|---|---|---|---|---|---|---|
| 1 | Agenci AI | Wdrożone | Voicebot kampanii wychodzącej | Agent dzwoni do bazy kontaktów, przedstawia się jako automat i rozpoznaje pocztę głosową. Gorące leady przekazuje doradcom, resztę zamyka statusem w CRM. | ~14 tys. rekordów w kampanii; dzwoni tylko do kontaktów ze zgodą; wynik rozmowy ustala kod, nie model | Python, LiveKit SIP, Claude, ElevenLabs, Postgres |
| 2 | Agenci AI | Wdrożone | Agent mailowy obsługi klienta | Czyta zgłoszenia, sprawdza dane klienta w CRM i przygotowuje odpowiedź do akceptacji konsultanta. Brakujące procedury dopisuje do bazy wiedzy, oznaczając je do weryfikacji. | człowiek zatwierdza każdą odpowiedź; baza wiedzy rośnie z każdym zgłoszeniem | Python, RAG, Claude |
| 3 | CRM / ERP | Na produkcji | CRM operacyjny dla firmy z infrastrukturą serwerową | Jeden panel prowadzi klientów, maszyny, portfele i miesięczne rozliczenia. Faktury idą przez KSeF, zużycie energii przychodzi z inteligentnych gniazdek, klient ma własny panel. | 1000+ commitów w 8 miesięcy; KSeF; panel klienta | TanStack Start, Hono, Cloudflare, Postgres |
| 4 | CRM / ERP | Na produkcji | ERP sprzedażowy zamiast abonamentu SaaS | Leady z formularzy, lejek, oferty, zadania i powiadomienia zespołu w jednym systemie. Konwersje wracają do Google Ads i GA4, a asystent AI obsługuje kontakty przez MCP. | 0 zł abonamentu za stanowisko; konwersje do Google Ads; serwer MCP | TanStack Start, Hono, Cloudflare, Postgres |
| 5 | Monitoring | Na produkcji | Alerty z infrastruktury na Telegramie | Komunikaty z kilkudziesięciu maszyn trafiają do grupy, z osobnym wątkiem dla każdej lokalizacji. Filtry usuwają duplikaty, pojedyncze restarty i wahania temperatury. | kilkadziesiąt maszyn; wyciszone alerty dalej się zapisują | Cloudflare Durable Objects, Telegram |
| 6 | Automatyzacje | Wdrożone | Faktury z maila prosto do arkusza | Faktury z poczty i Telegrama przechodzą przez OCR i model językowy. Rekord z kwotami i VAT trafia do bazy, a plik na Dysk Google. | 0 ręcznego przepisywania | n8n, OCR, OpenAI, Airtable |
| 7 | Automatyzacje | Wdrożone | Przeniesienie firmy do Google Workspace | Portal prowadzi pracowników przez przeniesienie dokumentów z prywatnych kont na wspólne dyski. Postęp każdej osoby jest widoczny, a backup uruchamia się z panelu. | bez SSH i bez instrukcji w PDF | Cloudflare Workers, Google APIs, R2 |
| 8 | Strony | Na produkcji | Cztery strony produktowe, jeden backend leadów | Wszystkie formularze trafiają do jednego API, które odsiewa spam i przekazuje lead do ERP i automatyzacji. Gdy któryś system nie odpowiada, lead czeka w buforze. | 4 strony; 0 zgubionych leadów przy awarii | TanStack Start, Cloudflare, Postgres, n8n |
| 9 | Strony | Na produkcji | Marketplace muzyków i lokali | Muzyk wystawia profil, cennik i kalendarz, lokal rezerwuje termin. Potwierdzona rezerwacja sama staje się wydarzeniem na publicznym afiszu. | PWA; rezerwacje i afisz w jednym | TanStack Start, Hono, Cloudflare |
| 10 | Automatyzacje | Własne narzędzie | Zamówienia w serwisie bez API | Gdy zewnętrzny serwis otwiera zapisy, system sam składa koszyk i wysyła maila. Decyzję i płatność zostawia człowiekowi. | działa na harmonogramie i kolejkach | Cloudflare Workers, D1, Queues |
| 11 | Web3 | Własny produkt | Platforma botów tradingowych GRID | Boty grid na dwóch giełdach, logowanie portfelem i adaptacyjny trailing take-profit dla pozycji long i short. | 2 giełdy; 8 miesięcy rozwoju | React, wagmi, Express, Docker |
| 12 | Web3 | Wdrożone | Portfele jako usługa | API generuje adresy, sprawdza salda i wykonuje transfery. Klucze nie opuszczają sejfu. | 4 sieci blockchain; klucze w HashiCorp Vault | Hono, Cloudflare Workers, Vault |
| 13 | Bezpieczeństwo | Własne narzędzie | Audyt SEO i bezpieczeństwa z agentem naprawczym | Crawl do 500 podstron, PageSpeed, SSL, nagłówki i poczta. Agent AI poprawia kod strony albo pisze kroki naprawy. | 500 podstron w kilka minut; raport z priorytetami | TanStack Start, Cloudflare, Claude Code |

Pod siatką mała sekcja „Własne produkty” z obecnymi kartami (OddajHajs,
HomeCashflow, MindWander, ETHFinder). Nazwy i linki zostają, bo to produkty
Piotra.

### 6. Proces (`#proces`, nowa sekcja)

H2: „Jak pracuję”. Cztery kroki w poziomej osi, na telefonie w pionie:

1. Rozmowa, 30 minut: który proces kosztuje najwięcej czasu.
2. Audyt: mapa procesu, ile godzin miesięcznie da się odzyskać, stała cena pilota.
3. Pilot w 1–2 tygodnie: jeden proces działa na prawdziwych danych.
4. Wdrożenie i utrzymanie: monitoring, changelog i możliwość wycofania każdej zmiany.

### 7. Dlaczego ja (`#dlaczego`, nowa sekcja)

H2: „Dlaczego ze mną”. Sześć krótkich punktów:

- Jedna osoba od audytu po utrzymanie, więc nikt nie traci kontekstu.
- Kod, konta i klucze zostają u Ciebie, bez uzależnienia od dostawcy.
- Testy i automatyczne sprawdzanie przy każdej zmianie.
- RODO, KSeF i AI Act wbudowane w system, a nie w regulamin.
- Utrzymanie na Cloudflare, często za kilkadziesiąt złotych miesięcznie.
- Pracuję z narzędziami AI, a każdą zmianę i tak sprawdza człowiek.

Pod spodem pasek technologii (tekst, bez logotypów): TypeScript, React, Next.js,
TanStack, Hono, Cloudflare Workers, Postgres, Python, LiveKit, Claude, OpenAI,
n8n, Docker, Terraform, Solidity.

### 8. Współpraca i FAQ (`#faq`, nowa sekcja z istniejącym `accordion`)

Krótki blok „Formy współpracy” (bez kwot): Pilot za stałą cenę po audycie,
wdrożenie wycenione po pilocie, utrzymanie w miesięcznym abonamencie.

FAQ, 6 pytań:

1. Ile to kosztuje? Wycena po 30-minutowej rozmowie. Pilot ma stałą cenę, znaną
   przed startem.
2. Ile trwa wdrożenie? Pilot 1–2 tygodnie, większy system kilka tygodni w etapach,
   z działającą częścią po każdym etapie.
3. Czy moje dane są bezpieczne? Dane zostają na Twoich kontach. Dostęp jest
   ograniczony do niezbędnego, a hosting może być w UE.
4. Czy muszę znać się na technologii? Nie. Wystarczy opis procesu, a resztę
   pokazuję na działającym pilocie.
5. Co, jeśli coś przestanie działać? Monitoring zgłasza awarię, zanim zgłosi ją
   klient. Każdą zmianę da się wycofać.
6. Czy voicebot może legalnie dzwonić do klientów? Tak, jeśli przedstawia się jako
   automat i dzwoni do osób ze zgodą. Oba warunki wymusza kod, nie scenariusz.

### 9. Kontakt

- Podtytuł: „Odpowiadam tego samego dnia roboczego.”
- Dodaj pole „Temat” jako select: Agent AI, CRM/ERP, Automatyzacja, Strona lub
  aplikacja, Web3, Audyt SEO/bezpieczeństwa, Inne.
- `src/app/api/contact/route.ts`: przyjmij `topic` z listy dozwolonych wartości,
  odrzuć inne i dopisz temat do treści maila. Rozszerz `tests/contact.test.cjs`
  o odrzucenie nieznanego tematu.

### 10. Nawigacja i stopka

- Navbar: Usługi, Wdrożenia, Proces, FAQ i przycisk „Kontakt”. Link „saper”
  przenieś do stopki jako „Zagraj w sapera”.
- Stopka: dopisz jedno zdanie „Agenci AI, CRM i automatyzacje dla firm”.

### 11. SEO

- `layout.tsx`: title „Piotr Sobiecki: agenci AI, CRM i automatyzacje dla firm”,
  description około 150 znaków z voicebotami, CRM, automatyzacjami i KSeF. Te
  same teksty w Open Graph.
- JSON-LD `ProfessionalService` z osobą `Person` (imię, e-mail it@sobiecki.org,
  `areaServed: PL`, `knowsAbout` z listą usług).
- `sitemap.ts`: zostaje `/` i polityka prywatności, bo nowe sekcje są kotwicami.
- Sprawdź, że strona ma jeden H1.

### 12. Sprawdzenie końcowe

- `npm run lint && npm run typecheck && npm test && npm run build`.
- `npm run dev`, potem `curl -s localhost:3000 | grep -c 'id="wdrozenia"'` i to
  samo dla `uslugi`, `proces`, `faq`, `kontakt`. Każda kotwica ma wystąpić raz.
- Przeszukaj `src/content/oferta.ts` pod kątem `http`: jedyne linki mają być
  przy „Własnych produktach”.
- Raport dla Piotra: lista zmienionych plików i punkty, których nie udało się
  zrealizować, z powodem.

## Do potwierdzenia przez Piotra przed publikacją

- Statusy wdrożeń 1, 2, 7 i 12 („Wdrożone” vs „Na produkcji”).
- Deklaracje, które są obietnicą handlową: „0 zł za wyjście z umowy”,
  „Odpowiadam tego samego dnia roboczego”, „pilot w 1–2 tygodnie”.
- Rola przy agencie BOK (karta 2 opiera się tylko na części mailowej).
- Czy marketplace muzyków (karta 9) może być pokazany, skoro strona jest publiczna
  i łatwa do rozpoznania.
- Czy publiczny formularz audytu SEO i bezpieczeństwa ma trafić na stronę jako
  lead magnet, tak jak u aimatic. Dziś narzędzie jest prywatne.
