# Soul Sisters — Project Brief

**Type:** Custom E-Commerce System
**Location:** Dubai, UAE
**Delivery Zone:** Dubai only
**Architecture:** Next.js App Router (server-rendered pages + API routes)
**Status:** 🟢 **Live** — [soulsistersdubai.com](https://soulsistersdubai.com), Cash on Delivery only (no online payment gateway)

---

## What We Are Building

A complete, fully custom e-commerce system for Soul Sisters — a women's ethnic-wear brand based in Dubai, UAE. No Shopify. No templates. Everything is built from scratch and fully owned by the client.

The system has two parts:

1. **Customer Website** — where shoppers browse, explore, and purchase
2. **Admin CMS Dashboard** — where the Soul Sisters team manages the store, **including every piece of text and imagery on the storefront** — the admin panel is the single control plane; no code changes are needed to run the day-to-day business

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL), Row-Level Security enabled on every table |
| Customer Auth | Supabase Auth — passwordless email code (OTP) + Google OAuth |
| Admin Auth | Custom — scrypt-hashed passwords, HMAC-signed session cookies, owner/staff roles (not Supabase Auth) |
| Transactional Email | Resend (custom SMTP) — branded auth emails from `noreply@soulsistersdubai.com` |
| Payments | Cash on Delivery (no payment gateway integrated) |
| Image Storage | Cloudinary (unsigned upload preset, admin-only widgets) |
| Hosting | Vercel, auto-deploys on push to `main` |
| Domain / DNS | GoDaddy → Vercel |
| Cart State | Zustand (persisted to `localStorage`, survives login redirect) |
| Charts | Recharts (admin analytics) |
| Icons | Lucide React |

---

## Business Rules

| Rule | Detail |
|---|---|
| Currency | AED (د.إ) — fils as smallest unit |
| Delivery | Dubai, UAE only |
| VAT | 5% UAE VAT, admin-configurable |
| Free delivery threshold | Admin-configurable (default: orders over د.إ 200) |
| Delivery fee | Admin-configurable flat rate (default: د.إ 15), same for every zone |
| Order number format | `SS-` + 6 random alphanumeric characters (e.g. `SS-8BPX8O`) — not sequential |
| Guest checkout | **Not allowed** — login required to place an order, enforced server-side |
| Delivery areas | Dropdown, admin-managed list (Admin → Delivery) |
| Discount codes | Percent or fixed amount, min order, usage limits, date windows — admin-managed |

### Dubai Delivery Areas (seeded, admin-editable)

Jumeirah, Downtown Dubai, Dubai Marina, JLT, Business Bay, Al Barsha,
Deira, Bur Dubai, Mirdif, Palm Jumeirah, DIFC, Al Quoz, Sports City,
Silicon Oasis, Discovery Gardens, Al Nahda, Karama, Satwa, Oud Metha, Rashidiya

### Product Sizes

XS, S, M, L, XL, XXL

### Product Categories (seeded, admin-editable — no longer hardcoded)

Dresses, Tops, Bottoms, Co-ords, Outerwear, Accessories

---

## Part 1 — Customer Website

### Pages

| Page | URL | Status |
|---|---|---|
| Homepage | `/` | ✅ Hero (scroll-reveal animation), USP strip, category tiles, featured products, brand story — all content editable from Admin → Site Content |
| Shop | `/shop` | ✅ Filters (category/size), sorting, pagination, loading skeleton |
| Product Detail | `/product/[slug]` | ✅ Image gallery with hover-zoom + parallax, size/colour selector, breadcrumbs, related products |
| Cart | `/cart` | ⚠️ Placeholder page only — the real cart UI is the slide-out **Cart Drawer**, accessible from any page |
| Login | `/login` | ✅ Passwordless email code (8-digit, sent via branded Resend email) or Google OAuth |
| Checkout | `/checkout` | ✅ **Requires login** (redirects to `/login?redirect=/checkout` otherwise), address form, discount code field, Cash on Delivery |
| Order Confirmed | `/order-confirmed/[id]` | ✅ Success page with order details |
| Track Order | `/track` | ✅ Order status timeline |
| Account | `/account` | ✅ Order history + saved addresses (tabbed) |

### Customer Features

- Browse products by category, size, and colour (categories are admin-managed, not hardcoded)
- Product image gallery with hover-zoom and scroll parallax
- Size and colour variant selector, live stock availability per variant
- Persistent cart (localStorage — survives refresh and the login redirect)
- Cart drawer with item count badge and a free-delivery progress bar
- **Login required to check out — no guest checkout**, enforced both in the UI and at the API layer (server rejects unauthenticated payment/order requests)
- Passwordless email-code login (branded, sent from the store's own domain) + "Continue with Google"
- Discount codes at checkout (validated server-side)
- Dubai area dropdown at checkout (admin-managed list)
- UAE VAT + delivery fee calculated server-side from admin settings (not trusted from the client)
- Cash on Delivery — no online payment gateway, order is placed and confirmed immediately, paid in cash on arrival
- Order confirmation page with order number
- Order tracking with status timeline
- Account page — order history and saved addresses
- Hero section: curtain-wipe image reveal, Ken Burns zoom, scroll parallax, staggered text reveal — reduced-motion safe
- Wishlist heart icon on product cards — ⚠️ UI-only right now, not yet saved to the account (the `wishlists` table exists but isn't wired up)

---

## Part 2 — Admin CMS Dashboard

The admin panel was rebuilt from a basic products/orders tool into a **full control plane** — the store owner can now change anything a customer sees or any way the business processes orders, without a code deploy.

### Pages

| Page | URL | Description |
|---|---|---|
| Dashboard | `/admin` | Stats overview (orders today, revenue, total orders, low-stock alerts), recent orders, quick links |
| Admin Login | `/admin/login` | Email + password, per-person accounts (no more shared password) |
| Products | `/admin/products` | List, search, filter by category/status |
| Add Product | `/admin/products/new` | New product with Cloudinary image upload |
| Edit Product | `/admin/products/[id]` | Edit details, variants, stock |
| **Categories** | `/admin/categories` | 🆕 Add/rename/reorder/hide categories, upload tile images — feeds the storefront nav, shop filters, homepage tiles, and footer |
| **Site Content** | `/admin/content` | 🆕 Edit every storefront text/image: announcement bar, hero copy + image, USP strip, homepage headings, brand story, footer, product trust badges, cart copy, and email/SMS notification templates |
| **Delivery** | `/admin/delivery` | 🆕 Manage delivery areas (add/remove/toggle) and set the delivery fee, free-delivery threshold, and VAT rate |
| **Discounts** | `/admin/discounts` | 🆕 Create percent/fixed discount codes with min order, usage limits, and date windows |
| Orders | `/admin/orders` | List with search, status filter, date range, CSV export |
| Order Detail | `/admin/orders/[id]` | Full order info, status timeline, tracking info, notes; cancelling/returning an order restores stock (no online refund — Cash on Delivery, refunds are handled in person) |
| **Customers** | `/admin/customers` | 🆕 Customer list with order count and lifetime spend |
| Analytics | `/admin/analytics` | Rebuilt from an empty placeholder into real charts: daily revenue, orders/day, top products, order-status breakdown |
| **Admins** | `/admin/admins` | 🆕 Owner-only — create/deactivate admin accounts, assign **owner** or **staff** role |

### Admin Features

- **Role-based accounts** (owner / staff) with per-person login — replaced the single shared admin password
- Add, edit, and delete products; upload images via Cloudinary (drag and drop)
- Set sizes, colours, and stock quantity per variant; mark variants out of stock
- **Manage categories** — previously a hardcoded list in code, now fully admin-editable
- **Manage every storefront text and image** — hero, announcement bar, footer, brand story, USP strip, product page trust badges, cart copy, and notification templates — with image upload + preview where relevant
- **Manage delivery** — areas, delivery fee, free-delivery threshold, VAT rate (previously hardcoded and duplicated in two files)
- **Manage discount codes** — percent or fixed, minimum order, usage caps, start/end dates
- **View customers** — order count and lifetime spend per customer
- View all customer orders; update status (confirmed → processing → out for delivery → delivered); search, filter by status/date; **export to CSV**
- **Cancel or return an order** — restores stock automatically (refunds for Cash on Delivery orders are handled in person, not through the system)
- Sales analytics — daily revenue, orders/day, top products, status breakdown (previously an empty placeholder page)
- Low stock alerts (variants with 5 or fewer units)
- **Manage other admins** (owner role only) — add staff accounts, deactivate, reset passwords

---

## Database Tables

| Table | Purpose |
|---|---|
| `users` | Customer accounts |
| `addresses` | Saved delivery addresses (Dubai areas) |
| `products` | Product listings |
| `product_variants` | Size + colour + stock per product |
| `orders` | Customer orders — plus `refunded_at`, `refund_amount`, `refund_id`, `cancelled_at`, `discount_code`, `discount_amount` |
| `order_items` | Products inside each order (stores a price/name/image snapshot at purchase time) |
| `shipments` | Delivery tracking info |
| `wishlists` | Saved products per customer (table exists; storefront UI not yet wired to it) |
| `categories` 🆕 | Admin-managed product categories (name, slug, image, sort order, visibility) |
| `delivery_zones` 🆕 | Admin-managed Dubai delivery areas |
| `discounts` 🆕 | Discount/promo codes |
| `admin_users` 🆕 | Admin accounts — scrypt password hash, role (owner/staff), active flag |
| `site_content` 🆕 | Every editable text/image/JSON block on the storefront, keyed by section |

All Row-Level Security policies were audited; two overly-permissive policies (`orders`, `order_items` were publicly readable by anyone with the public API key) were found and removed — see **Security**, below.

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=        # now a "publishable" key (sb_publishable_...), not a JWT
SUPABASE_SERVICE_ROLE_KEY=            # now a "secret" key (sb_secret_...), not a JWT
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET= # unsigned preset, admin upload widgets only
ADMIN_SECRET_TOKEN=                   # signs admin session cookies — high-entropy random value
DATABASE_URL=                         # local dev/debug scripts only, not read by the deployed app
```

`ADMIN_PASSWORD` is legacy — only used once by the seed script to create the initial owner account; the running app no longer reads it. Resend's SMTP credentials are configured directly in the Supabase dashboard (Authentication → Emails → SMTP Settings), not as an app environment variable.

---

## Status by Phase

| Phase | What Was Built | Status |
|---|---|---|
| Scaffold, schema, RLS | Folder structure, dependencies, Supabase schema | ✅ Done |
| Homepage + Shop + Product pages | Built, then later given a full visual pass (hero animations, category imagery, product card polish) | ✅ Done |
| Cart + Checkout | Built; checkout later locked behind login (no guest checkout); Stripe removed in favour of Cash on Delivery | ✅ Done (Cash on Delivery) |
| Order confirmation + tracking | Built | ✅ Done |
| Customer account + auth | Built with Supabase email OTP + Google OAuth; OTP length bug (app expected 6 digits, Supabase sends 8) fixed | ✅ Done |
| Admin CMS — products + images | Built | ✅ Done |
| Admin CMS — orders | Built, later extended with CSV export; Stripe refund flow removed with Cash on Delivery switch | ✅ Done |
| Admin analytics | Originally a placeholder; rebuilt with real charts | ✅ Done |
| **Admin control-plane rebuild** | Categories, Site Content, Delivery, Discounts, Customers, and Admins screens added; role-based admin auth; storefront rewired to read from these tables instead of hardcoded values | ✅ Done |
| **Security hardening** | Full audit + critical fixes (see below) | ✅ Critical items done; some High-severity items open |
| **Deployment** | Vercel + custom domain (soulsistersdubai.com) via GoDaddy DNS, branded transactional email via Resend | ✅ Live |
| Polish / mobile testing | Ongoing | 🔶 In progress |

---

## Security

A full security audit was performed (OWASP Top 10 + e-commerce-specific checks: payment integrity, RLS, admin auth, secrets hygiene). All 5 **critical** findings have been fixed and verified:

1. ✅ **Orders/order-items were publicly readable** by anyone holding the public API key — insecure RLS policies dropped
2. ✅ **Database password had leaked into public git history** — rotated; old password confirmed dead
3. ✅ **Supabase service-role key had leaked into public git history** — migrated to the new publishable/secret key system; old key confirmed dead
4. ✅ **Admin session secret was a weak, guessable string** — rotated to a random 256-bit value
5. ✅ **Negative/zero/fractional cart quantities could zero out a charge or corrupt stock** — server-side validation added to `/api/payments`

**Known follow-ups (High severity, not yet fixed):**
- Order-tracking endpoint leaks customer PII to anyone who guesses an order number (order numbers were made non-sequential, but tracking still needs an additional secret/login check)
- No check that a customer confirming an order actually owns it (order-hijack risk)
- Discount code usage counter has a race condition (a limited-use code could be over-redeemed)
- No rate limiting on admin login (brute-force risk)
- No security headers configured (`X-Frame-Options`, CSP, etc.)
- Next.js version has known CVEs, needs upgrading

---

## Accounts & Services Setup

| Service | Status | Used For |
|---|---|---|
| GitHub | ✅ Created (repo is **public**) | Code storage + deployment pipeline |
| Vercel | ✅ Live | Hosting, connected to GitHub `main`, auto-deploys on push |
| Supabase | ✅ Live | Database + customer auth; secrets rotated post-audit |
| Cloudinary | ✅ Created | Product image storage + CDN |
| Resend | ✅ Created | Branded transactional email (login codes) from the store's own domain |
| Domain | ✅ **Live** — soulsistersdubai.com | DNS on GoDaddy, pointed at Vercel |

---

## Deployment Status

1. ✅ Code pushed to GitHub (`main` branch)
2. ✅ Vercel project connected to the GitHub repo
3. ✅ Environment variables configured in Vercel
4. ✅ Vercel auto-deploys on every push to `main`
5. ✅ Domain DNS pointed at Vercel (A record + CNAME in GoDaddy)
6. ✅ SSL certificate automatic via Vercel
7. ✅ Stripe removed — checkout is Cash on Delivery only, no payment gateway integrated

---

## Cost Summary

| Item | Cost |
|---|---|
| Development | INR 40,000 (one-time) |
| Annual Maintenance | INR 5,000/year |
| Hosting (Vercel) | Free |
| Database (Supabase) | Free tier |
| Images (Cloudinary) | Free tier |
| Email (Resend) | Free tier |
| Payments | Cash on Delivery — no gateway fees |
| WhatsApp Notifications | INR 2,000–2,500/month (optional, not yet built) |

---

*Soul Sisters | Dubai, UAE | Built on Next.js + Supabase — live at [soulsistersdubai.com](https://soulsistersdubai.com)*
