"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const verified = searchParams.get("verified") === "true";
  const callbackUrl = searchParams.get("callbackUrl");
  const safeCallbackUrl = callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/";

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        setError("Login failed. Check your password and make sure your email is verified.");
        return;
      }

      window.location.replace(safeCallbackUrl);
    });
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
      <h1 className="font-display text-3xl font-extrabold">Login</h1>
      <p className="mt-2 text-sm text-muted-foreground">Access your orders, wishlist and account settings.</p>
      {verified ? <p className="mt-4 rounded-md bg-primary/10 p-3 text-sm font-semibold text-primary">Email verified. You can log in now.</p> : null}
      {error ? <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm font-semibold text-destructive">{error}</p> : null}
      <label className="mt-6 block text-sm font-semibold">
        Email
        <input type="email" name="email" required className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
      </label>
      <label className="mt-4 block text-sm font-semibold">
        Password
        <PasswordInput required minLength={8} autoComplete="current-password" />
      </label>
      <Button className="mt-6 w-full" disabled={isPending}>{isPending ? "Logging in..." : "Login"}</Button>
      <SocialLoginButtons />
      <div className="mt-4 flex justify-between text-sm">
        <Link href="/register" className="font-semibold text-primary">Create account</Link>
        <Link href="/forgot-password" className="font-semibold text-primary">Forgot password?</Link>
      </div>
    </form>
  );
}
