import dotenv from "dotenv";
import path from "path";
import { sendEmail } from "../src/utils/send-email";

// Load .env from backend root
dotenv.config({ path: path.join(__dirname, "../.env") });

async function main() {
  console.log("\n🚀 SMTP Connection Test Utility");
  console.log("───────────────────────────────");
  
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const to = process.env.SMTP_USER; // Send to self

  if (!host || !user) {
    console.error("❌ ERROR: SMTP_HOST or SMTP_USER is not defined in .env");
    process.exit(1);
  }

  console.log(`📡 Connecting to: ${host}...`);
  console.log(`📧 Sending to self: ${to}...`);

  try {
    await sendEmail({
      to: to || "",
      subject: "Test Email from E-Commerce Platform",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h1 style="color: #111827;">SMTP Test Successful! ✅</h1>
          <p>This is a test email from your local development environment.</p>
          <p>Your current settings are working perfectly. You can now send real emails to your customers.</p>
          <hr>
          <p style="font-size: 12px; color: #6b7280;">Sent at: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });
    console.log("\n✨ SUCCESS! Test email sent successfully.");
    console.log("Please check your inbox (or SPAM folder) to confirm.");
  } catch (err) {
    console.error("\n❌ FAILED to send test email.");
    console.error(err);
    process.exit(1);
  }
}

main();
