import { AdminSearch } from "@/components/admin/AdminSearch";
import { CouponForm } from "@/components/admin/CouponForm";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { db } from "@/lib/db";
import { formatBDT } from "@/lib/utils";

function formatExpiry(date: Date | null) {
  if (!date) return "No expiry";
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(date);
}

export default async function AdminCouponsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const queryValue = params.q;
  const query = (Array.isArray(queryValue) ? queryValue[0] : queryValue)?.trim() ?? "";
  const coupons = await db.coupon.findMany({
    where: query ? { code: { contains: query, mode: "insensitive" } } : undefined,
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-w-0 md:bg-card md:p-5">
      <p className="text-sm font-bold uppercase text-primary">Promotions</p>
      <h2 className="font-display text-2xl font-extrabold">Coupons</h2>
      <div className="mt-5 grid gap-4">
        <CouponForm />
        <AdminSearch initialValue={query} placeholder="Search coupons" />
      </div>
      {coupons.length ? (
        <div className="mt-5 grid gap-3">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="grid min-w-0 gap-3 rounded-xl bg-card p-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:p-4 md:bg-background">
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-extrabold">{coupon.code}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {coupon.type === "PERCENTAGE" ? `${Number(coupon.discount)}% off` : `${formatBDT(Number(coupon.discount))} off`}
                  {coupon.minOrder ? ` over ${formatBDT(Number(coupon.minOrder))}` : ""}
                </p>
              </div>
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-extrabold">{coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ""} used</span>
              <span className="text-sm font-semibold text-muted-foreground">{formatExpiry(coupon.expiresAt)}</span>
              <ConfirmDeleteButton endpoint={`/api/coupons/${coupon.id}`} itemName={coupon.code} />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-md bg-muted p-4 text-sm font-semibold text-muted-foreground">No coupons created yet.</p>
      )}
    </div>
  );
}
