# Przewodnik wdrożenia na Hostingera

## Wymagane zmienne środowiskowe

Aplikacja wymaga następujących zmiennych środowiskowych:

```
RECAPTCHA_SECRET_KEY=twoj_secret_key_reCAPTCHA
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=twoj_email@domena.pl
SMTP_PASS=twoje_haslo_smtp
MAIL_TO=twoj_email@domena.pl
```

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

### Błędy SMTP

- Sprawdź dane SMTP w panelu Hostingera
- Upewnij się, że używasz poprawnego portu (465 dla SSL)
- Sprawdź, czy hasło SMTP jest poprawne

### Błędy reCAPTCHA

- Sprawdź, czy `RECAPTCHA_SECRET_KEY` jest ustawione
- Upewnij się, że używasz tego samego klucza co w kodzie frontendowym

## Wsparcie

W razie problemów sprawdź:
- [Dokumentacja Hostingera](https://www.hostinger.pl/pomoc)
- [Dokumentacja Next.js](https://nextjs.org/docs)
