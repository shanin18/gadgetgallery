import { redirect } from "next/navigation";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { auth } from "@/lib/auth";

export default async function CheckoutPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  return <CheckoutClient />;
}
