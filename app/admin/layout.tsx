import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminNav } from "@/app/admin/AdminNav";

export const runtime = "nodejs";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }
  return (
    <div className="container-page grid gap-6 py-6 lg:grid-cols-[248px_1fr] lg:py-10">
      <aside className="h-fit rounded-lg border bg-card p-4 shadow-sm lg:sticky lg:top-24">
        <div className="mb-4 px-1">
          <p className="text-xs font-bold uppercase text-primary">Control center</p>
          <h1 className="mt-1 font-display text-xl font-extrabold">Management</h1>
        </div>
        <AdminNav />
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
