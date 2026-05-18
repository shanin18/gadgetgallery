import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Home, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <section className="container-page grid min-h-[calc(100vh-8rem)] place-items-center py-12">
      <div className="w-full max-w-xl px-4 text-center">
        <Image src="/brand/gadget-gallery-logo.png" alt="GadgetGallery" width={86} height={86} className="mx-auto h-16 w-16 object-contain sm:h-20 sm:w-20" />
        <p className="mt-5 text-xs font-extrabold uppercase text-primary">404</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Page not found</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          This page may have moved, or the link may be outdated. You can go back home or browse the shop.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="focus-ring inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold !text-primary-foreground transition hover:bg-primary/90">
            <Home size={16} />
            Go home
          </Link>
          <Link href="/shop" className="focus-ring inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-semibold transition hover:bg-muted">
            <Search size={16} />
            Browse shop
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
