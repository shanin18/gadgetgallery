import { Suspense } from "react";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";

export default function VerifyEmailPage() {
  return (
    <div className="container-page grid min-h-[680px] place-items-center py-10">
      <Suspense>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
