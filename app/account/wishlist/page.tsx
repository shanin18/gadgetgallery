import type { Prisma } from "@prisma/client";
import { ProductCard } from "@/components/shop/ProductCard";
import { WishlistRemoveButton } from "@/components/shop/WishlistRemoveButton";
import type { Product } from "@/lib/catalog";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type WishlistProduct = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: true;
  };
}>;

function toCatalogProduct(product: WishlistProduct): Product {
  const image = product.images[0]?.url ?? "";

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : undefined,
    stock: product.stock,
    brand: product.brand ?? "",
    category: product.category.name,
    categorySlug: product.category.slug,
    rating: product.rating,
    reviewCount: product.reviewCount,
    featured: product.featured,
    image,
    images: product.images.map((item) => item.url),
    specs: product.specs && typeof product.specs === "object" && !Array.isArray(product.specs) ? (product.specs as Record<string, string>) : {}
  };
}

export default async function WishlistPage() {
  const session = await auth();
  const wishlist = session?.user?.id
    ? await db.wishlist.findUnique({
        where: { userId: session.user.id },
        include: {
          products: {
            include: {
              category: true,
              images: { orderBy: [{ isPrimary: "desc" }, { id: "asc" }] }
            }
          }
        }
      })
    : null;
  const products = wishlist?.products.map(toCatalogProduct) ?? [];

  return (
    <div>
      <h2 className="font-display text-2xl font-extrabold">Wishlist</h2>
      {products.length ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} showWishlistBadge={false} action={<WishlistRemoveButton productSlug={product.slug} />} />
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-lg border bg-card p-5 text-sm font-semibold text-muted-foreground">
          Your wishlist is empty.
        </p>
      )}
    </div>
  );
}
