import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const runtime = "nodejs";

const links = ["Dashboard", "Products", "Orders", "Users", "Categories", "Coupons", "Analytics", "Inventory"];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }
  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[240px_1fr]">
      <aside className="h-fit rounded-lg border bg-card p-4">
        <h1 className="px-3 font-display text-xl font-extrabold">Admin</h1>
        <nav className="mt-4 grid gap-1">
          {links.map((label) => {
            const href = label === "Dashboard" ? "/admin" : `/admin/${label.toLowerCase()}`;
            return <Link key={label} href={href} className="rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">{label}</Link>;
          })}
        </nav>
      </aside>
      <section>{children}</section>
    </div>
  );
}
