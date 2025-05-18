import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { name, email, message, token } = await req.json();

  // Walidacja reCAPTCHA
  const recaptchaRes = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=6Lc2IT8rAAAAANLZruh6aCBQCvm0xuIg67Ek-hQK&response=${token}`,
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
  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Wszystkie pola są wymagane." },
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
