import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <div className="container-page py-10">{children}</div>;
}
