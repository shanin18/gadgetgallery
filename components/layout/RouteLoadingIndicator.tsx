"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LoadingOverlay } from "@/components/layout/LoadingOverlay";

export function RouteLoadingIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;
  const [targetUrl, setTargetUrl] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!target || !("closest" in target) || typeof target.closest !== "function") return;

      const link = target.closest("a");
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

  return <LoadingOverlay />;
}
