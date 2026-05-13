"use client";

import Link from "next/link";
import { BarChart3, Boxes, LayoutDashboard, Loader2, Package, ReceiptText, Tags, TicketPercent, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes }
];

export function AdminNav({ variant = "sidebar" }: { variant?: "sidebar" | "mobile" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (variant === "mobile") {
    return (
      <nav className="grid grid-cols-4 gap-2">
        {links.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
          const pending = pendingHref === item.href && !active;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onMouseEnter={() => router.prefetch(item.href)}
              onFocus={() => router.prefetch(item.href)}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                if (active) return;
                startTransition(() => setPendingHref(item.href));
              }}
              className={cn(
                "focus-ring grid min-h-20 place-items-center gap-1 rounded-lg border bg-background px-1.5 py-3 text-center text-[11px] font-extrabold transition active:scale-[0.98]",
                active ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
              aria-current={active ? "page" : undefined}
            >
              <span className={cn("grid h-9 w-9 place-items-center rounded-full", active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
                {pending ? <Loader2 size={17} className="animate-spin" /> : <Icon size={17} />}
              </span>
              <span className="leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex min-w-0 max-w-full snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:grid lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
      {links.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
        const pending = pendingHref === item.href && !active;

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            onMouseEnter={() => router.prefetch(item.href)}
            onFocus={() => router.prefetch(item.href)}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              if (active) return;
              startTransition(() => setPendingHref(item.href));
            }}
            className={cn(
              "inline-flex h-10 shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-md px-3 text-sm font-bold transition",
              active ? "bg-primary !text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            aria-current={active ? "page" : undefined}
          >
            {pending ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
