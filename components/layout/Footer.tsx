import Link from "next/link";
import { Mail, MapPin, Phone, Truck } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-6 bg-card pb-20 md:mt-20 md:pb-0">
      <div className="container-page py-10 md:py-12">
        <div className="grid gap-8 bg-background p-5 md:grid-cols-[1.25fr_0.75fr_0.75fr_0.9fr] md:p-7">
          <div>
            <Link href="/" className="font-display text-2xl font-extrabold">
              Gadget<span className="text-primary">Gallery</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              Everyday gadgets and accessories delivered across Bangladesh with clear BDT pricing and cash on delivery.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Link
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="GadgetGallery on Facebook"
                className="grid h-10 w-10 place-items-center rounded-full bg-card text-primary transition hover:bg-primary hover:text-primary-foreground"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                  <path d="M14.2 8.4V6.9c0-.7.5-.9.9-.9h2.2V2.2L14.2 2c-3.5 0-4.3 2.6-4.3 4.3v2.1H7.1v4.2h2.8V22h4.3v-9.4h3.2l.5-4.2h-3.7Z" />
                </svg>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-extrabold uppercase text-foreground">Shop</h3>
            <div className="mt-4 grid gap-2.5 text-sm font-medium text-muted-foreground">
              <Link href="/shop" className="hover:text-primary">All products</Link>
              <Link href="/category/earphones" className="hover:text-primary">Earphones</Link>
              <Link href="/category/accessories" className="hover:text-primary">Accessories</Link>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-extrabold uppercase text-foreground">Support</h3>
            <div className="mt-4 grid gap-2.5 text-sm font-medium text-muted-foreground">
              <Link href="/account/orders" className="hover:text-primary">Track order</Link>
              <Link href="/account/profile" className="hover:text-primary">Profile</Link>
              <Link href="/contact" className="hover:text-primary">Contact</Link>
              <Link href="/forgot-password" className="hover:text-primary">Reset password</Link>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-extrabold uppercase text-foreground">Store Info</h3>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><Truck size={16} className="text-primary" /> Cash on Delivery only</span>
              <span className="inline-flex items-center gap-2"><MapPin size={16} className="text-primary" /> Bangladesh delivery</span>
              <Link href="mailto:support@gadgetgallery.com" className="inline-flex items-center gap-2 hover:text-primary"><Mail size={16} className="text-primary" /> support@gadgetgallery.com</Link>
              <span className="inline-flex items-center gap-2"><Phone size={16} className="text-primary" /> Customer support</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 py-5 text-xs font-semibold text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} GadgetGallery. All rights reserved.</p>
          <p>Built for secure COD shopping in Bangladesh.</p>
        </div>
      </div>
    </footer>
  );
}
