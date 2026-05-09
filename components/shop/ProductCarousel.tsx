"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useRef } from "react";
import type { Product } from "@/lib/catalog";
import { formatBDT } from "@/lib/utils";

export function ProductCarousel({ products }: { products: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    scroller.scrollBy({
      left: direction === "left" ? -scroller.clientWidth * 0.82 : scroller.clientWidth * 0.82,
      behavior: "smooth"
    });
  };

  if (!products.length) return null;

  return (
    <div className="relative">
      <div ref={scrollerRef} className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <article key={product.id} className="w-[42vw] min-w-[42vw] snap-start overflow-hidden rounded-lg border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft sm:w-[220px] sm:min-w-[220px] lg:w-[260px] lg:min-w-[260px]">
            <Link href={`/product/${product.slug}`} className="block">
              <div className="relative aspect-square overflow-hidden bg-muted sm:aspect-[4/3]">
                <Image src={product.image} alt={product.name} fill sizes="(min-width: 1024px) 260px, 42vw" className="object-cover transition duration-500 hover:scale-105" />
                {product.comparePrice ? <span className="absolute left-2 top-2 rounded bg-accent px-2 py-1 text-[10px] font-extrabold text-accent-foreground">Deal</span> : null}
              </div>
              <div className="p-3 sm:p-4">
                <p className="text-[11px] font-bold uppercase text-muted-foreground">{product.category}</p>
                <h3 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-extrabold leading-5">{product.name}</h3>
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Star size={13} className="fill-accent text-accent" />
                  <span>{product.rating}</span>
                  <span>({product.reviewCount})</span>
                </div>
                <div className="mt-3 flex items-end gap-2">
                  <p className="font-display text-base font-extrabold">{formatBDT(product.price)}</p>
                  {product.comparePrice ? <p className="text-xs text-muted-foreground line-through">{formatBDT(product.comparePrice)}</p> : null}
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-4 hidden justify-end gap-2 sm:flex">
        <button type="button" onClick={() => scroll("left")} aria-label="Previous products" className="grid h-10 w-10 place-items-center rounded-md border bg-card hover:bg-muted">
          <ChevronLeft size={18} />
        </button>
        <button type="button" onClick={() => scroll("right")} aria-label="Next products" className="grid h-10 w-10 place-items-center rounded-md border bg-card hover:bg-muted">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
