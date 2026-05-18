import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminNav } from "@/app/admin/AdminNav";
import { AdminTabletDrawer } from "@/app/admin/AdminTabletDrawer";

export const runtime = "nodejs";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }
  return (
    <div className="container-page grid min-w-0 max-w-full gap-4 py-4 pb-10 md:pb-24 lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-6 lg:py-10 lg:pb-10">
      <aside className="hidden h-[calc(100vh-5rem)] bg-card p-4 lg:sticky lg:top-20 lg:block">
        <div className="mb-3 px-1 lg:mb-4">
          <p className="text-xs font-bold uppercase text-primary">Control center</p>
          <h1 className="mt-1 font-display text-lg font-extrabold lg:text-xl">Management</h1>
        </div>
        <AdminNav />
      </aside>
      <section className="min-w-0 max-w-full">
        <AdminTabletDrawer />
        {children}
      </section>
    </div>
  );
}
