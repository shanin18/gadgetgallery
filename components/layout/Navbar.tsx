"use client";

import Link from "next/link";
import Image from "next/image";
import { BarChart3, Bell, Boxes, Heart, Home, LayoutDashboard, Loader2, LogOut, MessageCircle, Package, ReceiptText, Search, Settings, ShoppingBag, Store, Tags, TicketPercent, UserRound, Users, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useCartStore } from "@/store/cart-store";

const nav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact" }
];

const adminMobileLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes }
];

type AuthUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: "USER" | "ADMIN";
};

export function Navbar() {
  const [accountOpen, setAccountOpen] = useState(false);
  const { data: session, status } = useSession();
  const sessionLoaded = status !== "loading";
  const accountRef = useRef<HTMLDivElement>(null);
  const items = useCartStore((state) => state.items);
  const toggleCart = useCartStore((state) => state.toggle);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const user = session?.user;
  const pathname = usePathname();
  const isAdmin = user?.role === "ADMIN" || pathname.startsWith("/admin");

  function startNavigation(href: string) {
    setAccountOpen(false);
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

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 hidden border-b bg-background/86 backdrop-blur-xl md:block">
        <div className="container-page relative flex h-16 items-center gap-4">
          <Link href="/" onClick={() => startNavigation("/")} className="font-display text-xl font-extrabold">
            Gadget<span className="text-primary">Gallery</span>
          </Link>
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex lg:static lg:translate-x-0">
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
          <div className="relative ml-auto hidden md:block lg:ml-0" ref={accountRef}>
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
          {!isAdmin ? (
            <button className="relative rounded-md p-2 hover:bg-muted" onClick={() => toggleCart(true)} aria-label="Open cart">
              <ShoppingBag size={21} />
              {count ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-xs font-bold text-accent-foreground">{count}</span> : null}
            </button>
          ) : null}
        </div>
      </header>
      <MobileHeader user={user} isAdmin={isAdmin} sessionLoaded={sessionLoaded} />
      <MobileBottomNav count={count} onCartOpen={() => toggleCart(true)} isAdmin={isAdmin} />
    </>
  );
}

function MobileHeader({ user, isAdmin, sessionLoaded }: { user?: AuthUser; isAdmin: boolean; sessionLoaded: boolean }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeOnOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-[#eef6ff]/92 backdrop-blur-xl md:hidden">
      <div className="container-page flex h-16 items-center gap-3">
        <Link href="/" className="relative h-11 w-11 shrink-0 overflow-hidden" aria-label="GadgetGallery home">
          <Image src="/brand/gadget-gallery-logo.png" alt="GadgetGallery" fill sizes="44px" className="object-contain" priority />
        </Link>
        <form action="/shop" className="flex h-10 min-w-0 flex-1 items-center rounded-full bg-card px-3 shadow-sm">
          <Search size={16} className="shrink-0 text-muted-foreground" />
          <input name="q" placeholder="Search" className="h-full min-w-0 flex-1 bg-transparent px-2 text-sm outline-none" />
        </form>
        <div className="relative" ref={menuRef}>
          {!sessionLoaded ? (
            <div className="h-10 w-16 shrink-0 rounded-full bg-muted" aria-hidden="true" />
          ) : user ? (
            <button type="button" onClick={() => setOpen((value) => !value)} className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-card shadow-sm" aria-label="Open account menu" aria-expanded={open}>
              <UserAvatar user={user} size="md" />
            </button>
          ) : (
            <Link href="/login" className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-primary px-4 text-sm font-extrabold text-primary-foreground shadow-sm" aria-label="Login">
              Login
            </Link>
          )}
          {user ? <MobileAvatarMenu user={user} isAdmin={isAdmin} open={open} onClose={() => setOpen(false)} /> : null}
        </div>
      </div>
    </header>
  );
}

function MobileAvatarMenu({ user, isAdmin, open, onClose }: { user: AuthUser; isAdmin: boolean; open: boolean; onClose: () => void }) {
  const links = [
    ...(isAdmin ? [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] : []),
    { href: "/account/profile", label: "Profile", icon: UserRound },
    { href: "/account/notifications", label: "Notifications", icon: Bell },
    { href: "/contact", label: "Contact", icon: MessageCircle }
  ];

  return (
    <div
      className={`absolute right-0 top-12 z-50 w-72 origin-top-right overflow-hidden rounded-xl border bg-card shadow-soft transition duration-200 ease-out ${
        open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-2 scale-95 opacity-0"
      }`}
    >
      <div className="flex items-center gap-3 border-b p-4">
        <UserAvatar user={user} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold">{user.name ?? "GadgetGallery user"}</p>
          <p className="truncate text-xs font-semibold text-muted-foreground">{user.email}</p>
        </div>
        <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted" aria-label="Close account menu">
          <X size={17} />
        </button>
      </div>
      <div className="grid gap-1 p-2">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} onClick={onClose} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-extrabold hover:bg-muted">
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
        <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-extrabold text-destructive hover:bg-muted">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

function MobileBottomNav({ count, onCartOpen, isAdmin }: { count: number; onCartOpen: () => void; isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [adminMenuMounted, setAdminMenuMounted] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const links = isAdmin
    ? [
        { href: "/", label: "Home", icon: Home },
        { href: "/shop", label: "Shop", icon: Store },
        { href: "/contact", label: "Contact", icon: MessageCircle },
        { href: "/account/profile", label: "Profile", icon: UserRound }
      ]
    : [
        { href: "/", label: "Home", icon: Home },
        { href: "/shop", label: "Shop", icon: Store },
        { href: "/account/orders", label: "Orders", icon: ReceiptText },
        { href: "/account/wishlist", label: "Wishlist", icon: Heart }
      ];

  useEffect(() => {
    if (!adminMenuOpen) return;

    function closeOnOutsideClick(event: MouseEvent) {
      if (!sheetRef.current?.contains(event.target as Node)) {
        closeAdminMenu();
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [adminMenuOpen]);

  useEffect(() => {
    closeAdminMenu();
    setPendingHref(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  function openAdminMenu() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setAdminMenuMounted(true);
    window.requestAnimationFrame(() => setAdminMenuOpen(true));
  }

  function closeAdminMenu() {
    setAdminMenuOpen(false);
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => setAdminMenuMounted(false), 220);
  }

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/96 shadow-[0_-10px_35px_rgba(15,23,42,0.12)] backdrop-blur-xl md:hidden">
        <div className="mx-auto grid h-16 max-w-md grid-cols-5 items-center px-4">
          {links.slice(0, 2).map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 text-[11px] font-bold ${active ? "text-primary" : "text-muted-foreground"}`}>
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
          {isAdmin ? (
            <button type="button" onClick={openAdminMenu} className="relative -mt-7 mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft" aria-label="Open admin menu" aria-expanded={adminMenuOpen}>
              <LayoutDashboard size={22} />
            </button>
          ) : (
            <button type="button" onClick={onCartOpen} className="relative -mt-7 mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft" aria-label="Open cart">
              <ShoppingBag size={22} />
              {count ? <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground">{count}</span> : null}
            </button>
          )}
          {links.slice(2, 3).map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 text-[11px] font-bold ${active ? "text-primary" : "text-muted-foreground"}`}>
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
          {links.slice(3).map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 text-[11px] font-bold ${active ? "text-primary" : "text-muted-foreground"}`}>
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {isAdmin && adminMenuMounted ? (
        <div className={`fixed inset-0 z-[90] bg-foreground/25 backdrop-blur-sm transition-opacity duration-200 md:hidden ${adminMenuOpen ? "opacity-100" : "opacity-0"}`}>
          <div
            ref={sheetRef}
            className={`absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-2xl border bg-card shadow-soft transition duration-200 ease-out ${
              adminMenuOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-card p-4">
              <div>
                <p className="text-xs font-bold uppercase text-primary">Control center</p>
                <h2 className="font-display text-lg font-extrabold">Admin menu</h2>
              </div>
              <button type="button" onClick={closeAdminMenu} className="grid h-9 w-9 place-items-center rounded-md hover:bg-muted" aria-label="Close admin menu">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 p-4 pb-6">
              {adminMobileLinks.map((item) => {
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
                    className={`grid min-h-20 place-items-center gap-1 rounded-lg border bg-background px-1.5 py-3 text-center text-[11px] font-extrabold transition active:scale-[0.98] ${
                      active ? "border-primary bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className={`grid h-9 w-9 place-items-center rounded-full ${active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                      {pending ? <Loader2 size={17} className="animate-spin" /> : <Icon size={17} />}
                    </span>
                    <span className="leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function AccountMenu({ user, onNavigate }: { user: AuthUser; onNavigate: (href: string) => void }) {
  const isAdmin = user.role === "ADMIN";

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
        {isAdmin ? <AccountLink href="/admin" icon={LayoutDashboard} label="Dashboard" onNavigate={onNavigate} /> : <AccountLink href="/account/wishlist" icon={Heart} label="Wishlist" onNavigate={onNavigate} />}
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
