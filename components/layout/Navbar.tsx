"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, Heart, LogOut, Menu, Search, Settings, ShoppingBag, UserRound, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart-store";

const nav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact" }
];

type AuthUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: "USER" | "ADMIN";
};

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const { data: session, status } = useSession();
  const sessionLoaded = status !== "loading";
  const accountRef = useRef<HTMLDivElement>(null);
  const items = useCartStore((state) => state.items);
  const toggleCart = useCartStore((state) => state.toggle);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";
  const pathname = usePathname();

  function startNavigation(href: string) {
    setMobileOpen(false);
    setAccountOpen(false);
    if (href !== pathname) {
      setNavigating(true);
    }
  }

  // Close account dropdown when clicking outside
  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  // Reset navigating flag after route change
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
            {user && !isAdmin ? (
              <Link
                href="/account/orders"
                onClick={() => startNavigation("/account/orders")}
                className="rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Orders
              </Link>
            ) : null}
            {isAdmin ? (
              <Link
                href="/admin"
                onClick={() => startNavigation("/admin")}
                className="rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Dashboard
              </Link>
            ) : null}
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
                  <UserAvatar user={user} size="sm" />
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
            {user && !isAdmin ? (
              <Link
                href="/account/orders"
                className="block rounded-md px-3 py-3 font-semibold"
                onClick={() => startNavigation("/account/orders")}
              >
                Orders
              </Link>
            ) : null}
            {isAdmin ? (
              <Link
                href="/admin"
                className="block rounded-md px-3 py-3 font-semibold"
                onClick={() => startNavigation("/admin")}
              >
                Dashboard
              </Link>
            ) : null}
            <div className="mt-2 border-t pt-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-3">
                    <UserAvatar user={user} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold">{user.name ?? "GadgetGallery user"}</p>
                      <p className="truncate text-xs font-semibold text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <MobileAccountLinks showOrders={!isAdmin} onNavigate={startNavigation} />
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
      <div className="flex items-center gap-3 border-b p-4">
        <UserAvatar user={user} size="md" />
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-extrabold">{user.name ?? "GadgetGallery user"}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <div className="p-2">
        <AccountLink href="/account/profile" icon={UserRound} label="Profile" onNavigate={onNavigate} />
        <AccountLink href="/account/wishlist" icon={Heart} label="Wishlist" onNavigate={onNavigate} />
        <AccountLink href="/account/notifications" icon={Bell} label="Notifications" onNavigate={onNavigate} />
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

function UserAvatar({ user, size }: { user: AuthUser; size: "sm" | "md" }) {
  const dimensions = size === "sm" ? "h-7 w-7" : "h-10 w-10";
  const imageSize = size === "sm" ? 28 : 40;
  const initial = (user.name ?? user.email ?? "U").slice(0, 1).toUpperCase();

  return (
    <span className={`${dimensions} grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-xs font-extrabold text-primary-foreground ring-1 ring-primary/20`}>
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name ?? "Profile photo"}
          width={imageSize}
          height={imageSize}
          className="h-full w-full object-cover"
        />
      ) : (
        initial
      )}
    </span>
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

function MobileAccountLinks({ showOrders, onNavigate }: { showOrders: boolean; onNavigate: (href: string) => void }) {
  return (
    <>
      <Link href="/account/profile" className="block rounded-md px-3 py-3 font-semibold" onClick={() => onNavigate("/account/profile")}>Profile</Link>
      {showOrders ? <Link href="/account/orders" className="block rounded-md px-3 py-3 font-semibold" onClick={() => onNavigate("/account/orders")}>Orders</Link> : null}
      <Link href="/account/wishlist" className="block rounded-md px-3 py-3 font-semibold" onClick={() => onNavigate("/account/wishlist")}>Wishlist</Link>
      <Link href="/account/notifications" className="block rounded-md px-3 py-3 font-semibold" onClick={() => onNavigate("/account/notifications")}>Notifications</Link>
      <button className="block w-full rounded-md px-3 py-3 text-left font-semibold text-destructive" onClick={() => signOut({ callbackUrl: "/" })}>Logout</button>
    </>
  );
}
