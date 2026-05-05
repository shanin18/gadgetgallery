import { createHash, randomInt } from "crypto";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { db } from "@/lib/db";

const OTP_TTL_MINUTES = 10;
type EmailDeliveryResult = { sent: true; provider: "smtp" | "resend" } | { sent: false; reason: string };

function hashOtp(email: string, otp: string) {
  return createHash("sha256").update(`${email.toLowerCase()}:${otp}:${process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET}`).digest("hex");
}

export function generateOtp() {
  return String(randomInt(100000, 1000000));
}

export async function createEmailOtp(email: string) {
  const normalizedEmail = email.toLowerCase();
  const otp = generateOtp();
  const identifier = `email-otp:${normalizedEmail}`;
  const expires = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await db.verificationToken.deleteMany({ where: { identifier } });
  await db.verificationToken.create({
    data: {
      identifier,
      token: hashOtp(normalizedEmail, otp),
      expires
    }
  });

  return { otp, expires };
}

export async function verifyEmailOtp(email: string, otp: string) {
  const normalizedEmail = email.toLowerCase();
  const identifier = `email-otp:${normalizedEmail}`;
  const token = hashOtp(normalizedEmail, otp);
  const record = await db.verificationToken.findUnique({
    where: {
      identifier_token: { identifier, token }
    }
  });

  if (!record || record.expires < new Date()) {
    return false;
  }

  await db.$transaction([
    db.user.update({
      where: { email: normalizedEmail },
      data: { emailVerified: new Date() }
    }),
    db.verificationToken.delete({
      where: {
        identifier_token: { identifier, token }
      }
    })
  ]);

  return true;
}

export async function sendEmailOtp(email: string, otp: string): Promise<EmailDeliveryResult> {
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
        to: email,
        subject: "Your GadgetGallery verification code",
        html: otpEmailHtml(otp),
        text: `Your GadgetGallery verification code is ${otp}. This code expires in ${OTP_TTL_MINUTES} minutes.`
      });

      return { sent: true, provider: "smtp" };
    } catch (error) {
      smtpFailure = error instanceof Error ? error.message : "Unknown SMTP error";
      console.error("SMTP OTP email failed. Falling back to Resend if configured.", error);
    }
  }

  if (!process.env.RESEND_API_KEY) {
    return { sent: false, reason: smtpFailure || "SMTP or RESEND_API_KEY is not configured." };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "GadgetGallery <onboarding@resend.dev>",
      to: email,
      subject: "Your GadgetGallery verification code",
      html: otpEmailHtml(otp)
    });

    return { sent: true, provider: "resend" };
  } catch (error) {
    const resendFailure = error instanceof Error ? error.message : "Unknown Resend error";
    console.error("Resend OTP email failed.", error);
    return {
      sent: false,
      reason: smtpFailure ? `SMTP failed: ${smtpFailure}. Resend failed: ${resendFailure}` : resendFailure
    };
  }
}

function otpEmailHtml(otp: string) {
  return `
    <div style="margin:0;padding:0;background:#f3f7f6;font-family:Arial,Helvetica,sans-serif;color:#101827">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f3f7f6;padding:32px 0">
        <tr>
          <td align="center" style="padding:32px 16px">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;border-collapse:collapse;background:#ffffff;border:1px solid #dbe7e4;border-radius:12px;overflow:hidden">
              <tr>
                <td style="padding:28px 32px;background:#0f766e;color:#ffffff">
                  <div style="font-size:22px;font-weight:800;letter-spacing:.2px">GadgetGallery</div>
                  <div style="margin-top:6px;font-size:14px;color:#ccfbf1">Secure account verification</div>
                </td>
              </tr>
              <tr>
                <td style="padding:32px">
                  <h1 style="margin:0;font-size:24px;line-height:1.25;color:#101827">Verify your email address</h1>
                  <p style="margin:14px 0 0;font-size:15px;line-height:1.7;color:#52615d">
                    Use the code below to finish creating your GadgetGallery account.
                  </p>
                  <div style="margin:28px 0;padding:22px 18px;background:#ecfdf5;border:1px solid #99f6e4;border-radius:10px;text-align:center">
                    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.6px;color:#0f766e">Verification code</div>
                    <div style="margin-top:10px;font-size:34px;line-height:1;font-weight:800;letter-spacing:8px;color:#101827">${otp}</div>
                  </div>
                  <p style="margin:0;font-size:14px;line-height:1.7;color:#52615d">
                    This code expires in <strong style="color:#101827">${OTP_TTL_MINUTES} minutes</strong>. If you did not create a GadgetGallery account, you can safely ignore this email.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e5ecea;font-size:12px;line-height:1.6;color:#64736f">
                  GadgetGallery sends this email to protect your account and confirm ownership of this address.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}
