import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/catalog";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "shamimhosan02@gmail.com";
  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", emailVerified: new Date() },
    create: {
      email: adminEmail,
      name: "GadgetGallery Admin",
      role: "ADMIN",
      emailVerified: new Date(),
      passwordHash: await bcrypt.hash("Admin@12345", 12)
    }
  });

  for (const category of categories) {
    await db.category.upsert({
      where: { slug: category.slug },
      update: { image: category.image },
      create: category
    });
  }

  for (const product of products) {
    const category = await db.category.findUniqueOrThrow({ where: { slug: product.categorySlug } });
    await db.product.upsert({
      where: { slug: product.slug },
      update: { stock: product.stock, price: product.price },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        comparePrice: product.comparePrice,
        stock: product.stock,
        brand: product.brand,
        rating: product.rating,
        reviewCount: product.reviewCount,
        featured: product.featured,
        specs: product.specs,
        categoryId: category.id,
        images: { create: product.images.map((url, index) => ({ url, alt: product.name, isPrimary: index === 0 })) }
      }
    });
  }

  await db.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: { code: "WELCOME10", discount: 10, type: "PERCENTAGE", minOrder: 1000, maxUses: 500 }
  });

  console.log(`Seeded GadgetGallery with admin ${admin.email}`);
}

main().finally(async () => {
  await db.$disconnect();
});
