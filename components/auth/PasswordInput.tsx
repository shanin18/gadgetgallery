"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PasswordInputProps = {
  name?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
};

export function PasswordInput({ name = "password", required, minLength, autoComplete }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative mt-2">
      <input
        type={visible ? "text" : "password"}
        name={name}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="h-10 w-full rounded-md border bg-background px-3 pr-11 outline-none focus:border-primary"
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
