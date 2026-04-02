import nodemailer from "nodemailer";
import { env } from "../config/env";

/**
 * Send an email. In development, logs to console if SMTP is not configured.
 * If SMTP is configured, sends for real.
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const isSmtpConfigured = env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS;

  // Development: log to console if NOT configured or if explicitly in dev mode without SMTP
  if (!isSmtpConfigured && env.NODE_ENV !== "production") {
    console.log("\n📧 ════════════ [DEV MODE: LOGGING EMAIL] ════════════");
    console.log(`📧  SENT TO  : ${options.to}`);
    console.log(`📧  SUBJECT  : ${options.subject}`);
    console.log("📧 ───────────────────────────────────────────────────");
    console.log(options.html);
    console.log("📧 ═══════════════════════════════════════════════════\n");
    return;
  }

  // Production or Dev with SMTP: send via SMTP
  try {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: env.NODE_ENV === "production", // Allow self-signed in dev
      },
    });

    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (env.NODE_ENV !== "production") {
      console.log(`✅ Email sent successfully to ${options.to} via SMTP (${env.SMTP_HOST})`);
    }
  } catch (error) {
    console.error("❌ Failed to send email via SMTP:", error);
    
    // Fallback to console log in development so we don't lose the email content
    if (env.NODE_ENV !== "production") {
      console.log("\n⚠️ [SMTP FAILED: FALLBACK TO LOGGING]");
      console.log(`📧  TO: ${options.to}`);
      console.log(`📧  SUBJECT: ${options.subject}`);
      console.log(options.html);
      console.log("═══════════════════════════════════════\n");
    } else {
      // In production, we should probably re-throw or handle it globally
      throw error;
    }
  }
}
