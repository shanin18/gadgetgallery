"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const initialEmail = searchParams.get("email") ?? "";

  function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const otp = String(formData.get("otp") ?? "");

    startTransition(async () => {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Verification failed.");
        return;
      }
      router.push("/login?verified=true");
    });
  }

  function resend() {
    setError("");
    setMessage("");
    const emailInput = document.querySelector<HTMLInputElement>("input[name='email']");
    const email = emailInput?.value ?? "";

    startTransition(async () => {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not resend code.");
        return;
      }
      setMessage(data.message ?? "Verification code sent.");
    });
  }

  return (
    <form onSubmit={verify} className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
      <h1 className="font-display text-3xl font-extrabold">Verify email</h1>
      <p className="mt-2 text-sm text-muted-foreground">Enter your email and the 6-digit code.</p>
      {message ? <p className="mt-4 rounded-md bg-primary/10 p-3 text-sm font-semibold text-primary">{message}</p> : null}
      {error ? <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm font-semibold text-destructive">{error}</p> : null}
      <label className="mt-6 block text-sm font-semibold">
        Email
        <input name="email" type="email" required defaultValue={initialEmail} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
      </label>
      <label className="mt-4 block text-sm font-semibold">
        Verification code
        <input name="otp" inputMode="numeric" pattern="[0-9]{6}" required maxLength={6} className="mt-2 h-10 w-full rounded-md border bg-background px-3 tracking-[0.4em] outline-none focus:border-primary" />
      </label>
      <Button className="mt-6 w-full" disabled={isPending}>{isPending ? "Verifying..." : "Verify email"}</Button>
      <button type="button" onClick={resend} disabled={isPending} className="mt-4 w-full text-sm font-semibold text-primary disabled:opacity-50">
        Resend code
      </button>
    </form>
  );
}
