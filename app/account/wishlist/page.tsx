import { ProductCard } from "@/components/shop/ProductCard";
import { products } from "@/lib/catalog";

export default function WishlistPage() {
  return (
    <div>
      <h2 className="font-display text-2xl font-extrabold">Wishlist</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {products.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  );
}
