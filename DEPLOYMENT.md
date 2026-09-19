# Przewodnik wdrożenia na Hostingera

## Wymagane zmienne środowiskowe

Aplikacja wymaga następujących zmiennych środowiskowych:

```
RECAPTCHA_SECRET_KEY=twoj_secret_key_reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=publiczny_klucz_reCAPTCHA
RESEND_API_KEY=klucz_z_uprawnieniem_do_wysylki
RESEND_FROM=noreply@sobiecki.org
MAIL_TO=it@sobiecki.org
```

`RESEND_FROM` musi należeć do domeny zweryfikowanej w Resend. Adres osoby
wypełniającej formularz trafia do `Reply-To`. Wysyłka korzysta z HTTPS API Resend;
webhook nie jest wymagany. Google reCAPTCHA pozostaje ochroną antyspamową.
Sekrety podaj w konfiguracji środowiska hostingu lub wstrzyknij przez `op run`.
Nie dodawaj ich do repo ani obrazu Docker. Klucz publiczny reCAPTCHA musi być
dostępny podczas budowania (`--build-arg NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...`).

Dokumentacja API: https://resend.com/docs/api-reference/emails/send-email

## Ochrona formularza przed nadmiarem żądań

API ogranicza wszystkie próby do 30 na minutę na proces (odpowiedź 429 i
`Retry-After`), bez polegania na nagłówkach IP dostarczonych przez klienta.
Odbieranie body ma limit 10 sekund i 40 000 bajtów. Limit w aplikacji resetuje
się przy restarcie; nie jest wspólny dla kilku instancji.

Dla produkcyjnego Nginx przygotowane są dwa pliki:

1. `deploy/nginx-contact.conf` — dołącz w kontekście `http {}`; tworzy współdzielone
   strefy ograniczające ruch łącznie i per IP.
2. `deploy/nginx-contact-location.conf` — dołącz wewnątrz istniejącego wirtualnego
   hosta HTTPS `server {}`; kieruje formularz na `127.0.0.1:3000`.

Dopasuj upstream do hostingu. Gdy Nginx jest za CDN/proxy, odtwarzaj prawdziwe IP
wyłącznie z adresów tego zaufanego proxy. Nigdy nie ufaj nagłówkom IP ze wszystkich
adresów. Port aplikacji 3000 powinien być dostępny tylko lokalnie, np. Docker
`-p 127.0.0.1:3000:3000`, aby nie można było ominąć limitu proxy.
Po dołączeniu plików uruchom `nginx -t` i dopiero wtedy przeładuj Nginx.
Pliki w repo nie oznaczają, że reguły są już wdrożone na serwerze.

## Indeksowanie w Google

Strona generuje `/robots.txt` i `/sitemap.xml`, adresy kanoniczne oraz metadane
dla strony głównej i polityki prywatności. Mapa jest wskazana w `robots.txt`.
Po wdrożeniu sprawdź odpowiedzi 200 dla obu plików, zweryfikuj usługę
`sobiecki.org` w Google Search Console i zgłoś
`https://sobiecki.org/sitemap.xml` w sekcji Mapy witryn. Następnie sprawdź URL
strony głównej i poproś o indeksowanie, jeśli Google jeszcze go nie zna.
Weryfikacja własności i zgłoszenie w Search Console wymagają dostępu do konta.
Sitemap pomaga wykrywać strony, ale nie gwarantuje indeksacji ani pozycji.

## Opcja 1: Hostinger VPS (Zalecane - Docker)

Jeśli masz VPS na Hostingerze, możesz użyć Dockera:

### Krok 1: Połącz się z serwerem przez SSH

```bash
ssh uzytkownik@twoj_ip
```

### Krok 2: Zainstaluj Docker (jeśli nie jest zainstalowany)

```bash
# Dla Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER
```

### Krok 3: Sklonuj repozytorium

```bash
cd /var/www
git clone https://github.com/PiotrSobiecki/sobiecki_org.git
cd sobiecki_org
```

### Krok 4: Utwórz plik .env

```bash
nano .env
```

Dodaj wszystkie wymagane zmienne środowiskowe (patrz wyżej).

### Krok 5: Zbuduj i uruchom kontener Docker

```bash
docker build -t sobiecki-org .
docker run -d \
  --name sobiecki-org \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  sobiecki-org
```

### Krok 6: Skonfiguruj reverse proxy (Nginx)

Zainstaluj Nginx:

```bash
sudo apt update
sudo apt install nginx
```

Utwórz konfigurację:

```bash
sudo nano /etc/nginx/sites-available/sobiecki.org
```

Dodaj:

```nginx
server {
    listen 80;
    server_name sobiecki.org www.sobiecki.org;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktywuj konfigurację:

```bash
sudo ln -s /etc/nginx/sites-available/sobiecki.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Krok 7: Skonfiguruj SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d sobiecki.org -d www.sobiecki.org
```

## Opcja 2: Hostinger Cloud Hosting (Node.js)

Jeśli masz Cloud Hosting z obsługą Node.js:

### Krok 1: Połącz się przez FTP/SFTP lub File Manager

### Krok 2: Prześlij pliki projektu

Sklonuj repozytorium lokalnie, zbuduj aplikację i prześlij:

```bash
# Lokalnie
git clone https://github.com/PiotrSobiecki/sobiecki_org.git
cd sobiecki_org
npm install
npm run build
```

### Krok 3: Prześlij następujące pliki/foldery:

- `.next/` (cały folder)
- `public/` (cały folder)
- `package.json`
- `package-lock.json`
- `node_modules/` (lub uruchom `npm install --production` na serwerze)
- `server.js` (z folderu `.next/standalone/`)

### Krok 4: Utwórz plik .env na serwerze

W panelu Hostingera (Node.js App) dodaj zmienne środowiskowe lub utwórz plik `.env` w głównym katalogu aplikacji.

### Krok 5: Skonfiguruj Node.js App w panelu Hostingera

1. Zaloguj się do panelu Hostingera
2. Przejdź do sekcji "Node.js"
3. Utwórz nową aplikację Node.js
4. Ustaw:
   - **Start Command**: `node server.js`
   - **Port**: `3000` (lub port przypisany przez Hostingera)
   - **Working Directory**: katalog z aplikacją

### Krok 6: Uruchom aplikację

W panelu Hostingera uruchom aplikację Node.js.

## Opcja 3: Hostinger Shared Hosting (NIE ZALECANE)

Shared Hosting zazwyczaj nie obsługuje aplikacji Next.js. Jeśli musisz użyć Shared Hosting, rozważ:

1. **Eksport statyczny** - zmień `next.config.ts` na eksport statyczny (ale stracisz funkcjonalność API)
2. **Przenieś się na VPS lub Cloud Hosting**

## Aktualizacja aplikacji

### Dla Dockera:

```bash
cd /var/www/sobiecki_org
git pull
docker build -t sobiecki-org .
docker stop sobiecki-org
docker rm sobiecki-org
docker run -d \
  --name sobiecki-org \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  sobiecki-org
```

### Dla Cloud Hosting:

1. Zaktualizuj pliki przez FTP/SFTP
2. Uruchom `npm install` i `npm run build` na serwerze
3. Zrestartuj aplikację w panelu Hostingera

## Rozwiązywanie problemów

### Aplikacja nie startuje

- Sprawdź logi: `docker logs sobiecki-org` (Docker) lub logi w panelu Hostingera
- Sprawdź, czy wszystkie zmienne środowiskowe są ustawione
- Sprawdź, czy port jest dostępny

### Błędy Resend

- Sprawdź `RESEND_API_KEY`, `RESEND_FROM` i `MAIL_TO` w środowisku serwera.
- Zweryfikuj domenę nadawcy w Resend i dostęp klucza do tej domeny.
- Sprawdź status wiadomości w panelu Resend; odpowiedź API oznacza przyjęcie,
  a nie potwierdzone doręczenie. Nie loguj klucza ani treści formularza.

### Błędy reCAPTCHA

- Sprawdź, czy `RECAPTCHA_SECRET_KEY` jest ustawione
- Upewnij się, że używasz tego samego klucza co w kodzie frontendowym

## Wsparcie

W razie problemów sprawdź:
- [Dokumentacja Hostingera](https://www.hostinger.pl/pomoc)
- [Dokumentacja Next.js](https://nextjs.org/docs)
