"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";

type RegisterResponse = {
  email?: string;
  message?: string;
  error?: string;
};

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      password: String(formData.get("password") ?? "")
    };

    startTransition(async () => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = (await response.json()) as RegisterResponse;

      if (!response.ok) {
        setError(data.error ?? "Could not create account.");
        return;
      }

      const registeredEmail = data.email ?? payload.email;
      window.history.replaceState(null, "", `/register?email=${encodeURIComponent(registeredEmail)}`);
      setEmail(registeredEmail);
    });
  }

  function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
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

  if (email) {
    return (
      <form onSubmit={verify} className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="font-display text-3xl font-extrabold">Verify email</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter the 6-digit code sent to {email}.</p>
        {error ? <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm font-semibold text-destructive">{error}</p> : null}
        <label className="mt-6 block text-sm font-semibold">
          Verification code
          <input name="otp" inputMode="numeric" pattern="[0-9]{6}" required maxLength={6} className="mt-2 h-10 w-full rounded-md border bg-background px-3 tracking-[0.4em] outline-none focus:border-primary" />
        </label>
        <Button className="mt-6 w-full" disabled={isPending}>{isPending ? "Verifying..." : "Verify email"}</Button>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
      <h1 className="font-display text-3xl font-extrabold">Create account</h1>
      {error ? <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm font-semibold text-destructive">{error}</p> : null}
      <div className="mt-6 grid gap-4">
        <label className="block text-sm font-semibold">
          Name
          <input name="name" required className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
        </label>
        <label className="block text-sm font-semibold">
          Email
          <input name="email" type="email" required className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
        </label>
        <label className="block text-sm font-semibold">
          Phone
          <input name="phone" className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
        </label>
        <label className="block text-sm font-semibold">
          Password
          <input name="password" type="password" required minLength={8} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
        </label>
      </div>
      <Button className="mt-6 w-full" disabled={isPending}>{isPending ? "Creating account..." : "Register"}</Button>
    </form>
  );
}
