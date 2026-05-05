"use client";

import Link from "next/link";
import { Bell, Heart, LogOut, MapPin, Menu, Search, Settings, ShoppingBag, ShieldCheck, UserRound, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart-store";

const nav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/account/orders", label: "Orders" }
];

type AuthUser = {
  name?: string | null;
  email?: string | null;
  role?: "USER" | "ADMIN";
};

type AuthSession = {
  user?: AuthUser;
};

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const items = useCartStore((state) => state.items);
  const toggleCart = useCartStore((state) => state.toggle);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const user = session?.user;
  const pathname = usePathname();

  function startNavigation(href: string) {
    setMobileOpen(false);
    setAccountOpen(false);
    if (href !== pathname) {
      setNavigating(true);
    }
  }

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data) => {
        if (active) setSession(data?.user ? data : null);
      })
      .catch(() => {
        if (active) setSession(null);
      })
      .finally(() => {
        if (active) setSessionLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => setNavigating(false), 0);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      {navigating ? <NavigationOverlay /> : null}
      <header className="sticky top-0 z-40 border-b bg-background/86 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center gap-4">
          <Link href="/" onClick={() => startNavigation("/")} className="font-display text-xl font-extrabold">
            Gadget<span className="text-primary">Gallery</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => startNavigation(item.href)} className="rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
          <form action="/shop" className="ml-auto hidden h-10 min-w-72 items-center rounded-md border bg-card px-3 lg:flex">
            <Search size={16} className="text-muted-foreground" />
            <input name="q" placeholder="Search gadgets" className="h-full flex-1 bg-transparent px-2 text-sm outline-none" />
          </form>
          <div className="relative hidden md:block" ref={accountRef}>
            {!sessionLoaded ? (
              <div className="h-10 w-24 rounded-md bg-muted" />
            ) : user ? (
              <>
                <button
                  className="inline-grid h-10 w-10 place-items-center rounded-full border bg-card text-sm font-semibold hover:bg-muted"
                  onClick={() => setAccountOpen((value) => !value)}
                  aria-label="Open account menu"
                  aria-expanded={accountOpen}
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground">
                    {(user.name ?? user.email ?? "U").slice(0, 1).toUpperCase()}
                  </span>
                </button>
                {accountOpen ? <AccountMenu user={user} onNavigate={startNavigation} /> : null}
              </>
          ) : (
            <Link href="/login" onClick={() => startNavigation("/login")} className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:brightness-95">
              Login
            </Link>
          )}
          </div>
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
              <Link key={item.href} href={item.href} className="block rounded-md px-3 py-3 font-semibold" onClick={() => startNavigation(item.href)}>
                {item.label}
              </Link>
            ))}
            <div className="mt-2 border-t pt-2">
              {user ? (
                <>
                  <p className="px-3 py-2 text-sm font-semibold text-muted-foreground">{user.email}</p>
                  <MobileAccountLinks isAdmin={user.role === "ADMIN"} onNavigate={startNavigation} />
                </>
            ) : (
              <Link href="/login" className="mx-3 mt-2 flex h-10 items-center justify-center rounded-md bg-primary px-4 font-semibold text-white" onClick={() => startNavigation("/login")}>Login</Link>
            )}
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}

function NavigationOverlay() {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-background/35 backdrop-blur-md">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/60 border-t-primary shadow-soft" />
    </div>
  );
}

function AccountMenu({ user, onNavigate }: { user: AuthUser; onNavigate: (href: string) => void }) {
  return (
    <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-lg border bg-card shadow-soft">
      <div className="border-b p-4">
        <p className="font-display text-sm font-extrabold">{user.name ?? "GadgetGallery user"}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
      <div className="p-2">
        <AccountLink href="/account/profile" icon={UserRound} label="Profile" onNavigate={onNavigate} />
        <AccountLink href="/account/wishlist" icon={Heart} label="Wishlist" onNavigate={onNavigate} />
        <AccountLink href="/account/addresses" icon={MapPin} label="Addresses" onNavigate={onNavigate} />
        <AccountLink href="/account/notifications" icon={Bell} label="Notifications" onNavigate={onNavigate} />
        {user.role === "ADMIN" ? <AccountLink href="/admin" icon={ShieldCheck} label="Admin dashboard" onNavigate={onNavigate} /> : null}
        <button
          className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold text-destructive hover:bg-muted"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  );
}

function AccountLink({ href, icon: Icon, label, onNavigate }: { href: string; icon: typeof Settings; label: string; onNavigate: (href: string) => void }) {
  return (
    <Link href={href} onClick={() => onNavigate(href)} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold hover:bg-muted">
      <Icon size={17} />
      {label}
    </Link>
  );
}

function MobileAccountLinks({ isAdmin, onNavigate }: { isAdmin: boolean; onNavigate: (href: string) => void }) {
  return (
    <>
      <Link href="/account/profile" className="block rounded-md px-3 py-3 font-semibold" onClick={() => onNavigate("/account/profile")}>Profile</Link>
      <Link href="/account/orders" className="block rounded-md px-3 py-3 font-semibold" onClick={() => onNavigate("/account/orders")}>Orders</Link>
      <Link href="/account/wishlist" className="block rounded-md px-3 py-3 font-semibold" onClick={() => onNavigate("/account/wishlist")}>Wishlist</Link>
      <Link href="/account/addresses" className="block rounded-md px-3 py-3 font-semibold" onClick={() => onNavigate("/account/addresses")}>Addresses</Link>
      <Link href="/account/notifications" className="block rounded-md px-3 py-3 font-semibold" onClick={() => onNavigate("/account/notifications")}>Notifications</Link>
      {isAdmin ? <Link href="/admin" className="block rounded-md px-3 py-3 font-semibold" onClick={() => onNavigate("/admin")}>Admin dashboard</Link> : null}
      <button className="block w-full rounded-md px-3 py-3 text-left font-semibold text-destructive" onClick={() => signOut({ callbackUrl: "/" })}>Logout</button>
    </>
  );
}
