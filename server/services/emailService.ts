/**
 * =========================================================================================
 * CloudVault Workspace - Email Service (Nodemailer & SMTP Integration)
 * =========================================================================================
 * Manages dispatching transactional security emails, OTP verification codes,
 * and notifications with responsive HTML templates and SMTP connection pooling.
 */

import nodemailer from 'nodemailer';

// Singleton transporter instance for efficient connection reuse
let transporter: nodemailer.Transporter | null = null;

/**
 * Initializes and retrieves the Nodemailer Transporter singleton.
 * Supports standard Gmail SMTP (App Passwords) and custom enterprise SMTP gateways.
 * 
 * @returns {nodemailer.Transporter | null} Active transporter instance or null if credentials are not configured.
 */
function getEmailTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS ? process.env.GMAIL_PASS.replace(/\s+/g, '') : undefined;

  // Primary Configuration: Direct Gmail Service Transport
  if (gmailUser && gmailPass) {
    try {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser.trim(),
          pass: gmailPass.trim(),
        },
      });
      return transporter;
    } catch (err) {
      console.error('[Email Service] Failed to initialize Gmail SMTP transporter:', err);
      return null;
    }
  }

  // Secondary Configuration: Standard Custom SMTP Gateway
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      return transporter;
    } catch (err) {
      console.error('[Email Service] Failed to initialize custom SMTP transporter:', err);
      return null;
    }
  }

  return null;
}

/**
 * Dispatches a 6-digit One-Time Password (OTP) verification email with an HTML security template.
 * 
 * @param {string} toEmail - Recipient email address
 * @param {string} otpCode - 6-digit numeric verification code
 * @param {string} userName - Optional user display name for personalized greeting
 * @returns {Promise<{ success: boolean; messageId?: string; error?: string }>} Outcome result
 */
export async function sendVerificationOtpEmail(
  toEmail: string,
  otpCode: string,
  userName: string = 'User'
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const mailer = getEmailTransporter();
  const senderEmail = process.env.GMAIL_USER || process.env.SMTP_FROM || 'noreply@cloudvault.internal';

  // Fallback logger for local dev or missing SMTP configurations
  if (!mailer) {
    console.warn(`[Email Service] No SMTP configured. Verification OTP for ${toEmail}: [${otpCode}]`);
    return { success: false, error: 'Email service credentials not initialized.' };
  }

  // Responsive, dark-luxury HTML email layout optimized for mobile and desktop clients
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your CloudVault Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0f19; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #131b2e; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); text-align: center;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">CloudVault Workspace</h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #e0e7ff; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Security & Account Verification</p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #cbd5e1;">
                Hello <strong style="color: #ffffff;">${userName}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #94a3b8;">
                Thank you for creating your account with <strong>CloudVault</strong>. Use the 6-digit verification code below to confirm your email address and activate your cloud storage workspace:
              </p>

              <!-- OTP Code Display Card -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
                <tr>
                  <td align="center" style="background-color: #0b0f19; border: 1px solid #334155; border-radius: 12px; padding: 20px;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #60a5fa; display: inline-block;">
                      ${otpCode}
                    </span>
                  </td>
                </tr>
              </table>

              <p style="margin: 16px 0 0 0; font-size: 12px; color: #64748b; line-height: 18px; text-align: center;">
                ⏳ This code is valid for <strong>15 minutes</strong>. If you did not make this request, please ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0b0f19; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                © ${new Date().getFullYear()} CloudVault Platform. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const info = await mailer.sendMail({
      from: `"CloudVault Security" <${senderEmail}>`,
      to: toEmail,
      subject: `${otpCode} is your CloudVault verification code`,
      text: `Your CloudVault verification code is: ${otpCode}. It expires in 15 minutes.`,
      html: htmlContent,
    });

    console.log(`[Email Service] OTP successfully sent to ${toEmail} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[Email Service] Failed to send email to ${toEmail}:`, err);
    return { success: false, error: err.message };
  }
}
