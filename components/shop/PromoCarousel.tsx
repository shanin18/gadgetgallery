"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function PromoCarousel({ products }: { products: Product[] }) {
  const slides = useMemo(() => products.slice(0, 5), [products]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const activeProduct = slides[active] ?? slides[0];

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  function showPrevious() {
    setActive((current) => (current - 1 + slides.length) % slides.length);
  }

  function showNext() {
    setActive((current) => (current + 1) % slides.length);
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX == null || slides.length < 2) return;
    const delta = event.changedTouches[0].clientX - touchStartX;
    setTouchStartX(null);
    if (Math.abs(delta) < 45) return;
    if (delta > 0) showPrevious();
    else showNext();
  }

  if (!slides.length) return null;

  return (
    <section className="container-page py-5 md:py-8">
      <div
        className="relative overflow-hidden rounded-lg bg-neutral-950"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative h-[200px] min-[420px]:h-[210px] sm:h-[230px] lg:h-[300px]">
          {activeProduct ? (
            <div key={activeProduct.id} className="group absolute inset-0 animate-fade-in">
              <Image
                src={activeProduct.image}
                alt={activeProduct.name}
                fill
                priority={active === 0}
                sizes="(min-width: 1024px) 1180px, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/24 to-black/55" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/35" />
              <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 pb-10 pt-5 text-center text-white sm:px-8">
                <h2 className="line-clamp-2 max-w-[92%] font-display text-xl font-extrabold leading-6 drop-shadow-sm min-[420px]:text-2xl min-[420px]:leading-7 sm:line-clamp-1 sm:max-w-2xl sm:text-4xl sm:leading-tight lg:text-5xl">{activeProduct.name}</h2>
                <p className="mt-1.5 line-clamp-2 max-w-[92%] text-xs font-semibold leading-4 text-white/85 min-[420px]:text-sm min-[420px]:leading-5 sm:mt-2 sm:max-w-xl sm:text-lg sm:leading-7">
                  {activeProduct.description}
                </p>
                <Link href={`/product/${activeProduct.slug}`} className="mt-2.5 inline-flex h-8 w-fit items-center justify-center rounded-md bg-white px-4 text-xs font-semibold !text-foreground transition hover:bg-white/90 sm:mt-5 sm:h-10 sm:px-5 sm:text-sm">
                  Shop Now
                </Link>
              </div>
            </div>
          ) : null}
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
