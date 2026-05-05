import nodemailer from "nodemailer";
import { Resend } from "resend";
import { formatBDT } from "@/lib/utils";

type OrderEmailItem = {
  name: string;
  quantity: number;
  price: number;
};

type OrderEmailInput = {
  orderNumber: string;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  items: OrderEmailItem[];
};

type DeliveryResult = { sent: true; provider: "smtp" | "resend" } | { sent: false; reason: string };

export async function sendAdminOrderEmail(order: OrderEmailInput): Promise<DeliveryResult> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return { sent: false, reason: "ADMIN_EMAIL is not configured." };
  }

  const subject = `New GadgetGallery order ${order.orderNumber}`;
  const html = orderEmailHtml(order);
  const text = orderEmailText(order);
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
        subject,
        html,
        text
      });

      return { sent: true, provider: "smtp" };
    } catch (error) {
      smtpFailure = error instanceof Error ? error.message : "Unknown SMTP error";
      console.error("SMTP admin order email failed. Falling back to Resend if configured.", error);
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
      subject,
      html
    });

    return { sent: true, provider: "resend" };
  } catch (error) {
    const resendFailure = error instanceof Error ? error.message : "Unknown Resend error";
    console.error("Resend admin order email failed.", error);
    return {
      sent: false,
      reason: smtpFailure ? `SMTP failed: ${smtpFailure}. Resend failed: ${resendFailure}` : resendFailure
    };
  }
}

function orderEmailHtml(order: OrderEmailInput) {
  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e5ecea;color:#101827">${escapeHtml(item.name)} x ${item.quantity}</td>
          <td align="right" style="padding:12px 0;border-bottom:1px solid #e5ecea;color:#101827;font-weight:700">${formatBDT(item.price * item.quantity)}</td>
        </tr>
      `
    )
    .join("");

  return `
    <div style="margin:0;padding:0;background:#f3f7f6;font-family:Arial,Helvetica,sans-serif;color:#101827">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f3f7f6;padding:32px 0">
        <tr>
          <td align="center" style="padding:32px 16px">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;border-collapse:collapse;background:#ffffff;border:1px solid #dbe7e4;border-radius:12px;overflow:hidden">
              <tr>
                <td style="padding:28px 32px;background:#0f766e;color:#ffffff">
                  <div style="font-size:22px;font-weight:800">GadgetGallery</div>
                  <div style="margin-top:6px;font-size:14px;color:#ccfbf1">New order received</div>
                </td>
              </tr>
              <tr>
                <td style="padding:32px">
                  <h1 style="margin:0;font-size:24px;line-height:1.25;color:#101827">Order ${escapeHtml(order.orderNumber)}</h1>
                  <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#52615d">
                    Payment method: <strong style="color:#101827">${escapeHtml(order.paymentMethod)}</strong>
                  </p>
                  <div style="margin:24px 0;padding:18px;background:#f8fafc;border:1px solid #e5ecea;border-radius:10px">
                    <div style="font-size:13px;font-weight:800;text-transform:uppercase;color:#0f766e">Ship to</div>
                    <p style="margin:8px 0 0;font-size:15px;line-height:1.7;color:#101827">
                      ${escapeHtml(order.shippingAddress.name)}<br />
                      ${escapeHtml(order.shippingAddress.phone)}<br />
                      ${escapeHtml(order.shippingAddress.street)}, ${escapeHtml(order.shippingAddress.city)}${order.shippingAddress.postalCode ? ` - ${escapeHtml(order.shippingAddress.postalCode)}` : ""}<br />
                      ${escapeHtml(order.shippingAddress.country)}
                    </p>
                  </div>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
                    ${rows}
                    ${totalRow("Subtotal", order.subtotal)}
                    ${totalRow("Shipping", order.shipping)}
                    ${totalRow("Tax", order.tax)}
                    <tr>
                      <td style="padding:16px 0 0;color:#101827;font-size:18px;font-weight:800">Total</td>
                      <td align="right" style="padding:16px 0 0;color:#101827;font-size:18px;font-weight:800">${formatBDT(order.total)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function totalRow(label: string, value: number) {
  return `
    <tr>
      <td style="padding:12px 0 0;color:#52615d">${label}</td>
      <td align="right" style="padding:12px 0 0;color:#101827;font-weight:700">${formatBDT(value)}</td>
    </tr>
  `;
}

function orderEmailText(order: OrderEmailInput) {
  const items = order.items.map((item) => `${item.name} x ${item.quantity}: ${formatBDT(item.price * item.quantity)}`).join("\n");
  return `New order ${order.orderNumber}\n\n${items}\n\nTotal: ${formatBDT(order.total)}\nShip to: ${order.shippingAddress.name}, ${order.shippingAddress.phone}, ${order.shippingAddress.street}, ${order.shippingAddress.city}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
