import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoProductListing } from "@/components/shop/SeoProductListing";
import { db } from "@/lib/db";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await db.category.findUnique({ where: { slug }, select: { name: true, slug: true } });
  if (!category) return {};

  return {
    title: `${category.name} Price in Bangladesh`,
    description: `Shop ${category.name} at GadgetGallery with clear BDT pricing, delivery in Bangladesh and updated product availability.`,
    alternates: { canonical: `/category/${category.slug}` }
  };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ slug }, queryParams] = await Promise.all([params, searchParams]);
  const category = await db.category.findUnique({ where: { slug }, select: { name: true, slug: true } });

  if (!category) notFound();

  return (
    <SeoProductListing
      heading={`${category.name} Price in Bangladesh`}
      description={`Find ${category.name} at GadgetGallery with updated prices, stock availability and delivery support across Bangladesh.`}
      searchParams={queryParams}
      fixedCategory={category.slug}
    />
  );
}
