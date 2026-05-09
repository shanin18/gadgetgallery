"use client";

import { Eye, X } from "lucide-react";
import { useState } from "react";
import { OrderStatusSelect } from "@/components/admin/OrderStatusControls";
import { formatBDT } from "@/lib/utils";

type DetailItem = {
  name: string;
  quantity: number;
  price: number;
};

type OrderDetails = {
  orderId: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
  confirmationStatus: string;
  deliveryStatus: string;
  shippingAddress: string[];
  items: DetailItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  tax: number;
  total: number;
};

export function OrderDetailsButton({ order }: { order: OrderDetails }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`View details ${order.orderNumber}`}>
        <Eye size={16} />
      </button>
      {open ? (
        <div className="fixed inset-0 z-[100] grid place-items-end bg-foreground/25 p-0 backdrop-blur-sm sm:place-items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-xl border bg-card shadow-soft sm:max-h-[90vh] sm:rounded-lg">
            <div className="flex items-start justify-between gap-4 border-b p-4 sm:p-5">
              <div className="min-w-0">
                <p className="text-sm font-bold uppercase text-primary">Order details</p>
                <h2 className="break-words font-display text-xl font-extrabold sm:text-2xl">{order.orderNumber}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{order.date}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-muted" aria-label="Close details">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2">
              <section className="rounded-lg border bg-background p-4">
                <p className="text-xs font-extrabold uppercase text-primary">Customer</p>
                <p className="mt-3 font-extrabold">{order.customerName}</p>
                <p className="mt-1 text-sm text-muted-foreground">{order.customerEmail}</p>
                <p className="mt-1 text-sm font-semibold text-muted-foreground">{order.customerPhone}</p>
              </section>
              <section className="rounded-lg border bg-background p-4">
                <p className="text-xs font-extrabold uppercase text-primary">Delivery address</p>
                <div className="mt-3 grid gap-1 text-sm font-semibold text-muted-foreground">
                  {order.shippingAddress.map((line) => <p key={line}>{line}</p>)}
                </div>
              </section>
              <section className="rounded-lg border bg-background p-4 md:col-span-2">
                <p className="text-xs font-extrabold uppercase text-primary">Order workflow</p>
                <div className="mt-3 rounded-md bg-muted p-3">
                  <p className="text-xs font-bold text-muted-foreground">Payment method</p>
                  <p className="mt-2 text-sm font-extrabold">{order.paymentMethod}</p>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <OrderStatusSelect orderId={order.orderId} type="confirmation" value={order.confirmationStatus} />
                  <OrderStatusSelect orderId={order.orderId} type="delivery" value={order.deliveryStatus} />
                </div>
              </section>
            </div>

            <div className="px-4 pb-4 sm:px-5 sm:pb-5">
              <section className="rounded-lg border bg-background p-4">
                <p className="text-xs font-extrabold uppercase text-primary">Items</p>
                <div className="mt-3 grid gap-2">
                  {order.items.map((item) => (
                    <div key={item.name} className="grid gap-2 rounded-md bg-muted p-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-3">
                      <p className="min-w-0 font-bold sm:truncate">{item.name}</p>
                      <p className="font-semibold text-muted-foreground">x {item.quantity}</p>
                      <p className="font-display font-extrabold sm:text-right">{formatBDT(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-4 rounded-lg border bg-background p-4">
                <div className="ml-auto grid max-w-sm gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><strong>{formatBDT(order.subtotal)}</strong></div>
                  {order.discount ? <div className="flex justify-between text-primary"><span>Discount</span><strong>-{formatBDT(order.discount)}</strong></div> : null}
                  <div className="flex justify-between"><span className="text-muted-foreground">Delivery charge</span><strong>{formatBDT(order.deliveryCharge)}</strong></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><strong>{formatBDT(order.tax)}</strong></div>
                  <div className="flex justify-between border-t pt-3 font-display text-lg font-extrabold"><span>Total</span><span>{formatBDT(order.total)}</span></div>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
