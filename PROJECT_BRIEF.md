`# Soul Sisters — Project Brief

**Type:** Custom E-Commerce System
**Location:** Dubai, UAE
**Delivery Zone:** Dubai only
**Build Time:** 30 – 40 Days
**Architecture:** Multi-Page Application (MPA)

---

## What We Are Building

A complete, fully custom e-commerce system for Soul Sisters — a women's clothing brand based in Dubai, UAE. No Shopify. No templates. Everything is built from scratch and fully owned by the client.

The system has two parts:

1. **Customer Website** — where shoppers browse, explore, and purchase
2. **Admin CMS Dashboard** — where the Soul Sisters team manages the store

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe |
| Image Storage | Cloudinary |
| Hosting | Vercel |
| Cart State | Zustand |
| Charts | Recharts |
| Icons | Lucide React |

---

## Business Rules

| Rule | Detail |
|---|---|
| Currency | AED (د.إ) — fils as smallest unit |
| Delivery | Dubai, UAE only |
| VAT | 5% UAE VAT applied at checkout |
| Phone format | +971 5X XXX XXXX |
| Order number format | SS-2026-00001 |
| Address format | Area → Street → Building → Flat number |
| Delivery areas | Dropdown selection (not open text) |

### Dubai Delivery Areas

Jumeirah, Downtown Dubai, Dubai Marina, JLT, Business Bay, Al Barsha,
Deira, Bur Dubai, Mirdif, Palm Jumeirah, DIFC, Al Quoz, Sports City,
Silicon Oasis, Discovery Gardens, Al Nahda, Karama, Satwa, Oud Metha, Rashidiya

### Product Sizes

XS, S, M, L, XL, XXL

### Product Categories

Tops, Bottoms, Dresses, Co-ords, Outerwear, Accessories

---

## Part 1 — Customer Website

### Pages

| Page | URL | Description |
|---|---|---|
| Homepage | `/` | Hero, featured products, brand story |
| Shop | `/shop` | All products with filters and sorting |
| Product Detail | `/product/[slug]` | Images, size/colour selector, add to cart |
| Cart | `/cart` | Cart items, quantities, subtotal |
| Checkout | `/checkout` | Address, payment, order summary |
| Order Confirmed | `/order-confirmed/[id]` | Success page with order details |
| Track Order | `/track` | Order status timeline |
| Account | `/account` | Order history, saved addresses |

### Customer Features

- Browse products by category, size, and colour
- Product image gallery with zoom
- Size and colour variant selector
- Stock availability per variant
- Persistent cart (survives page refresh)
- Cart drawer with item count badge
- Dubai area dropdown at checkout
- UAE 5% VAT calculated at checkout
- Stripe card payment in AED
- Guest checkout + account checkout
- Order confirmation page with order number
- Order tracking with status timeline
- Account page — order history and addresses
- Wishlist (save products for later)

---

## Part 2 — Admin CMS Dashboard

### Pages

| Page | URL | Description |
|---|---|---|
| Dashboard Home | `/admin` | Stats overview — orders, revenue, stock alerts |
| Products | `/admin/products` | List all products |
| Add Product | `/admin/products/new` | Add new product with images |
| Edit Product | `/admin/products/[id]` | Edit product details and stock |
| Orders | `/admin/orders` | All orders with status and filters |
| Order Detail | `/admin/orders/[id]` | Full order info, update status |
| Analytics | `/admin/analytics` | Revenue charts, top products, order trends |

### Admin Features

- Password-protected admin area
- Add, edit, and delete products
- Upload product images via Cloudinary (drag and drop)
- Set sizes, colours, and stock quantity per variant
- Mark variants as out of stock
- View all customer orders
- Update order status (confirmed → processing → out for delivery → delivered)
- Filter orders by status and date
- Sales analytics — daily/weekly/monthly revenue in AED
- Top selling products chart
- Low stock alerts (variants with less than 5 units)
- Order value breakdown with VAT

---

## Database Tables

| Table | Purpose |
|---|---|
| `users` | Customer accounts |
| `addresses` | Saved delivery addresses (Dubai areas) |
| `products` | Product listings |
| `product_variants` | Size + colour + stock per product |
| `orders` | Customer orders |
| `order_items` | Products inside each order |
| `shipments` | Delivery tracking info |
| `wishlists` | Saved products per customer |

---

## Folder Structure

```
/app
  /page.jsx
  /shop/page.jsx
  /product/[slug]/page.jsx
  /cart/page.jsx
  /checkout/page.jsx
  /order-confirmed/[id]/page.jsx
  /track/page.jsx
  /account/page.jsx
  /admin/page.jsx
  /admin/products/page.jsx
  /admin/products/new/page.jsx
  /admin/products/[id]/page.jsx
  /admin/orders/page.jsx
  /admin/orders/[id]/page.jsx
  /admin/analytics/page.jsx
  /api/products/route.js
  /api/orders/route.js
  /api/payments/route.js
  /api/webhooks/stripe/route.js
  /api/auth/route.js

/components
  /layout
    Navbar.jsx
    Footer.jsx
    AdminSidebar.jsx
  /ui
    Button.jsx
    Badge.jsx
    Modal.jsx
    Toast.jsx
    Input.jsx
    Spinner.jsx
  /product
    ProductCard.jsx
    ProductGrid.jsx
    ProductFilters.jsx
  /cart
    CartDrawer.jsx
    CartItem.jsx
  /admin
    StatsCard.jsx
    OrderTable.jsx
    ProductForm.jsx

/lib
  supabase.js
  stripe.js
  cloudinary.js
  constants.js
```

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ADMIN_PASSWORD=
```

---

## Build Phases

| Phase | What Gets Built | Timeline |
|---|---|---|
| **Phase 1** | Scaffold — folder structure, dependencies, env setup | Days 1–2 |
| **Phase 2** | Supabase database schema + RLS policies | Days 3–4 |
| **Phase 3** | Homepage + Shop page + Product detail pages | Days 5–10 |
| **Phase 4** | Cart + Checkout + Stripe payments | Days 11–16 |
| **Phase 5** | Order confirmation + Order tracking | Days 17–19 |
| **Phase 6** | Customer account + Supabase Auth | Days 20–22 |
| **Phase 7** | Admin CMS — product management + image upload | Days 23–27 |
| **Phase 8** | Admin CMS — order management | Days 28–30 |
| **Phase 9** | Admin analytics dashboard | Days 31–34 |
| **Phase 10** | Polish, mobile testing, deploy to Vercel | Days 35–40 |

---

## Accounts & Services Setup

| Service | Status | Used For |
|---|---|---|
| GitHub | ✅ Created | Code storage + deployment pipeline |
| Vercel | ✅ Created | Hosting (connect to GitHub repo) |
| Supabase | ✅ Created | Database + Auth |
| Stripe | ✅ Created | Card payments in AED |
| Cloudinary | ✅ Created | Product image storage + CDN |
| Domain | ✅ Purchased | Point DNS to Vercel when ready |

---

## Deployment Plan

1. Push code to GitHub repository
2. Connect GitHub repo to Vercel
3. Add all environment variables in Vercel dashboard
4. Vercel auto-deploys on every push to `main`
5. Point purchased domain DNS to Vercel
6. SSL certificate is automatic and free via Vercel

---

## Cost Summary

| Item | Cost |
|---|---|
| Development | INR 40,000 (one-time) |
| Annual Maintenance | INR 5,000/year |
| Hosting (Vercel) | Free |
| Database (Supabase) | Free tier |
| Images (Cloudinary) | Free tier |
| Payments (Stripe) | 2.9% + ~INR 25 per transaction |
| WhatsApp Notifications | INR 2,000–2,500/month (optional) |

---

*Soul Sisters | Dubai, UAE | Built on Next.js + Supabase + Stripe*
