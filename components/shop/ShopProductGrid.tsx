"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { PRODUCT_PAGE_SIZE } from "@/lib/product-listing";
import { ProductCard } from "@/components/shop/ProductCard";

type ShopProductGridProps = {
  initialProducts: Product[];
  initialHasMore: boolean;
  queryString: string;
  initialOffset: number;
  pageEndOffset: number;
  currentPage: number;
  totalPages: number;
};

function pageHref(queryString: string, page: number) {
  const params = new URLSearchParams(queryString);
  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }

  const query = params.toString();
  return query ? `?${query}` : "?";
}

function ProductCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-lg border bg-card">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <div className="space-y-3 p-3 sm:p-4">
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-2">
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-10 w-20 animate-pulse rounded-md bg-muted sm:h-9" />
        </div>
      </div>
    </article>
  );
}

export function ShopProductGrid({ initialProducts, initialHasMore, queryString, initialOffset, pageEndOffset, currentPage, totalPages }: ShopProductGridProps) {
  const [products, setProducts] = useState(initialProducts);
  const [offset, setOffset] = useState(initialOffset);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingRef.current || offset >= pageEndOffset) return;

    loadingRef.current = true;
    setError("");
    startTransition(async () => {
      try {
        const params = new URLSearchParams(queryString);
        params.set("offset", String(offset));
        params.set("limit", String(Math.min(PRODUCT_PAGE_SIZE, pageEndOffset - offset)));

        const response = await fetch(`/api/products?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Could not load more products.");
        }

        setProducts((current) => [...current, ...data.products]);
        const nextOffset = Number(data.nextOffset ?? offset);
        setOffset(nextOffset);
        setHasMore(Boolean(data.hasMore) && nextOffset < pageEndOffset);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load more products.");
      } finally {
        loadingRef.current = false;
      }
    });
  }, [hasMore, offset, pageEndOffset, queryString]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "520px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const showPagination = totalPages > 1 && (!hasMore || offset >= pageEndOffset);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  if (!products.length) {
    return <p className="rounded-lg border bg-card p-5 text-sm font-semibold text-muted-foreground">No products found.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
        {isPending ? Array.from({ length: PRODUCT_PAGE_SIZE }).map((_, index) => <ProductCardSkeleton key={`skeleton-${index}`} />) : null}
      </div>
      <div ref={sentinelRef} className="mt-4 flex min-h-6 items-center justify-center">
        {!isPending && hasMore ? <span className="sr-only">More products load as you scroll</span> : null}
      </div>
      {showPagination ? (
        <nav aria-label="Product pages" className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {currentPage > 1 ? (
            <Link href={pageHref(queryString, currentPage - 1)} className="rounded-md border px-3 py-2 text-sm font-extrabold transition hover:bg-muted">
              Previous
            </Link>
          ) : null}
          {pages.map((page) => (
            <Link
              key={page}
              href={pageHref(queryString, page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={`grid h-10 min-w-10 place-items-center rounded-md border px-3 text-sm font-extrabold transition ${page === currentPage ? "border-primary text-primary" : "hover:bg-muted"}`}
            >
              {page}
            </Link>
          ))}
          {currentPage < totalPages ? (
            <Link href={pageHref(queryString, currentPage + 1)} className="rounded-md border px-3 py-2 text-sm font-extrabold transition hover:bg-muted">
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
      {error ? (
        <div className="mt-3 flex justify-center">
          <button type="button" onClick={loadMore} className="rounded-md border px-4 py-2 text-sm font-extrabold text-primary transition hover:bg-primary/5">
            {error} Try again
          </button>
        </div>
      ) : null}
    </>
  );
}
