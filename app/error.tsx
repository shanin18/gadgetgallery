"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Home, RefreshCw, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Page error boundary caught an error.", error);
  }, [error]);

  return (
    <section className="container-page grid min-h-[calc(100vh-8rem)] place-items-center py-12">
      <div className="w-full max-w-xl px-4 text-center">
        <Image src="/brand/gadget-gallery-logo.png" alt="GadgetGallery" width={86} height={86} className="mx-auto h-16 w-16 object-contain sm:h-20 sm:w-20" />
        <p className="mt-5 text-xs font-extrabold uppercase text-primary">Something went wrong</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">We could not load this page</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Please try again. If the issue continues, you can return home or continue shopping while we check it.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={reset}>
            <RefreshCw size={16} />
            Try again
          </Button>
          <Link href="/" className="focus-ring inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-semibold transition hover:bg-muted">
            <Home size={16} />
            Go home
          </Link>
          <Link href="/shop" className="focus-ring inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-semibold transition hover:bg-muted">
            <ShoppingBag size={16} />
            Shop
          </Link>
        </div>
      </div>
    </section>
  );
}
