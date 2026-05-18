"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { AdminNav } from "@/app/admin/AdminNav";

export function AdminTabletDrawer() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setOpen(false);
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = window.setTimeout(() => setMounted(false), 220);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  function openDrawer() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setMounted(true);
    window.requestAnimationFrame(() => setOpen(true));
  }

  function closeDrawer() {
    setOpen(false);
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setMounted(false), 220);
  }

  return (
    <>
      <div className="sticky top-20 z-30 mb-4 hidden justify-end md:flex lg:hidden">
        <button
          type="button"
          onClick={openDrawer}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-card px-3 text-sm font-extrabold shadow-sm transition hover:bg-muted"
          aria-label="Open admin navigation"
          aria-expanded={open}
        >
          <Menu size={17} />
          Admin menu
        </button>
      </div>

      {mounted ? (
        <div className={`fixed inset-0 z-[90] hidden bg-foreground/25 backdrop-blur-sm transition-opacity duration-200 md:block lg:hidden ${open ? "opacity-100" : "opacity-0"}`} onMouseDown={closeDrawer}>
          <aside
            className={`h-full w-80 max-w-[86vw] border-r bg-card shadow-soft transition duration-200 ease-out ${open ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b p-4">
              <div>
                <p className="text-xs font-bold uppercase text-primary">Control center</p>
                <h2 className="mt-1 font-display text-xl font-extrabold">Management</h2>
              </div>
              <button type="button" onClick={closeDrawer} className="grid h-9 w-9 place-items-center rounded-md hover:bg-muted" aria-label="Close admin navigation">
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <AdminNav variant="drawer" />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
