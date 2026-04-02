import { User } from "@prisma/client";
import { sendEmail } from "../../utils/send-email";

export class AuthEmailService {
  static async sendPasswordReset(user: User, resetUrl: string) {
    if (!user.email) return;

    const subject = "Password Reset Request";
    const html = this.getTemplate(`
      <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #111827;">Password Reset</h1>
      <p style="margin: 0 0 24px; color: #4b5563; line-height: 1.6;">
        Hi ${user.name},<br>
        We received a request to reset the password for your account. You can reset it by clicking the button below:
      </p>
      
      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${resetUrl}" style="display: inline-block; background: #ff2800; color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 15px; box-shadow: 0 4px 14px rgba(255, 40, 0, 0.25);">Reset Password</a>
      </div>

      <p style="margin: 0 0 16px; color: #4b5563; font-size: 14px; line-height: 1.6;">
        This link will expire in <strong>1 hour</strong>. If you did not request this, you can safely ignore this email.
      </p>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 24px;">
        <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
          If the button above doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #ff2800; word-break: break-all;">${resetUrl}</a>
        </p>
      </div>
    `);

    await sendEmail({ to: user.email, subject, html });
  }

  private static getTemplate(content: string) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f3f4f6; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="padding: 24px; background-color: #111827; text-align: center;">
              <span style="color: #ff2800; font-size: 20px; font-weight: 900; letter-spacing: -0.03em;">E-COMMERCE</span>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px 24px;">
              ${content}
            </div>
            
            <!-- Footer -->
            <div style="padding: 24px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; ${new Date().getFullYear()} E-Commerce Platform. All rights reserved.</p>
              <p style="margin: 8px 0 0; font-size: 11px; color: #9ca3af;">You're receiving this email because a password reset was requested for your account.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
