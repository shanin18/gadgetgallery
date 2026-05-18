import type { Metadata } from "next";
import { SeoProductListing } from "@/components/shop/SeoProductListing";

export const metadata: Metadata = {
  title: "Shop Gadgets",
  description: "Browse GadgetGallery gadgets and accessories in Bangladesh.",
  alternates: { canonical: "/shop" }
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;

  return (
    <SeoProductListing
      heading="Shop"
      description="Browse gadgets, accessories, earphones, storage, cooling gear and daily tech essentials with clear pricing in BDT."
      searchParams={params}
    />
  );
}
