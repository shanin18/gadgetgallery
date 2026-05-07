"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function RouteLoadingIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;
  const [targetUrl, setTargetUrl] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      const targetAttr = link.getAttribute("target");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || targetAttr === "_blank") return;

      const nextUrl = new URL(href, window.location.href);
      if (nextUrl.origin !== window.location.origin) return;
      if (`${nextUrl.pathname}${nextUrl.search}` === `${window.location.pathname}${window.location.search}`) return;

      startTransition(() => setTargetUrl(`${nextUrl.pathname}${nextUrl.search}`));
    }

    window.addEventListener("click", handleClick, true);
    return () => window.removeEventListener("click", handleClick, true);
  }, [startTransition]);

  if (!targetUrl || targetUrl === currentUrl) return null;

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-[90] h-1 w-full overflow-hidden bg-primary/15">
      <div className="h-full w-1/3 animate-[route-progress_1s_ease-in-out_infinite] bg-primary" />
    </div>
  );
}
