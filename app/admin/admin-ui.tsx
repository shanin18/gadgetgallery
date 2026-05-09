import { CheckCircle2, Clock3, PackageCheck, Truck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  PENDING: "bg-accent/15 text-accent-foreground",
  PROCESSING: "bg-primary/10 text-primary",
  SHIPPED: "bg-blue-500/10 text-blue-700",
  DELIVERED: "bg-emerald-500/10 text-emerald-700",
  CANCELLED: "bg-destructive/10 text-destructive",
  CONFIRMED: "bg-emerald-500/10 text-emerald-700",
  PAID: "bg-emerald-500/10 text-emerald-700",
  FAILED: "bg-destructive/10 text-destructive",
  REFUNDED: "bg-muted text-muted-foreground"
};

const icons = {
  PENDING: Clock3,
  PROCESSING: PackageCheck,
  SHIPPED: Truck,
  DELIVERED: CheckCircle2,
  CANCELLED: XCircle,
  CONFIRMED: CheckCircle2,
  PAID: CheckCircle2,
  FAILED: XCircle,
  REFUNDED: Clock3
};

export function StatusBadge({ value }: { value?: string | null }) {
  const displayValue = value ?? "UNKNOWN";
  const Icon = icons[value as keyof typeof icons] ?? Clock3;

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-extrabold", statusStyles[displayValue] ?? "bg-muted text-muted-foreground")}>
      <Icon size={13} />
      {displayValue.toLowerCase().replaceAll("_", " ")}
    </span>
  );
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 text-center">
      <p className="font-display text-lg font-extrabold">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}
