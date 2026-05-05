# Full-Stack E-Commerce Platform — Implementation Plan

A modern, production-grade e-commerce platform built with Next.js latest App Router, PostgreSQL via Prisma ORM, NextAuth.js (JWT), and multiple payment gateways including Stripe, PayPal, SSLCommerz (bKash), and Cash on Delivery.

---

## User Review Required

> [!IMPORTANT]
> **Database**: You'll need a PostgreSQL server running. Options:
> - **Local**: Install PostgreSQL on your Windows machine (recommended for dev)
> - **Cloud (Free)**: [Neon.tech](https://neon.tech) — serverless PostgreSQL, free tier available
> - **Cloud (Free)**: [Supabase](https://supabase.com) — PostgreSQL + extras, free tier available
>
> **Before we start you'll need to tell me**: Do you want local PostgreSQL or a cloud one?

> [!IMPORTANT]
> **Payment Gateways**: Stripe, PayPal, and SSLCommerz require API keys from their developer portals.
> - **Stripe**: [stripe.com/developers](https://stripe.com) — free test mode available
> - **PayPal**: [developer.paypal.com](https://developer.paypal.com) — sandbox available
> - **SSLCommerz**: [sslcommerz.com](https://sslcommerz.com) — requires BD merchant account
>
> We'll use **test/sandbox keys** initially so you can develop without a real account.

> [!WARNING]
> **Image Storage**: Product images need cloud storage. We'll use **Cloudinary** (free tier: 25GB) for image uploads. You'll need a free Cloudinary account at [cloudinary.com](https://cloudinary.com).

---

## Open Questions

> [!IMPORTANT]
> 1. **Store name / branding?** What is the name of your shop? (e.g., "ShopBD", "MarketBD") — needed for logo, title tags, SEO.
answer: shop name is GadgetGallery, logo which ever suits.
> 2. **Product categories?** What types of products will you sell? (e.g., clothing, electronics, groceries)
answer: focus on the gadgets, accessories (earphones, cooler, headphone, sd card etc..), 
> 3. **Currency?** Primary currency — BDT (Taka ৳) or USD ($), or both?
answer: BDT
> 4. **Admin email?** What email should be the first admin user?
answer: shamimhosan02@gmail.com
> 5. **PostgreSQL preference?** Local install or cloud (Neon/Supabase)?
answer: cloud must 

---

## Proposed Architecture

```
d:\ecommerce-site\
├── app/                          # Next.js lastest version App Router
│   ├── (auth)/                   # Auth group (login, register, forgot-password)
│   ├── (shop)/                   # Shop group (home, products, product detail)
│   ├── (cart)/                   # Cart & Checkout
│   ├── account/                  # User account (orders, wishlist, profile)
│   ├── admin/                    # Admin dashboard (protected)
│   └── api/                      # API Route Handlers
│       ├── auth/[...nextauth]/   # NextAuth handler
│       ├── products/             # Product CRUD
│       ├── orders/               # Order management
│       ├── cart/                 # Cart operations
│       ├── payments/             # Payment processing
│       │   ├── stripe/
│       │   ├── paypal/
│       │   └── sslcommerz/
│       └── webhooks/             # Payment webhooks
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── layout/                   # Navbar, Footer, Sidebar
│   ├── shop/                     # Product cards, filters, search
│   ├── cart/                     # Cart drawer, summary
│   ├── checkout/                 # Checkout steps, payment forms
│   └── admin/                    # Admin dashboard components
├── lib/
│   ├── db.ts                     # Prisma client singleton
│   ├── auth.ts                   # NextAuth config
│   ├── auth.config.ts            # Edge-compatible auth config
│   ├── stripe.ts                 # Stripe instance
│   ├── cloudinary.ts             # Cloudinary upload helper
│   ├── validations/              # Zod schemas
│   └── utils.ts                  # Utilities, formatters
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Demo data seeder
├── store/                        # Zustand client state (cart, UI)
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript types
├── public/                       # Static assets
└── middleware.ts                 # Auth route protection
```

---

## Technology Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | **Next.js latest version** (App Router) | Full-stack, SSR/SSG, SEO-ready |
| Language | **TypeScript** | Type safety |
| UI Library | **shadcn/ui** + Tailwind CSS | Beautiful, accessible components |
| Database | **PostgreSQL** | Reliable SQL, ACID compliant |
| ORM | **Prisma** | Type-safe DB queries, migrations |
| Auth | **NextAuth.js v5** (JWT) | Secure session management |
| Payments | **Stripe, PayPal, SSLCommerz, COD** | Full payment coverage |
| Images | **Cloudinary** | CDN, optimization, WebP |
| State | **Zustand** | Lightweight client state for cart |
| Validation | **Zod** | Runtime type validation |
| Email | **Resend** | Transactional emails (order confirm, password reset) |
| Security | **bcrypt, helmet, rate-limit** | OWASP best practices |

---

## Proposed Changes

### Phase 1 — Project Scaffolding & Foundation

#### [NEW] Project Bootstrap
- Initialize Next.js 15 with TypeScript + Tailwind + App Router
- Initialize shadcn/ui (New York style, Slate palette)
- Install all dependencies

#### [NEW] `prisma/schema.prisma`
Full database schema with:
- **User** (id, name, email, passwordHash, role, phone, createdAt)
- **Address** (id, userId, street, city, state, postalCode, country, isDefault)
- **Product** (id, name, slug, description, price, comparePrice, stock, categoryId, images[], rating, reviewCount)
- **Category** (id, name, slug, image, parentId for sub-categories)
- **ProductImage** (id, productId, url, alt, isPrimary)
- **Review** (id, userId, productId, rating, comment, createdAt)
- **Cart** (id, userId, items[])
- **CartItem** (id, cartId, productId, quantity)
- **Wishlist** (id, userId, products[])
- **Order** (id, userId, status, paymentStatus, paymentMethod, total, shippingAddress, trackingNumber)
- **OrderItem** (id, orderId, productId, quantity, price)
- **Coupon** (id, code, discount, type, minOrder, maxUses, usedCount, expiresAt)
- **Notification** (id, userId, message, read, type)

#### [NEW] `lib/db.ts` — Prisma singleton
#### [NEW] `lib/auth.ts` + `lib/auth.config.ts` — NextAuth JWT auth
#### [NEW] `middleware.ts` — Route protection
#### [NEW] `.env.local` template — All environment variables

---

### Phase 2 — Design System & Layout

#### [NEW] `app/globals.css`
- CSS custom properties (color tokens, spacing scale)
- Dark mode support
- Custom animations (fade-in, slide-up, skeleton shimmer)
- Google Fonts: **Inter** (body) + **Plus Jakarta Sans** (headings)

#### [NEW] `components/layout/Navbar.tsx`
- Sticky header with blur backdrop
- Logo, navigation links, search bar
- Cart icon with item count badge
- Auth menu (login/register or user dropdown)
- Mobile hamburger menu

#### [NEW] `components/layout/Footer.tsx`
- Store info, links, social icons
- Payment method icons (Stripe, PayPal, bKash, COD)
- Newsletter subscription

#### [NEW] `components/layout/CartDrawer.tsx`
- Slide-out cart sidebar
- Item list, quantity controls, subtotal
- Checkout CTA button

---

### Phase 3 — Pages (Customer Facing)

#### [NEW] `app/(shop)/page.tsx` — **Homepage**
- Hero banner with animated gradient + CTA
- Featured categories grid
- Featured/trending products carousel
- Promotional banners (deals, new arrivals)
- Testimonials section

#### [NEW] `app/(shop)/shop/page.tsx` — **Shop/Browse Page**
- Left sidebar: category filter, price range slider, rating filter, brand filter
- Product grid with lazy loading
- Sort dropdown (price, newest, popularity, rating)
- Search with debounced query
- Pagination (infinite scroll option)
- Server-side filtering via URL search params (SEO-friendly)

#### [NEW] `app/(shop)/product/[slug]/page.tsx` — **Product Detail**
- Dynamic SEO metadata (`generateMetadata`)
- Image gallery with zoom
- Price, stock badge, rating stars
- Add to cart / Add to wishlist
- Quantity selector
- Description tabs (Details, Specifications, Reviews)
- Customer reviews with pagination
- Related products section
- Structured data (JSON-LD) for Google Shopping

#### [NEW] `app/(cart)/cart/page.tsx` — **Cart Page**
- Product list with images
- Quantity +/- controls, remove
- Coupon/promo code input
- Order summary (subtotal, shipping, tax, total)
- Checkout CTA

#### [NEW] `app/(cart)/checkout/page.tsx` — **Checkout (Multi-step)**
- Step 1: Shipping address (auto-fill from profile)
- Step 2: Payment method selection
  - Credit/Debit Card (Stripe Elements)
  - PayPal button
  - SSLCommerz (bKash, Nagad, Rocket, cards)
  - Cash on Delivery
- Step 3: Order review & confirm
- Order confirmation page with number

#### [NEW] `app/account/` — **User Account**
- `/account/orders` — Order history with status tracking
- `/account/wishlist` — Saved products
- `/account/profile` — Edit name, email, phone, avatar
- `/account/addresses` — Manage saved addresses
- `/account/notifications` — Order/promo notifications

#### [NEW] `app/(auth)/` — **Auth Pages**
- `/login` — Email/password login
- `/register` — Registration with email verification
- `/forgot-password` — Password reset flow

---

### Phase 4 — Admin Dashboard

#### [NEW] `app/admin/` — **Admin Panel** (role-protected)
- `/admin` — Dashboard (revenue chart, orders today, top products, recent orders)
- `/admin/products` — Product list with search/filter
- `/admin/products/new` — Add product (rich text editor, image upload)
- `/admin/products/[id]/edit` — Edit product
- `/admin/orders` — Order management (status update, tracking)
- `/admin/users` — User management (ban, role change)
- `/admin/categories` — Category CRUD
- `/admin/coupons` — Discount code management
- `/admin/analytics` — Sales charts (revenue, top products, conversions)
- `/admin/inventory` — Low stock alerts, stock updates

---

### Phase 5 — API Routes

#### [NEW] `app/api/products/` — Product CRUD + search
#### [NEW] `app/api/orders/` — Order lifecycle management
#### [NEW] `app/api/cart/` — Persistent server-side cart
#### [NEW] `app/api/payments/stripe/` — Stripe payment intent
#### [NEW] `app/api/payments/paypal/` — PayPal order create/capture
#### [NEW] `app/api/payments/sslcommerz/` — SSLCommerz session init
#### [NEW] `app/api/webhooks/stripe/` — Stripe webhook (order confirm)
#### [NEW] `app/api/webhooks/paypal/` — PayPal IPN
#### [NEW] `app/api/webhooks/sslcommerz/` — SSLCommerz IPN
#### [NEW] `app/api/upload/` — Cloudinary image upload (admin only)
#### [NEW] `app/api/reviews/` — Review CRUD
#### [NEW] `app/api/wishlist/` — Wishlist add/remove
#### [NEW] `app/api/coupons/validate/` — Coupon validation

---

### Phase 6 — Security & SEO

#### Security Implementation
- `bcryptjs` for password hashing (salt rounds: 12)
- JWT sessions via HTTP-only cookies (NextAuth v5)
- CSRF protection (Next.js built-in)
- Input validation with **Zod** on all API routes
- SQL injection prevention (Prisma parameterized queries)
- XSS prevention (React's built-in escaping + DOMPurify for rich text)
- Rate limiting on auth endpoints (10 requests/15min)
- Security headers via `next.config.js`
- Admin routes protected by middleware role check

#### SEO Implementation
- `generateMetadata()` per page (dynamic title, description, OG tags)
- Product pages: canonical URLs, JSON-LD structured data (Product schema)
- `sitemap.ts` — Dynamic XML sitemap (all products + categories)
- `robots.ts` — Robots.txt configuration
- `app/opengraph-image.tsx` — Dynamic OG images
- URL slugs for all products/categories (SEO-friendly)
- Breadcrumb structured data

---

## Build Order

| # | Phase | Est. Time |
|---|---|---|
| 1 | Scaffolding + DB schema + Auth setup | Day 1 |
| 2 | Design system + Layout components | Day 2 |
| 3 | Homepage + Shop page + Product page | Day 3–4 |
| 4 | Cart + Checkout + Payment integration | Day 5–6 |
| 5 | User account pages | Day 7 |
| 6 | Admin dashboard | Day 8–9 |
| 7 | Security hardening + SEO | Day 10 |
| 8 | Seed data + Testing + Polish | Day 11 |

---

## Verification Plan

### Automated Checks
- `npx prisma validate` — Schema validation
- `npm run build` — TypeScript + build check
- `npm run lint` — ESLint

### Browser Testing (via browser subagent)
- Homepage renders correctly
- Products browse, filter, search work
- Add to cart and checkout flow
- Admin dashboard login and CRUD
- Mobile responsive layout

### Manual Verification
- Stripe test payment (card: 4242 4242 4242 4242)
- PayPal sandbox payment
- SSLCommerz sandbox
- COD order placement
- Password reset email delivery
- Admin product add with image upload

