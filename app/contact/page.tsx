import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact GadgetGallery for orders, delivery, product support, and account help."
};

const supportCards = [
  {
    icon: Phone,
    label: "Phone",
    value: "+880 1870-788177",
    detail: "Order and delivery support"
  },
  {
    icon: Mail,
    label: "Email",
    value: "support@gadgetgallery.com",
    detail: "Replies within one business day"
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Dhaka, Bangladesh",
    detail: "Nationwide delivery available"
  },
  {
    icon: Clock,
    label: "Hours",
    value: "10:00 AM - 8:00 PM",
    detail: "Saturday to Thursday"
  }
];

export default function ContactPage() {
  return (
    <div className="container-page py-10">
      <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="border-b bg-[linear-gradient(135deg,rgba(20,184,166,0.14),rgba(255,255,255,0)_48%,rgba(245,158,11,0.13))] px-5 py-8 sm:px-7">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-md border bg-background/80 px-2.5 py-1 text-xs font-bold text-primary">
              <MessageCircle size={14} />
              Customer support
            </div>
            <h1 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">Contact GadgetGallery</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Need help with an order, product, delivery, or account issue? Send the details and the support team will get back to you.
            </p>
          </div>
        </div>

        <div className="grid gap-8 px-5 py-7 sm:px-7 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {supportCards.map((item) => (
              <div key={item.label} className="rounded-md border bg-background p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                    <item.icon size={19} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase text-muted-foreground">{item.label}</p>
                    <p className="mt-1 break-words font-extrabold">{item.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <ContactForm />
        </div>
      </section>
    </div>
  );
}
