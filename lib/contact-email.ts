import nodemailer from "nodemailer";
import { Resend } from "resend";

export type ContactMessage = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type DeliveryResult = { sent: true; provider: "smtp" | "resend" } | { sent: false; reason: string };

export async function sendContactEmail(message: ContactMessage): Promise<DeliveryResult> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return { sent: false, reason: "ADMIN_EMAIL is not configured." };
  }

  const subject = `GadgetGallery contact: ${message.subject}`;
  const html = contactEmailHtml(message);
  const text = contactEmailText(message);
  let smtpFailure = "";

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD.replace(/\s/g, "")
        }
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: adminEmail,
        replyTo: `${message.name} <${message.email}>`,
        subject,
        html,
        text
      });

      return { sent: true, provider: "smtp" };
    } catch (error) {
      smtpFailure = error instanceof Error ? error.message : "Unknown SMTP error";
      console.error("SMTP contact email failed. Falling back to Resend if configured.", error);
    }
  }

  if (!process.env.RESEND_API_KEY) {
    return { sent: false, reason: smtpFailure || "SMTP or RESEND_API_KEY is not configured." };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "GadgetGallery <onboarding@resend.dev>",
      to: adminEmail,
      replyTo: message.email,
      subject,
      html
    });

    return { sent: true, provider: "resend" };
  } catch (error) {
    const resendFailure = error instanceof Error ? error.message : "Unknown Resend error";
    console.error("Resend contact email failed.", error);
    return {
      sent: false,
      reason: smtpFailure ? `SMTP failed: ${smtpFailure}. Resend failed: ${resendFailure}` : resendFailure
    };
  }
}

function contactEmailHtml(message: ContactMessage) {
  return `
    <div style="margin:0;padding:0;background:#f3f7f6;font-family:Arial,Helvetica,sans-serif;color:#101827">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f3f7f6;padding:32px 0">
        <tr>
          <td align="center" style="padding:32px 16px">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;border-collapse:collapse;background:#ffffff;border:1px solid #dbe7e4;border-radius:12px;overflow:hidden">
              <tr>
                <td style="padding:28px 32px;background:#0f766e;color:#ffffff">
                  <div style="font-size:22px;font-weight:800">GadgetGallery</div>
                  <div style="margin-top:6px;font-size:14px;color:#ccfbf1">New contact message</div>
                </td>
              </tr>
              <tr>
                <td style="padding:32px">
                  <h1 style="margin:0;font-size:24px;line-height:1.25;color:#101827">${escapeHtml(message.subject)}</h1>
                  <div style="margin:22px 0;padding:18px;background:#f8fafc;border:1px solid #e5ecea;border-radius:10px">
                    <p style="margin:0;font-size:15px;line-height:1.7;color:#101827">
                      <strong>Name:</strong> ${escapeHtml(message.name)}<br />
                      <strong>Email:</strong> ${escapeHtml(message.email)}
                    </p>
                  </div>
                  <p style="white-space:pre-line;margin:0;font-size:15px;line-height:1.8;color:#52615d">${escapeHtml(message.message)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function contactEmailText(message: ContactMessage) {
  return `New contact message\n\nName: ${message.name}\nEmail: ${message.email}\nSubject: ${message.subject}\n\n${message.message}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
