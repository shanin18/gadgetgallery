import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  return (
    <div className="container-page grid min-h-[calc(100svh-8rem)] place-items-center py-4 pb-20 md:min-h-[calc(100svh-4rem)] md:py-10">
      <form className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="font-display text-3xl font-extrabold">Reset password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter your email and we will send reset instructions when Resend is configured.</p>
        <label className="mt-6 block text-sm font-semibold">
          Email
          <input type="email" className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
        </label>
        <Button className="mt-6 w-full">Send reset link</Button>
      </form>
    </div>
  );
}
