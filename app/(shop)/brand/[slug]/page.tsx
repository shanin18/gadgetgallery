import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoProductListing } from "@/components/shop/SeoProductListing";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

async function getBrand(slug: string) {
  const products = await db.product.findMany({
    where: { brand: { not: null } },
    select: { brand: true },
    distinct: ["brand"]
  });

  return products
    .map((product) => product.brand)
    .filter((brand): brand is string => Boolean(brand))
    .find((brand) => slugify(brand) === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return {};

  return {
    title: `${brand} Price in Bangladesh`,
    description: `Shop ${brand} products at GadgetGallery with clear BDT pricing, stock availability and delivery across Bangladesh.`,
    alternates: { canonical: `/brand/${slug}` }
  };
}

export default async function BrandPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ slug }, queryParams] = await Promise.all([params, searchParams]);
  const brand = await getBrand(slug);

  if (!brand) notFound();

  return (
    <SeoProductListing
      heading={`${brand} Price in Bangladesh`}
      description={`Browse ${brand} products at GadgetGallery with updated prices, stock availability and delivery support across Bangladesh.`}
      searchParams={queryParams}
      fixedBrand={brand}
    />
  );
}
