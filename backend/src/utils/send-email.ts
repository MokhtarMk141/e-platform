import nodemailer from "nodemailer";
import { env } from "../config/env";

/**
 * Send an email. In development, logs to console instead of sending.
 * In production, uses SMTP transport via env vars.
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  // Development: log to console
  if (env.NODE_ENV !== "production") {
    console.log("\n📧 ═══════════════════════════════════════════");
    console.log(`📧  TO: ${options.to}`);
    console.log(`📧  SUBJECT: ${options.subject}`);
    console.log(`📧  BODY:`);
    console.log(options.html);
    console.log("📧 ═══════════════════════════════════════════\n");
    return;
  }

  // Production: send via SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@ecommerce.com",
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}
