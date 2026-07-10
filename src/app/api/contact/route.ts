import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Limity chronią przed nadużyciem formularza do wysyłki gigantycznych maili.
const MAX_NAME = 200;
const MAX_EMAIL = 320; // maks. długość adresu e-mail wg RFC 5321
const MAX_MESSAGE = 5000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Nieprawidłowe żądanie." },
      { status: 400 }
    );
  }

  const { name, email, message, token } = (body ?? {}) as Record<
    string,
    unknown
  >;

  // Walidacja reCAPTCHA
  const recaptchaRes = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(
      process.env.RECAPTCHA_SECRET_KEY ?? ""
    )}&response=${encodeURIComponent(typeof token === "string" ? token : "")}`,
    { method: "POST" }
  );
  const recaptchaData = await recaptchaRes.json();
  if (!recaptchaData.success) {
    return NextResponse.json(
      { error: "Błąd weryfikacji reCAPTCHA." },
      { status: 400 }
    );
  }

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

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Nieprawidłowy adres e-mail." },
      { status: 400 }
    );
  }

  // Konfiguracja nodemailer
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.MAIL_TO,
      subject: `Nowa wiadomość z formularza kontaktowego od ${name}`,
      replyTo: email,
      text: `Imię i nazwisko: ${name}\nEmail: ${email}\n\nWiadomość:\n${message}`,
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Nie udało się wysłać wiadomości." },
      { status: 500 }
    );
  }
}
