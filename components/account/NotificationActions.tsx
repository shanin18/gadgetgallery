"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Check, CheckCheck, Loader2 } from "lucide-react";

type MarkReadButtonProps = {
  id: string;
};

type MarkAllReadButtonProps = {
  disabled: boolean;
};

async function markNotificationsRead(body: Record<string, unknown>) {
  const response = await fetch("/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error("Could not update notifications.");
  }
}

export function MarkReadButton({ id }: MarkReadButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await markNotificationsRead({ notificationId: id });
          router.refresh();
        });
      }}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-extrabold text-primary transition hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
      Mark read
    </button>
  );
}

export function MarkAllReadButton({ disabled }: MarkAllReadButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={disabled || isPending}
      onClick={() => {
        startTransition(async () => {
          await markNotificationsRead({ all: true });
          router.refresh();
        });
      }}
      className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-extrabold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-55"
    >
      {isPending ? <Loader2 className="animate-spin" size={16} /> : <CheckCheck size={16} />}
      Mark all read
    </button>
  );
}
