import { Resend } from "resend";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Email provider interface for abstraction
 */
export interface EmailProvider {
  sendEmail(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

/**
 * Resend email provider implementation
 */
class ResendProvider implements EmailProvider {
  private resend: Resend;
  private fromEmail: string;
  private fromName: string;

  constructor(apiKey: string, fromEmail: string, fromName: string) {
    this.resend = new Resend(apiKey);
    this.fromEmail = fromEmail;
    this.fromName = fromName;
  }

  async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      if (error) {
        console.error("Resend error:", error);
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error("Email sending error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

/**
 * Get email provider instance (factory pattern)
 */
export async function getEmailProvider(): Promise<EmailProvider> {
  const { env } = await getCloudflareContext();

  const apiKey = env.RESEND_API_KEY;
  const fromEmail = env.EMAIL_FROM || "noreply@yourdomain.com";
  const fromName = env.EMAIL_FROM_NAME || "9ja Dental CBT";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  return new ResendProvider(apiKey, fromEmail, fromName);
}

/**
 * Send verification email with link
 */
export async function sendVerificationEmail(
  email: string,
  verificationUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const provider = await getEmailProvider();

    const html = generateVerificationEmailHTML(verificationUrl);

    const result = await provider.sendEmail({
      to: email,
      subject: "Verify Your Email - 9ja Dental CBT",
      html,
    });

    return result;
  } catch (error) {
    console.error("❌ [Email Service] Error sending verification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

/**
 * Generate Verification Email HTML template
 */
function generateVerificationEmailHTML(url: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 0;">
              9ja Dental CBT
            </h1>
          </div>

          <!-- Main Content -->
          <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
            <h2 style="color: #0f172a; font-size: 20px; font-weight: 600; margin: 0 0 16px 0;">
              Verify your email address
            </h2>
            
            <p style="color: #64748b; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
              Thank you for signing up! Please click the button below to verify your email address and activate your account.
            </p>

            <!-- Verification Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${url}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; text-decoration: none; transition: background-color 0.2s;">
                Verify Email Address
              </a>
            </div>

            <p style="color: #64748b; font-size: 14px; line-height: 20px; margin: 24px 0 16px 0;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="color: #64748b; font-size: 14px; line-height: 20px; margin: 0 0 24px 0; word-break: break-all;">
              <a href="${url}" style="color: #2563eb; text-decoration: underline;">${url}</a>
            </p>

            <p style="color: #64748b; font-size: 14px; line-height: 20px; margin: 0;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 32px;">
            <p style="color: #94a3b8; font-size: 12px; line-height: 18px; margin: 0;">
              © ${new Date().getFullYear()} 9ja Dental CBT. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
