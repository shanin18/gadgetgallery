import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { products } from "@/lib/catalog";
import { formatBDT } from "@/lib/utils";

const stats = [
  { label: "Revenue", value: formatBDT(128450), icon: TrendingUp },
  { label: "Orders today", value: "18", icon: ShoppingCart },
  { label: "Products", value: String(products.length), icon: Package },
  { label: "Customers", value: "342", icon: Users }
];

export default function AdminPage() {
  return (
    <div>
      <h2 className="font-display text-3xl font-extrabold">Dashboard</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-lg border bg-card p-5">
              <Icon size={20} className="text-primary" />
              <p className="mt-4 text-sm font-semibold text-muted-foreground">{stat.label}</p>
              <p className="font-display text-2xl font-extrabold">{stat.value}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-6 rounded-lg border bg-card p-5">
        <h3 className="font-display text-xl font-bold">Recent orders</h3>
        <div className="mt-4 grid gap-3">
          {["GG-DEMO-1004", "GG-DEMO-1003", "GG-DEMO-1002"].map((order) => (
            <div key={order} className="flex justify-between rounded-md bg-muted p-3 text-sm font-semibold">
              <span>{order}</span><span>Processing</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
