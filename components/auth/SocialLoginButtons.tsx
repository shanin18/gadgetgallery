"use client";

import { signIn } from "next-auth/react";

export function SocialLoginButtons() {
  return (
    <div className="mt-5">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-bold uppercase text-muted-foreground">or continue with</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="mt-4 grid gap-3">
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-semibold transition hover:bg-muted"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-xs font-black text-primary-foreground">G</span>
          Google
        </button>
      </div>
    </div>
  );
}
