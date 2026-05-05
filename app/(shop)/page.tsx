import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { ProductCard } from "@/components/shop/ProductCard";
import { categories, products } from "@/lib/catalog";

export default function HomePage() {
  const featured = products.filter((product) => product.featured);

  return (
    <div className="animate-fade-in">
      <section className="border-b bg-card">
        <div className="container-page grid min-h-[560px] items-center gap-10 py-12 lg:grid-cols-[1fr_0.9fr]">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-md bg-muted px-3 py-1 text-sm font-bold text-primary">Gadgets priced in BDT</p>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-6xl">GadgetGallery</h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Useful earphones, headphones, cooling gear, memory cards and accessories for everyday tech setups across Bangladesh.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/shop">Shop gadgets <ArrowRight size={16} /></LinkButton>
              <LinkButton href="/shop?sort=rating" variant="outline">Top rated</LinkButton>
            </div>
            <div className="mt-10 grid gap-3 text-sm font-semibold sm:grid-cols-3">
              <span className="inline-flex items-center gap-2"><Truck size={17} className="text-primary" /> Fast delivery</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck size={17} className="text-primary" /> Secure checkout</span>
              <span className="inline-flex items-center gap-2"><Sparkles size={17} className="text-primary" /> Tested picks</span>
            </div>
          </div>
          <div className="relative min-h-[380px] overflow-hidden rounded-lg bg-muted">
            <Image
              src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1200&q=85"
              alt="Assorted gadgets and accessories"
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase text-primary">Browse</p>
            <h2 className="font-display text-3xl font-extrabold">Featured categories</h2>
          </div>
          <Link href="/shop" className="text-sm font-bold text-primary">View all</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <Link key={category.slug} href={`/shop?category=${category.slug}`} className="group overflow-hidden rounded-lg border bg-card">
              <div className="relative aspect-[4/3] bg-muted">
                <Image src={category.image} alt={category.name} fill sizes="20vw" className="object-cover transition group-hover:scale-105" />
              </div>
              <p className="p-4 font-display font-bold">{category.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-muted py-14">
        <div className="container-page">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase text-primary">Trending</p>
            <h2 className="font-display text-3xl font-extrabold">Popular right now</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-5 py-14 md:grid-cols-2">
        <div className="rounded-lg bg-primary p-8 text-primary-foreground">
          <h2 className="font-display text-2xl font-extrabold">Free delivery over BDT 3,000</h2>
          <p className="mt-3 text-sm opacity-90">Bundle cables, earbuds and accessories to unlock free shipping.</p>
        </div>
        <div className="rounded-lg bg-accent p-8 text-accent-foreground">
          <h2 className="font-display text-2xl font-extrabold">Cash on Delivery ready</h2>
          <p className="mt-3 text-sm opacity-90">Stripe, PayPal, SSLCommerz and COD flows are built into checkout.</p>
        </div>
      </section>
    </div>
  );
}
