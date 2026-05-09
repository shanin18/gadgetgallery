"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function PromoCarousel({ products }: { products: Product[] }) {
  const slides = useMemo(() => products.slice(0, 5), [products]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  return (
    <section className="container-page py-5 md:py-8">
      <div className="relative overflow-hidden rounded-xl bg-primary shadow-sm">
        <div className="absolute inset-0 bg-[linear-gradient(110deg,#0f766e_0%,#149487_48%,#7bcfc4_100%)]" />
        <div className="absolute inset-y-0 right-0 w-[50%] bg-[radial-gradient(circle_at_center,#d8fff8_0%,#7bcfc4_38%,transparent_72%)] opacity-80" />
        <div className="relative h-[160px] sm:h-[220px] lg:h-[280px]">
          {slides.map((product, index) => (
            <div
              key={product.id}
              className={cn(
                "absolute inset-0 transition duration-700 ease-out",
                index === active ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              <div className="relative z-10 flex h-full max-w-[58%] flex-col justify-center px-4 py-4 text-white sm:px-8 lg:px-10">
                <h2 className="line-clamp-2 font-display text-lg font-extrabold leading-tight sm:line-clamp-1 sm:text-4xl lg:text-5xl">{product.name}</h2>
                <p className="mt-1 line-clamp-2 max-w-sm text-xs font-medium leading-4 text-white/85 sm:mt-2 sm:text-base sm:leading-6">
                  {product.description}
                </p>
                <Link href={`/product/${product.slug}`} className="mt-3 inline-flex h-8 w-fit items-center justify-center rounded-md bg-accent px-3 text-xs font-extrabold text-accent-foreground shadow-sm transition hover:bg-accent/90 sm:mt-5 sm:h-10 sm:px-5 sm:text-sm">
                  Shop Now
                </Link>
              </div>
              <Link href={`/product/${product.slug}`} className="absolute inset-y-3 right-3 w-[48%] overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/20 sm:inset-y-5 sm:right-5">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 50vw, 50vw"
                  className="object-contain p-2 sm:p-4"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#149487]/45 via-transparent to-transparent" />
              </Link>
            </div>
          ))}
        </div>

        {slides.length > 1 ? (
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 sm:bottom-4">
            {slides.map((product, index) => (
              <button
                key={product.id}
                type="button"
                aria-label={`Show ${product.name}`}
                onClick={() => setActive(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all sm:h-2",
                  index === active ? "w-4 bg-white sm:w-5" : "w-1.5 bg-white/55 hover:bg-white/80 sm:w-2"
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
