import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgePercent, Headphones, PackageCheck, ShieldCheck, Truck, Zap } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { HomeProductCard } from "@/components/shop/HomeProductCard";
import { PromoCarousel } from "@/components/shop/PromoCarousel";
import { ProductCarousel } from "@/components/shop/ProductCarousel";
import { db } from "@/lib/db";
import { mapDbProduct } from "@/lib/product-mapper";
import { formatBDT } from "@/lib/utils";

const productInclude = {
  category: { select: { name: true, slug: true } },
  images: { orderBy: [{ isPrimary: "desc" as const }, { id: "asc" as const }] }
};

function SectionHeader({ eyebrow, title, mobileTitle, detail, href, showMobileLink = false }: { eyebrow: string; title: string; mobileTitle?: string; detail?: string; href?: string; showMobileLink?: boolean }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-extrabold uppercase text-primary">{eyebrow}</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">
          {mobileTitle ? <span className="sm:hidden">{mobileTitle}</span> : null}
          <span className={mobileTitle ? "hidden sm:inline" : undefined}>{title}</span>
        </h2>
        {detail ? <p className="mt-2 hidden max-w-xl text-sm leading-6 text-muted-foreground sm:block">{detail}</p> : null}
      </div>
      {href ? (
        <Link href={href} className={`${showMobileLink ? "inline-flex" : "hidden"} shrink-0 items-center gap-2 rounded-md px-2 py-2 text-sm font-extrabold text-primary hover:bg-muted sm:inline-flex sm:border sm:px-4 sm:text-foreground`}>
          <span className="sm:hidden">See All</span>
          <span className="hidden sm:inline">View all</span>
          <ArrowRight size={16} className="hidden sm:block" />
        </Link>
      ) : null}
    </div>
  );
}

export default async function HomePage() {
  const [products, carouselProducts, dealProducts, categories] = await Promise.all([
    db.product.findMany({
      take: 8,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      include: productInclude
    }),
    db.product.findMany({
      take: 12,
      orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
      include: productInclude
    }),
    db.product.findMany({
      where: { comparePrice: { not: null } },
      take: 3,
      orderBy: { createdAt: "desc" },
      include: productInclude
    }),
    db.category.findMany({
      where: { products: { some: {} } },
      take: 6,
      orderBy: { name: "asc" },
      include: {
        products: {
          take: 1,
          orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
          include: productInclude
        }
      }
    })
  ]);

  const featuredProducts = products.map(mapDbProduct);
  const topProducts = carouselProducts.map(mapDbProduct);
  const deals = dealProducts.map(mapDbProduct);
  const heroProduct = featuredProducts[0];

  if (!heroProduct) {
    return (
      <div className="container-page py-16">
        <div className="rounded-lg border bg-card p-8">
          <p className="text-sm font-extrabold uppercase text-primary">GadgetGallery</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold">Products are coming soon</h1>
          <p className="mt-3 text-muted-foreground">Add products from the admin dashboard to populate the homepage.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in bg-[#eef6ff] md:bg-transparent">
      <section className="hidden border-b bg-card md:block">
        <div className="container-page grid min-h-[560px] items-center gap-10 py-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="max-w-xl">
            <p className="inline-flex rounded-md bg-primary/10 px-3 py-1 text-sm font-extrabold text-primary">Modern gadgets in BDT</p>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-6xl">Upgrade your everyday tech setup</h1>
            <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
              Shop curated gadgets, accessories, audio gear and daily tech essentials with clear pricing and fast delivery across Bangladesh.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/shop">Shop products <ArrowRight size={16} /></LinkButton>
              <LinkButton href="/shop?sort=rating" variant="outline">Top rated</LinkButton>
            </div>
            <div className="mt-8 grid gap-3 text-sm font-semibold sm:grid-cols-3">
              <span className="inline-flex items-center gap-2"><Truck size={17} className="text-primary" /> Fast delivery</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck size={17} className="text-primary" /> Secure checkout</span>
              <span className="inline-flex items-center gap-2"><Zap size={17} className="text-primary" /> Fresh deals</span>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="rounded-lg border bg-background px-3 py-3">
                <p className="font-display text-xl font-extrabold">{categories.length}+</p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">Categories</p>
              </div>
              <div className="rounded-lg border bg-background px-3 py-3">
                <p className="font-display text-xl font-extrabold">COD</p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">Available</p>
              </div>
              <div className="rounded-lg border bg-background px-3 py-3">
                <p className="font-display text-xl font-extrabold">BDT</p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">Pricing</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_0.72fr]">
            <Link href={`/product/${heroProduct.slug}`} className="group relative min-h-[360px] overflow-hidden rounded-lg bg-muted shadow-sm sm:min-h-[480px]">
              <Image src={heroProduct.image} alt={heroProduct.name} fill priority sizes="(min-width: 1024px) 52vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-5 text-white">
                <p className="text-sm font-extrabold uppercase opacity-90">{heroProduct.category}</p>
                <h2 className="mt-1 font-display text-2xl font-extrabold">{heroProduct.name}</h2>
                <p className="mt-2 font-display text-xl font-extrabold">{formatBDT(heroProduct.price)}</p>
              </div>
            </Link>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
              {featuredProducts.slice(1, 3).map((product) => (
                <Link key={product.id} href={`/product/${product.slug}`} className="group overflow-hidden rounded-lg border bg-background shadow-sm">
                  <div className="relative aspect-square bg-muted sm:aspect-[4/3]">
                    <Image src={product.image} alt={product.name} fill sizes="(min-width: 1024px) 24vw, 50vw" className="object-cover transition group-hover:scale-105" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold uppercase text-muted-foreground">{product.category}</p>
                    <p className="line-clamp-1 text-sm font-extrabold">{product.name}</p>
                    <p className="mt-1 text-sm font-bold text-primary">{formatBDT(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PromoCarousel products={topProducts.length ? topProducts : featuredProducts} />

      <section className="container-page py-7 md:py-12">
        <SectionHeader eyebrow="Categories" title="Product categories" detail="Jump straight into the collections customers browse most." href="/shop" />
        <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-6">
          {categories.map((category) => {
            const firstProduct = category.products[0] ? mapDbProduct(category.products[0]) : null;
            const image = category.image ?? firstProduct?.image ?? "/placeholder.svg";

            return (
              <Link key={category.slug} href={`/shop?category=${category.slug}`} className="group overflow-hidden rounded-xl active:scale-[0.99]">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
                  <Image src={image} alt={category.name} fill sizes="(min-width: 1024px) 16vw, 33vw" className="object-cover transition group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                </div>
                <div className="p-2.5 text-center sm:p-4 sm:text-left">
                  <p className="line-clamp-1 text-xs font-extrabold sm:text-base">{category.name}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-y bg-card py-7 md:py-12">
        <div className="container-page">
          <SectionHeader eyebrow="Top rated" title="Customer favorites" detail="Swipe through the products with the strongest ratings and most interest." href="/shop?sort=rating" />
          <ProductCarousel products={topProducts} />
        </div>
      </section>

      <section className="bg-muted py-7 md:py-12">
        <div className="container-page">
          <SectionHeader eyebrow="Featured" title="Featured products" mobileTitle="Flash Deals for You" detail="A shorter, cleaner selection of products worth opening first." href="/shop?sort=rating" showMobileLink />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {featuredProducts.slice(0, 8).map((product) => <HomeProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      {deals.length ? (
        <section className="container-page py-7 md:py-12">
          <div className="grid overflow-hidden rounded-lg border bg-card shadow-sm lg:grid-cols-[0.8fr_1.2fr]">
            <div className="flex flex-col justify-center border-b bg-primary p-6 text-primary-foreground sm:p-8 lg:border-b-0 lg:border-r">
              <p className="inline-flex items-center gap-2 text-sm font-extrabold uppercase text-primary-foreground/90"><BadgePercent size={16} /> Deals</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold">Save on selected tech</h2>
              <p className="mt-3 text-sm leading-6 text-primary-foreground/85">A small set of discounted gadgets and accessories, kept short so customers can decide quickly.</p>
              <Link href="/shop?sort=newest" className="mt-6 inline-flex w-fit items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-extrabold text-accent-foreground">
                Explore deals <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2 p-3 sm:gap-4 sm:p-4">
              {deals.map((product) => <HomeProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-muted py-7 md:py-12">
        <div className="container-page grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-primary/10 text-primary"><Truck size={22} /></span>
            <h3 className="mt-4 font-display text-base font-extrabold md:text-xl">Fast local delivery</h3>
            <p className="mt-2 text-xs leading-5 text-muted-foreground md:text-sm md:leading-6">Clear delivery charge and order tracking from checkout to doorstep.</p>
          </div>
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-primary/10 text-primary"><ShieldCheck size={22} /></span>
            <h3 className="mt-4 font-display text-base font-extrabold md:text-xl">Reliable checkout</h3>
            <p className="mt-2 text-xs leading-5 text-muted-foreground md:text-sm md:leading-6">Cash on delivery support with admin-managed order confirmation.</p>
          </div>
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-primary/10 text-primary"><Headphones size={22} /></span>
            <h3 className="mt-4 font-display text-base font-extrabold md:text-xl">Curated catalog</h3>
            <p className="mt-2 text-xs leading-5 text-muted-foreground md:text-sm md:leading-6">Products are grouped by real categories so browsing stays simple.</p>
          </div>
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-primary/10 text-primary"><PackageCheck size={22} /></span>
            <h3 className="mt-4 font-display text-base font-extrabold md:text-xl">Admin verified</h3>
            <p className="mt-2 text-xs leading-5 text-muted-foreground md:text-sm md:leading-6">Every order moves through confirmation and delivery checks.</p>
          </div>
        </div>
      </section>

      <section className="container-page py-7 md:py-12">
        <div className="flex flex-col items-start justify-between gap-5 rounded-lg border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-xs font-extrabold uppercase text-primary">Ready to shop</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold">Find your next everyday gadget</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Browse the full catalog, filter by category, compare prices and add products to cart in a few clicks.
            </p>
          </div>
          <Link href="/shop" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-extrabold text-primary-foreground transition hover:brightness-95">
            Go to shop <ArrowRight size={16} />
          </Link>
        </div>
      </section>

    </div>
  );
}
