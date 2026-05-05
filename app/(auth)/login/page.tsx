import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="container-page grid min-h-[680px] place-items-center py-10">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
