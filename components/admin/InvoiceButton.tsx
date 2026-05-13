"use client";

import { Printer } from "lucide-react";
import { formatBDT } from "@/lib/utils";

type InvoiceItem = {
  name: string;
  quantity: number;
  price: number;
};

type InvoiceOrder = {
  orderNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string[];
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function InvoiceButton({ order }: { order: InvoiceOrder }) {
  function printInvoice() {
    const invoiceWindow = window.open("", "_blank", "width=900,height=720");
    if (!invoiceWindow) return;

    const rows = order.items
      .map(
        (item) => `
          <tr>
            <td>${escapeHtml(item.name)}</td>
            <td>${item.quantity}</td>
            <td>${formatBDT(item.price)}</td>
            <td>${formatBDT(item.price * item.quantity)}</td>
          </tr>
        `
      )
      .join("");

    invoiceWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Invoice ${escapeHtml(order.orderNumber)}</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; background: #eef5f3; color: #101827; font-family: Arial, Helvetica, sans-serif; }
            .invoice { max-width: 820px; margin: 32px auto; background: #fff; border: 1px solid #dbe7e4; border-radius: 14px; overflow: hidden; }
            .header { display: flex; justify-content: space-between; gap: 24px; padding: 32px; background: #0f766e; color: #fff; }
            .brand { font-size: 28px; font-weight: 800; }
            .muted { color: #64736f; }
            .header .muted { color: #ccfbf1; }
            .section { padding: 28px 32px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
            .box { border: 1px solid #dbe7e4; border-radius: 10px; padding: 16px; background: #f8fafc; }
            .label { margin-bottom: 8px; color: #0f766e; font-size: 12px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th { color: #64736f; font-size: 12px; text-align: left; text-transform: uppercase; }
            th, td { padding: 12px 0; border-bottom: 1px solid #e5ecea; }
            td:nth-child(2), td:nth-child(3), td:nth-child(4), th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: right; }
            .totals { margin-left: auto; margin-top: 20px; width: min(320px, 100%); }
            .line { display: flex; justify-content: space-between; padding: 8px 0; }
            .grand { margin-top: 8px; border-top: 2px solid #101827; padding-top: 14px; font-size: 20px; font-weight: 800; }
            .actions { margin: 24px auto; max-width: 820px; text-align: right; }
            button { height: 42px; border: 0; border-radius: 8px; background: #0f766e; color: #fff; padding: 0 18px; font-weight: 800; cursor: pointer; }
            @media print {
              body { background: #fff; }
              .invoice { margin: 0; max-width: none; border: 0; border-radius: 0; }
              .actions { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="header">
              <div>
                <div class="brand">GadgetGallery</div>
                <p class="muted">Order invoice</p>
              </div>
              <div>
                <strong>${escapeHtml(order.orderNumber)}</strong>
                <p class="muted">${escapeHtml(order.date)}</p>
              </div>
            </div>
            <div class="section">
              <div class="grid">
                <div class="box">
                  <div class="label">Bill to</div>
                  <strong>${escapeHtml(order.customerName)}</strong><br />
                  ${escapeHtml(order.customerEmail)}<br />
                  ${escapeHtml(order.customerPhone)}
                </div>
                <div class="box">
                  <div class="label">Deliver to</div>
                  ${order.shippingAddress.map((line) => escapeHtml(line)).join("<br />")}
                </div>
              </div>
              <table>
                <thead>
                  <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
              <div class="totals">
                <div class="line"><span>Subtotal</span><strong>${formatBDT(order.subtotal)}</strong></div>
                ${order.discount ? `<div class="line"><span>Discount</span><strong>-${formatBDT(order.discount)}</strong></div>` : ""}
                <div class="line"><span>Delivery charge</span><strong>${formatBDT(order.deliveryCharge)}</strong></div>
                <div class="line grand"><span>Total</span><span>${formatBDT(order.total)}</span></div>
              </div>
            </div>
          </div>
          <div class="actions"><button onclick="window.print()">Print invoice</button></div>
        </body>
      </html>
    `);
    invoiceWindow.document.close();
    invoiceWindow.focus();
  }

  return (
    <button type="button" onClick={printInvoice} className="inline-grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Print invoice ${order.orderNumber}`}>
      <Printer size={16} />
    </button>
  );
}
