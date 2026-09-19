# Audyt kodu i bezpieczeństwa — 2026-09-19

Zakres: kod śledzony w Git, zależności npm, formularz kontaktowy, konfiguracja
Docker/Next.js i GitHub. Bez testów penetracyjnych produkcji, dostępu do hostingu
ani pełnego skanowania historycznych sekretów. Brak znalezionych podatności
zależności nie oznacza braku błędów aplikacji.

## Ustalenia i poprawki

| Priorytet | Ustalenie | Status |
|---|---|---|
| Krytyczny | Lockfile zawierał Next.js 15.5.20 z podatnościami RCE zgłoszonymi przez GitHub, a także podatne sharp, postcss, js-yaml i brace-expansion. | Next.js 15.5.25, sharp 0.35.4, postcss 8.5.28 (override w manifeście), js-yaml 4.3.2, brace-expansion 1.1.21 i 5.0.12 — wszystkie powyżej wersji naprawczych z alertów. Po pushu GitHub zamknął wszystkie 20 zgłoszeń. Autoprefixer i browserslist zniknęły z drzewa razem z czyszczeniem manifestu. |
| Wysoki | `.dockerignore` nie wykluczał plików konfiguracji środowiska, `.git` i `.next`; `COPY . .` dołączało je do etapu budowania. | Poprawiono wykluczenia. Nie badano istniejących obrazów ani cache na serwerze. |
| Średni | API czytało cały JSON przed sprawdzeniem rozmiaru; limity pól nie ograniczały pamięci zużytej podczas parsowania. | Limit rzeczywistych bajtów strumienia: 40 000, odpowiedź 413; walidacja przed wywołaniem usług zewnętrznych. |
| Średni | Weryfikacja CAPTCHA była poza obsługą błędów, bez timeoutu, a sekret był w URL. | Timeout, POST body, kontrolowane błędy 502 i zamknięta ścieżka wysyłki przy nieudanej weryfikacji. |
| Średni | Nieudana wysyłka pozostawiała zużyty token CAPTCHA w formularzu. | Reset po każdej próbie wysyłki do API. |
| Średni | Brak limitu częstotliwości `/api/contact`. | Limit 30 żądań na minutę na proces, odpowiedź 429 z `Retry-After`, liczony przed CAPTCHA i bez ufania nagłówkom IP. Odbiór body przerywany po 10 s (408). Reguły Nginx dla limitu współdzielonego przygotowane w `deploy/`, niewdrożone — produkcja nie ma własnego proxy. |
| Średni | Kilka okien Sapera używało tych samych identyfikatorów DOM — drugie okno sterowało pierwszym. | Canvas i statusy wyszukiwane w obrębie własnego okna przez atrybuty `data-*`. |
| Średni, dostępność | Zamknięte menu mobilne zostawiało linki w nawigacji klawiaturą. | `inert` i `aria-hidden` po zamknięciu, `aria-expanded`/`aria-controls` na przycisku, pułapka fokusu, Escape zamyka i zwraca fokus. |
| Średni | Brak CI i testów; `npm test` był placeholderem. | CI: instalacja z lockfile, audyt zależności, lint, typy, 20 testów API i build; patch/minor auto-merge po sukcesie i zgodności SHA. |
| Średni | Alerty podatności GitHuba wyłączone. | Włączono; GET po zmianie zakończony sukcesem. |
| Niski | Wycieki listenerów i timerów. | `AbortController` na okno Sapera (zamknięcie odpina też listenery dokumentu), czyszczenie interwałów navbara i hero przy unmount. |
| Niski | Manifest deklarował ponad 250 pakietów pośrednich. | Zostało 12 zależności i 11 narzędzi odpowiadających faktycznym importom. Wersje z automatycznego PR-a Dependabota przeniesione do nowego manifestu. |
| Niski | `next.config.ts` zawierał zbędny callback webpack z `any`, blokujący lint. | Usunięto callback, dodano typ NextConfig i jawny katalog śledzenia plików. |
| Niski | Polityka prywatności zaprzeczała przekazywaniu danych zewnętrznym dostawcom. | Opisano faktyczne użycie Resend i Google reCAPTCHA; nie jest to pełny audyt prawny. |
| Niski, SEO | Metadane strony były w ręcznym `<head>`, bez adresów kanonicznych, mapy witryny i `robots.txt`. | Metadata API Next.js, `metadataBase`, kanoniczne adresy obu stron, Open Graph z `images/cover.png`, `robots.ts` i `sitemap.ts`. |

## Pozostałe problemy

1. **Limit żądań działa tylko w aplikacji.** Produkcja stoi na Railway, gdzie
   nie ma warstwy proxy pod naszą kontrolą, a licznik jest lokalny dla procesu:
   resetuje się przy restarcie i nie obejmuje pozostałych instancji. Limit
   wspólny wymaga włączenia proxy Cloudflare z regułą na `/api/contact` albo
   migracji za własny reverse proxy — reguły Nginx czekają w `deploy/`.
   Decyzja właściciela: zostajemy przy limicie aplikacyjnym.
2. **Smoke test przeglądarkowy nie działa w CI.** `tests/ui_smoke.py` wymaga
   Pythona, przeglądarki Playwright i uruchomionego serwera na porcie 3100;
   uruchamiany ręcznie przed wdrożeniem.
3. **Indeksowanie wymaga dostępu do konta Google.** Weryfikacja własności
   `sobiecki.org` i zgłoszenie mapy witryny w Search Console pozostają po
   stronie właściciela. Mapa nie gwarantuje indeksacji ani pozycji.

Statyczne `innerHTML` Sapera nie zawiera danych użytkownika; nie stwierdzono na
tej podstawie XSS. Nie znaleziono śledzonych plików konfiguracji środowiska,
`.pem` ani `.key` w wykonanym sprawdzeniu nazw plików.

## Konfiguracja i weryfikacja

- Zależności: gałąź zrównana z `origin/main` (automatyczny PR Dependabota #1),
  zakresy wersji z tego PR-a przeniesione do wyczyszczonego manifestu.
  `npm ci` i `npm audit --audit-level=low`: 0 podatności. Po pushu CI na main
  zaliczone, lista alertów Dependabota pusta.
- Produkcja: Railway z wdrożeniem po pushu na `main`, DNS na Cloudflare
  w trybie DNS only. Po wdrożeniu `robots.txt` i `sitemap.xml` odpowiadają 200.
- Dependabot: npm i GitHub Actions, poniedziałek 07:00 Europe/Warsaw.
  Majory wymagają ręcznego przeglądu. Automatyczne security fixes nie były włączane.
- Resend: `RESEND_API_KEY`, `RESEND_FROM`, `MAIL_TO`; Google nadal odpowiada za CAPTCHA.
- Testy API izolują sieć: nie wysyłają wiadomości i nie potrzebują sekretów.
- `npm run lint`, `npm run typecheck`, `npm test` (20 testów), `npm run build`: zaliczone.
- Playwright na buildzie produkcyjnym: treść karty HomeCashflow, adresy kanoniczne,
  `robots.txt` i `sitemap.xml`, blokada wysyłki bez CAPTCHA, dwa niezależne okna
  Sapera z odpinaniem listenerów, klawiaturowa obsługa menu mobilnego, brak błędów
  JavaScript — zaliczone. Test nie potwierdza doręczenia maila ani produkcyjnej
  konfiguracji CAPTCHA.
- Test integracyjny Resend (wcześniejszy): jedna wiadomość przesłana przez lokalny
  formularz z `noreply@sobiecki.org` do `it@sobiecki.org`, API zwróciło 200
  i `success: true`. Użyto oficjalnych kluczy testowych Google tylko w środowisku
  procesu testowego. Użytkownik potwierdził otrzymanie wiadomości.
- YAML Dependabota i CI: weryfikacja parserem; działanie na GitHubie wymaga publikacji.

Źródła: [harmonogram Dependabota](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference),
[API Resend](https://resend.com/docs/api-reference/emails/send-email),
[uprawnienia tokenu Dependabota](https://docs.github.com/en/code-security/reference/supply-chain-security/troubleshoot-dependabot/dependabot-on-actions#changing-github_token-permissions),
[Metadata API Next.js](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
