# ProjectSkill.md

**Zavira Salon & Spa** - Modern salon booking and management system

## Architecture

**Public Customer Site:**
- Booking wizard
- Service catalog
- Product shop
- Blog and content

**Staff Portal:**
- Appointment management
- POS checkout
- Inventory tracking

**Admin Panel:**
- Staff management
- Analytics and reports
- System configuration

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** React Query (TanStack Query)
- **Backend:** Supabase (Postgres + Auth + Edge Functions)
- **Payments:** Square SDK
- **Auth:** Clerk (staff) + Supabase Auth (customers)
- **Testing:** Playwright (E2E)
- **Hosting:** Vercel

## Business Info

- **Name:** Zavira Salon & Spa
- **Address:** 283 Tache Avenue, Winnipeg, MB, Canada
- **Phone:** (431) 816-3330
- **Email:** zavirasalonandspa@gmail.com
- **Hours:** Daily: 8:00 AM - 11:30 PM
- **Timezone:** America/Winnipeg
- **Founded:** 2020

## Design Principles

1. **Elegant & Minimal** - No clutter, generous whitespace
2. **Public = Dark + Glow** - Black background, white glowing text
3. **Admin = Light + Clean** - White background, black text
4. **Smooth Animations** - Subtle transitions and hover effects
5. **Mobile Responsive** - All features work on mobile
