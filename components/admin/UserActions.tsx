"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";

type UserActionsProps = {
  userId: string;
  role: "USER" | "ADMIN";
  name: string;
  disabled?: boolean;
};

export function UserActions({ userId, role, name, disabled }: UserActionsProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateRole(nextRole: "USER" | "ADMIN") {
    if (nextRole === role || disabled) return;
    setMessage("");

    startTransition(async () => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.error ?? "Could not update role.");
        return;
      }

      router.refresh();
    });
  }

  function deleteUser() {
    if (disabled) return;
    const confirmed = window.confirm(`Delete ${name}? This action cannot be undone.`);
    if (!confirmed) return;

    setMessage("");
    startTransition(async () => {
      const response = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.error ?? "Could not delete user.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={role}
          onChange={(event) => updateRole(event.target.value as "USER" | "ADMIN")}
          disabled={disabled || isPending}
          className="h-9 rounded-md border bg-background px-2 text-xs font-extrabold outline-none focus:border-primary disabled:opacity-60"
          aria-label={`Change role for ${name}`}
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button
          type="button"
          onClick={deleteUser}
          disabled={disabled || isPending}
          className="inline-grid h-9 w-9 place-items-center rounded-md border text-destructive transition hover:bg-destructive/10 disabled:opacity-60"
          aria-label={`Delete ${name}`}
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      </div>
      {message ? <p className="mt-1 max-w-48 text-xs font-semibold text-destructive">{message}</p> : null}
    </div>
  );
}
