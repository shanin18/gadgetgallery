import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="container-page grid min-h-[calc(100svh-8rem)] place-items-center py-4 pb-20 md:min-h-[calc(100svh-4rem)] md:py-10">
      <RegisterForm />
    </div>
  );
}
