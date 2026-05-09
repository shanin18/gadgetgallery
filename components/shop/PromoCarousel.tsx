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
      <div className="relative overflow-hidden rounded-lg bg-neutral-950">
        <div className="relative h-[170px] sm:h-[230px] lg:h-[300px]">
          {slides.map((product, index) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className={cn(
                "group absolute inset-0 transition duration-700 ease-out",
                index === active ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 1180px, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/24 to-black/55" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/35" />
              <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 pb-9 pt-6 text-center text-white sm:px-8">
                <h2 className="line-clamp-2 max-w-2xl font-display text-2xl font-extrabold leading-tight drop-shadow-sm sm:line-clamp-1 sm:text-4xl lg:text-5xl">{product.name}</h2>
                <p className="mt-2 line-clamp-2 max-w-xl text-sm font-semibold leading-5 text-white/82 sm:text-lg sm:leading-7">
                  {product.description}
                </p>
                <span className="mt-4 inline-flex h-9 w-fit items-center justify-center rounded-md bg-white px-4 text-xs font-extrabold text-foreground transition hover:bg-white/90 sm:mt-5 sm:h-10 sm:px-5 sm:text-sm">
                  Shop Now
                </span>
              </div>
            </Link>
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
                  index === active ? "w-6 bg-white sm:w-7" : "w-1.5 bg-white/45 hover:bg-white/75 sm:w-2"
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
