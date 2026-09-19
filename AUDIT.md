# Audyt kodu i bezpieczeństwa — 2026-09-19

Zakres: kod śledzony w Git, zależności npm, formularz kontaktowy, konfiguracja
Docker/Next.js i GitHub. Bez testów penetracyjnych produkcji, dostępu do hostingu
ani pełnego skanowania historycznych sekretów. Brak znalezionych podatności
zależności nie oznacza braku błędów aplikacji.

## Ustalenia i poprawki

| Priorytet | Ustalenie | Status |
|---|---|---|
| Wysoki | `.dockerignore` nie wykluczał `.env*`, `.git` i `.next`; `COPY . .` dołączało je do etapu budowania. | Poprawiono wykluczenia. Nie badano istniejących obrazów ani cache na serwerze. |
| Średni | API czytało cały JSON przed sprawdzeniem rozmiaru; limity pól nie ograniczały pamięci zużytej podczas parsowania. | Limit rzeczywistych bajtów strumienia: 40 000, odpowiedź 413; walidacja przed wywołaniem usług zewnętrznych. |
| Średni | Weryfikacja CAPTCHA była poza obsługą błędów, bez timeoutu, a sekret był w URL. | Timeout, POST body, kontrolowane błędy 502 i zamknięta ścieżka wysyłki przy nieudanej weryfikacji. |
| Średni | Nieudana wysyłka pozostawiała zużyty token CAPTCHA w formularzu. | Reset po każdej próbie wysyłki do API. |
| Średni | Brak CI i testów; `npm test` był placeholderem. | CI: instalacja z lockfile, lint, typy, 17 testów API i build; patch/minor auto-merge po sukcesie i zgodności SHA. |
| Średni | Alerty podatności GitHuba wyłączone. | Włączono; GET po zmianie zakończony sukcesem. |
| Niski | `next.config.ts` zawierał zbędny callback webpack z `any`, blokujący lint. | Usunięto callback, dodano typ NextConfig i jawny katalog śledzenia plików. |
| Niski | Polityka prywatności zaprzeczała przekazywaniu danych zewnętrznym dostawcom. | Opisano faktyczne użycie Resend i Google reCAPTCHA; nie jest to pełny audyt prawny. |

## Pozostałe problemy

**Pilne — alerty zależności z GitHuba po publikacji.** Po pushu GitHub zgłosił
otwarte podatności mimo lokalnego wyniku `npm audit: 0`. Odczyt alertów potwierdził
m.in. dwie krytyczne podatności Next.js (RCE; warunki zależne od funkcji/platformy).
Lockfile zawiera Next.js 15.5.20; według alertów poprawki są w 15.5.24.
Pozostałe zgłoszenia dotyczą m.in. sharp, js-yaml, browserslist, nanoid,
brace-expansion i postcss. Nie naprawiono ich w commicie migracji Resend.
Aktualny status: [alerty Dependabota](https://github.com/PiotrSobiecki/sobiecki_org/security/dependabot).
Lokalny wynik audytu npm nie powinien być traktowany jako potwierdzenie braku podatności.

1. **Średni — brak limitu częstotliwości `/api/contact`.** CAPTCHA chroni wysyłkę,
   lecz endpoint nadal przyjmuje nieograniczoną liczbę żądań. Ustawić limit na
   reverse proxy/WAF, razem z timeoutem odbioru body. Konfiguracja hostingu nie
   jest dostępna w repo; lokalny licznik w pamięci nie zapewni limitu globalnego.
2. **Średni — kilka okien Sapera używa tych samych identyfikatorów DOM.**
   `src/components/games/minesweeper.tsx:92`: kolejne otwarcie pobiera pierwszy
   canvas przez `getElementById`. Przekazać element okna do inicjalizacji i
   wyszukiwać canvas/statusy w jego obrębie.
3. **Niski — wycieki listenerów i timerów.** Saper dokłada listenery dokumentu
   przy każdym otwarciu (linie 79, 86), a zamknięcie okna ich nie usuwa.
   Animacje navbar/hero nie czyszczą wszystkich interwałów przy unmount.
4. **Średni, dostępność — zamknięte menu mobilne nadal zawiera elementy fokusowalne.**
   `src/components/ui/navbar.tsx:158`: opacity i pointer-events nie usuwają linków
   z nawigacji klawiaturą. Użyć `inert` lub warunkowego renderowania oraz zarządzania fokusem.
5. **Niski — rozbudowany manifest zależności.** Root deklaruje bezpośrednio wiele
   narzędzi i bibliotek używanych pośrednio. Utrudnia aktualizacje i zwiększa
   liczbę PR-ów. Uporządkować osobno, zachowując wyłącznie faktyczne importy i narzędzia.

Statyczne `innerHTML` Sapera nie zawiera danych użytkownika; nie stwierdzono na
tej podstawie XSS. Nie znaleziono śledzonych plików `.env*`, `.pem`, `.key` ani
commitów `.env` / `.env.local` w wykonanym sprawdzeniu nazw plików.

## Konfiguracja i weryfikacja

- Dependabot: npm i GitHub Actions, poniedziałek 07:00 Europe/Warsaw.
  Konfiguracja zaczyna działać po umieszczeniu na domyślnej gałęzi GitHuba.
  Majory wymagają ręcznego przeglądu. Automatyczne security fixes nie były włączane.
- Resend: `RESEND_API_KEY`, `RESEND_FROM`, `MAIL_TO`; Google nadal odpowiada za CAPTCHA.
- Testy API izolują sieć: nie wysyłają wiadomości i nie potrzebują sekretów.
- `npm audit`: lokalnie 0; GitHub później zgłosił podatności tego lockfile,
  w tym krytyczne — patrz sekcja powyżej.
- `npm run lint`, `npm run typecheck`, `npm test`: zaliczone (17 testów).
- `npm run build`: zaliczony po migracji Resend.
- Playwright: karta HomeCashflow i jej adres, brak Signum Wallet, wypełnienie
  formularza, blokada wysyłki bez CAPTCHA, brak błędów JavaScript — zaliczone.
  Test nie potwierdza doręczenia maila ani produkcyjnej konfiguracji CAPTCHA.
- Test integracyjny Resend: jedna przykładowa wiadomość przesłana przez lokalny
  formularz w Playwright z `noreply@sobiecki.org` do `it@sobiecki.org`;
  API kontaktowe zwróciło 200 i `success: true`, czyli Resend przyjął wiadomość.
  Użyto oficjalnych kluczy testowych Google tylko w środowisku procesu testowego.
  Użytkownik potwierdził otrzymanie wiadomości i poprawne działanie wysyłki.
- YAML Dependabota i CI: weryfikacja parserem; działanie na GitHubie wymaga publikacji.

Źródła: [harmonogram Dependabota](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference),
[API Resend](https://resend.com/docs/api-reference/emails/send-email),
[uprawnienia tokenu Dependabota](https://docs.github.com/en/code-security/reference/supply-chain-security/troubleshoot-dependabot/dependabot-on-actions#changing-github_token-permissions).
