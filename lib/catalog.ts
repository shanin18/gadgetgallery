export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  stock: number;
  brand: string;
  category: string;
  categorySlug: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  image: string;
  images: string[];
  specs: Record<string, string>;
};

export const categories = [
  { name: "Earphones", slug: "earphones", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=80" },
  { name: "Headphones", slug: "headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80" },
  { name: "Cooling Gear", slug: "cooling-gear", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80" },
  { name: "Storage", slug: "storage", image: "https://images.unsplash.com/photo-1601737487795-dab272f52420?auto=format&fit=crop&w=900&q=80" },
  { name: "Accessories", slug: "accessories", image: "https://images.unsplash.com/photo-1625961332771-3f40b0e2bdcf?auto=format&fit=crop&w=900&q=80" }
];

export const products: Product[] = [
  {
    id: "p1",
    name: "AeroBass TWS Earbuds",
    slug: "aerobass-tws-earbuds",
    description: "Compact wireless earbuds with low-latency gaming mode, punchy bass and 28 hours total battery life.",
    price: 2450,
    comparePrice: 3150,
    stock: 42,
    brand: "AeroBass",
    category: "Earphones",
    categorySlug: "earphones",
    rating: 4.7,
    reviewCount: 118,
    featured: true,
    image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=900&q=80"
    ],
    specs: { Battery: "28 hours", Connectivity: "Bluetooth 5.3", Warranty: "6 months" }
  },
  {
    id: "p2",
    name: "FrostPad Laptop Cooler",
    slug: "frostpad-laptop-cooler",
    description: "Metal mesh laptop cooler with dual fans, adjustable height and quiet airflow for long work or gaming sessions.",
    price: 1850,
    comparePrice: 2200,
    stock: 27,
    brand: "FrostPad",
    category: "Cooling Gear",
    categorySlug: "cooling-gear",
    rating: 4.5,
    reviewCount: 76,
    featured: true,
    image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=900&q=80",
    images: ["https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=900&q=80"],
    specs: { Fans: "2 x 120mm", Noise: "Below 24dB", Size: "Up to 17 inch" }
  },
  {
    id: "p3",
    name: "StudioWave Wireless Headphone",
    slug: "studiowave-wireless-headphone",
    description: "Over-ear headphones with soft cushions, balanced audio and foldable travel design.",
    price: 3950,
    comparePrice: 4700,
    stock: 15,
    brand: "StudioWave",
    category: "Headphones",
    categorySlug: "headphones",
    rating: 4.8,
    reviewCount: 204,
    featured: true,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
    images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80"],
    specs: { Battery: "40 hours", Driver: "40mm", Charging: "USB-C" }
  },
  {
    id: "p4",
    name: "SwiftStore 128GB MicroSD",
    slug: "swiftstore-128gb-microsd",
    description: "Fast microSD card for phones, action cameras and handheld consoles with adapter included.",
    price: 1350,
    stock: 86,
    brand: "SwiftStore",
    category: "Storage",
    categorySlug: "storage",
    rating: 4.6,
    reviewCount: 143,
    featured: false,
    image: "https://images.unsplash.com/photo-1601737487795-dab272f52420?auto=format&fit=crop&w=900&q=80",
    images: ["https://images.unsplash.com/photo-1601737487795-dab272f52420?auto=format&fit=crop&w=900&q=80"],
    specs: { Capacity: "128GB", Speed: "UHS-I U3", Warranty: "5 years" }
  },
  {
    id: "p5",
    name: "VoltMate 30W Charger",
    slug: "voltmate-30w-charger",
    description: "Compact GaN wall charger with USB-C Power Delivery for phones, tablets and accessories.",
    price: 1650,
    comparePrice: 1990,
    stock: 54,
    brand: "VoltMate",
    category: "Accessories",
    categorySlug: "accessories",
    rating: 4.4,
    reviewCount: 91,
    featured: false,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80",
    images: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80"],
    specs: { Output: "30W PD", Ports: "USB-C", Plug: "EU two-pin" }
  },
  {
    id: "p6",
    name: "FlexLink Braided USB-C Cable",
    slug: "flexlink-braided-usb-c-cable",
    description: "Durable 1.5m braided cable with fast charging support and reinforced connectors.",
    price: 590,
    stock: 120,
    brand: "FlexLink",
    category: "Accessories",
    categorySlug: "accessories",
    rating: 4.3,
    reviewCount: 67,
    featured: false,
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80",
    images: ["https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80"],
    specs: { Length: "1.5m", Charging: "60W", Material: "Braided nylon" }
  }
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function filterProducts(params: { q?: string; category?: string; min?: number; max?: number; sort?: string }) {
  let result = [...products];
  if (params.q) {
    const query = params.q.toLowerCase();
    result = result.filter((product) => [product.name, product.description, product.brand].join(" ").toLowerCase().includes(query));
  }
  if (params.category) {
    result = result.filter((product) => product.categorySlug === params.category);
  }
  if (params.min) {
    result = result.filter((product) => product.price >= params.min!);
  }
  if (params.max) {
    result = result.filter((product) => product.price <= params.max!);
  }
  if (params.sort === "price-asc") result.sort((a, b) => a.price - b.price);
  if (params.sort === "price-desc") result.sort((a, b) => b.price - a.price);
  if (params.sort === "rating") result.sort((a, b) => b.rating - a.rating);
  if (params.sort === "newest") result.reverse();
  return result;
}
