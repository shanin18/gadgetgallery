"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart-store";

const nav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/account/orders", label: "Orders" },
  { href: "/admin", label: "Admin" }
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const toggleCart = useCartStore((state) => state.toggle);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/86 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" className="font-display text-xl font-extrabold">
          Gadget<span className="text-primary">Gallery</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <form action="/shop" className="ml-auto hidden h-10 min-w-72 items-center rounded-md border bg-card px-3 lg:flex">
          <Search size={16} className="text-muted-foreground" />
          <input name="q" placeholder="Search gadgets" className="h-full flex-1 bg-transparent px-2 text-sm outline-none" />
        </form>
        <Link href="/login" className="hidden rounded-md p-2 hover:bg-muted md:inline-flex" aria-label="Account">
          <UserRound size={20} />
        </Link>
        <button className="relative rounded-md p-2 hover:bg-muted" onClick={() => toggleCart(true)} aria-label="Open cart">
          <ShoppingBag size={21} />
          {count ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-xs font-bold text-accent-foreground">{count}</span> : null}
        </button>
        <Button variant="ghost" className="px-2 md:hidden" onClick={() => setMobileOpen((value) => !value)} aria-label="Open menu">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>
      {mobileOpen ? (
        <div className="container-page border-t py-3 md:hidden">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-md px-3 py-3 font-semibold" onClick={() => setMobileOpen(false)}>
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
