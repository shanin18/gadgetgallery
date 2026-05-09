"use client";

import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function AdminSearch({ initialValue = "", placeholder }: { initialValue?: string; placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialValue);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.get("q") ?? "";
      const next = value.trim();

      if (current === next) return;

      if (next) {
        params.set("q", next);
      } else {
        params.delete("q");
      }

      startTransition(() => {
        router.replace(params.size ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [pathname, router, searchParams, startTransition, value]);

  return (
    <div className="flex h-11 min-w-0 items-center rounded-md border bg-background px-3">
      <Search size={17} className="shrink-0 text-muted-foreground" />
      <input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} className="h-full min-w-0 flex-1 bg-transparent px-2 text-sm font-semibold outline-none" />
    </div>
  );
}
