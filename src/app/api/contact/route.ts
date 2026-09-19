import { NextRequest, NextResponse } from "next/server";

// Limity chronią przed nadużyciem formularza do wysyłki gigantycznych maili.
const MAX_NAME = 200;
const MAX_EMAIL = 320; // maks. długość adresu e-mail wg RFC 5321
const MAX_MESSAGE = 5000;
const MAX_BODY_BYTES = 40_000;
const REQUEST_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
let windowStartedAt = 0;
let requestCount = 0;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  // Process-wide backstop: never trust client-supplied IP headers for this limit.
  // The production reverse proxy additionally enforces a shared limit.
  const now = Date.now();
  if (now - windowStartedAt >= REQUEST_WINDOW_MS) {
    windowStartedAt = now;
    requestCount = 0;
  }
  if (++requestCount > MAX_REQUESTS_PER_WINDOW) {
    return NextResponse.json(
      { error: "Zbyt wiele prób. Spróbuj ponownie za chwilę." },
      { status: 429, headers: { "Retry-After": String(Math.max(1, Math.ceil((windowStartedAt + REQUEST_WINDOW_MS - now) / 1000))) } },
    );
  }
  const reader = req.body?.getReader();
  if (!reader) return NextResponse.json({ error: "Nieprawidłowe żądanie." }, { status: 400 });
  let body: unknown;
  let bodyTimedOut = false;
  const bodyTimeout = setTimeout(() => {
    bodyTimedOut = true;
    void reader.cancel().catch(() => {});
  }, 10_000);
  try {
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (bodyTimedOut) {
        return NextResponse.json({ error: "Przekroczono czas odbierania żądania." }, { status: 408 });
      }
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return NextResponse.json({ error: "Przekroczono dozwolony rozmiar żądania." }, { status: 413 });
      }
      chunks.push(value);
    }
    body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return NextResponse.json(
      { error: "Nieprawidłowe żądanie." },
      { status: 400 }
    );
  } finally {
    clearTimeout(bodyTimeout);
    reader.releaseLock();
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Nieprawidłowe żądanie." }, { status: 400 });
  }

  const { name, email, message, token } = body as Record<
    string,
    unknown
  >;

  // Walidacja pól
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !message.trim()
  ) {
    return NextResponse.json(
      { error: "Wszystkie pola są wymagane." },
      { status: 400 }
    );
  }

  if (
    name.length > MAX_NAME ||
    email.length > MAX_EMAIL ||
    message.length > MAX_MESSAGE
  ) {
    return NextResponse.json(
      { error: "Przekroczono dozwoloną długość pól." },
      { status: 400 }
    );
  }

  if (!EMAIL_RE.test(email) || /[\r\n]/.test(name)) {
    return NextResponse.json(
      { error: "Nieprawidłowy adres e-mail." },
      { status: 400 }
    );
  }

  if (typeof token !== "string" || !token.trim() || token.length > 8192) {
    return NextResponse.json({ error: "Potwierdź, że nie jesteś robotem." }, { status: 400 });
  }
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.MAIL_TO;
  const captchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  if (!apiKey || !from || !to || !captchaSecret) {
    return NextResponse.json({ error: "Formularz jest chwilowo niedostępny." }, { status: 503 });
  }

  try {
    const recaptchaRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: captchaSecret, response: token }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!recaptchaRes.ok) throw new Error("Verification unavailable");
    const recaptchaData = await recaptchaRes.json();
    if (recaptchaData?.success !== true) {
      return NextResponse.json({ error: "Błąd weryfikacji reCAPTCHA." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Weryfikacja jest chwilowo niedostępna." }, { status: 502 });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(15_000),
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Nowa wiadomość z formularza kontaktowego od ${name}`,
        reply_to: email,
        text: `Imię i nazwisko: ${name}\nEmail: ${email}\n\nWiadomość:\n${message}`,
      }),
    });
    if (!response.ok) throw new Error("Email provider rejected request");
    const result = await response.json();
    if (typeof result?.id !== "string" || !result.id) throw new Error("Invalid provider response");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Nie udało się wysłać wiadomości." },
      { status: 502 }
    );
  }
}
