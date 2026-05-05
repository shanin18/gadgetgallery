import Link from "next/link";
import { Camera, CreditCard, Mail, PackageCheck, Share2, Truck } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t bg-card">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.3fr_0.7fr_0.7fr_1fr]">
        <div>
          <h2 className="font-display text-xl font-extrabold">GadgetGallery</h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Everyday gadgets and accessories delivered across Bangladesh with clear pricing in BDT.
          </p>
          <div className="mt-5 flex gap-2">
            <span className="rounded-md border p-2"><Share2 size={17} /></span>
            <span className="rounded-md border p-2"><Camera size={17} /></span>
            <span className="rounded-md border p-2"><Mail size={17} /></span>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Shop</h3>
          <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
            <Link href="/shop">All products</Link>
            <Link href="/shop?category=earphones">Earphones</Link>
            <Link href="/shop?category=accessories">Accessories</Link>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Support</h3>
          <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
            <Link href="/account/orders">Track order</Link>
            <Link href="/account/profile">Profile</Link>
            <Link href="/forgot-password">Reset password</Link>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Payments</h3>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2"><CreditCard size={16} /> Stripe</span>
            <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2"><CreditCard size={16} /> PayPal</span>
            <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2"><PackageCheck size={16} /> bKash</span>
            <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2"><Truck size={16} /> COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
