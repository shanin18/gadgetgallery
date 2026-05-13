"use client";

import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

const socialProviders = {
  google: { label: "Google", mark: "G" },
  facebook: { label: "Facebook", mark: "f" }
} as const;

type SocialProviderId = keyof typeof socialProviders;

export function SocialLoginButtons() {
  const [activeProviders, setActiveProviders] = useState<SocialProviderId[]>([]);

  useEffect(() => {
    let mounted = true;

    getProviders().then((providers) => {
      if (!mounted || !providers) return;
      setActiveProviders(
        Object.keys(socialProviders).filter((provider) => providers[provider]) as SocialProviderId[]
      );
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!activeProviders.length) return null;

  return (
    <div className="mt-5">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-bold uppercase text-muted-foreground">or continue with</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {activeProviders.map((providerId) => {
          const provider = socialProviders[providerId];

          return (
          <button
            key={providerId}
            type="button"
            onClick={() => signIn(providerId, { callbackUrl: "/" })}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-semibold transition hover:bg-muted"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-xs font-black text-primary-foreground">{provider.mark}</span>
            {provider.label}
          </button>
          );
        })}
      </div>
    </div>
  );
}
