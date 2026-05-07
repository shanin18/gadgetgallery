"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, Loader2, Send, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: ""
};

export function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setToast(null);

    startTransition(async () => {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setToast({ type: "error", message: data.error ?? "Message could not be sent." });
        return;
      }

      setForm(initialForm);
      setToast({ type: "success", message: "Message sent. We will get back to you soon." });
    });
  }

  return (
    <>
      <form className="rounded-lg border bg-background p-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-extrabold">
            Name
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              className="mt-2 h-11 w-full rounded-md border bg-card px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <label className="block text-sm font-extrabold">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              required
              maxLength={160}
              autoComplete="email"
              className="mt-2 h-11 w-full rounded-md border bg-card px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <label className="block text-sm font-extrabold sm:col-span-2">
            Subject
            <input
              value={form.subject}
              onChange={(event) => updateField("subject", event.target.value)}
              required
              minLength={3}
              maxLength={120}
              className="mt-2 h-11 w-full rounded-md border bg-card px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <label className="block text-sm font-extrabold sm:col-span-2">
            Message
            <textarea
              rows={6}
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
              required
              minLength={10}
              maxLength={4000}
              className="mt-2 w-full resize-none rounded-md border bg-card px-3 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
        </div>
        <div className="mt-5 flex justify-end">
          <Button type="submit" className="min-w-36" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
            {isPending ? "Sending..." : "Send Message"}
          </Button>
        </div>
      </form>
      {toast ? (
        <div className="fixed bottom-5 right-5 z-[80] w-[min(360px,calc(100vw-32px))] rounded-lg border bg-card p-4 shadow-soft">
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 ${toast.type === "success" ? "text-primary" : "text-destructive"}`}>
              {toast.type === "success" ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
            </span>
            <p className="flex-1 text-sm font-semibold">{toast.message}</p>
            <button type="button" className="rounded-md p-1 text-muted-foreground hover:bg-muted" onClick={() => setToast(null)} aria-label="Close notification">
              <X size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
