# Zavira Salon Booking System - Architecture Guide

Quick reference for navigating the codebase.

## Directory Structure

```
src/
├── components/           # Reusable UI components
│   ├── schedule/         # Calendar/scheduling components
│   ├── staff/            # Staff-specific components
│   ├── auth/             # Authentication guards
│   ├── layout/           # Layout components (sidebars, nav)
│   └── ui/               # shadcn/ui base components
├── pages/                # Route page components
│   ├── staff/            # Staff portal pages
│   └── auth/             # Auth pages (login, signup)
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and constants
├── services/             # API service layers
├── integrations/         # Third-party integrations
│   └── supabase/         # Supabase client & types
└── styles/               # Global styles
```

## Key Files Quick Reference

### Calendar & Scheduling
| File | Purpose |
|------|---------|
| `components/schedule/ScheduleGrid.tsx` | Main calendar grid with drag-drop |
| `components/AppointmentPill.tsx` | Appointment card on calendar |
| `components/DynamicAppointmentPill.tsx` | Alternative appointment component |
| `components/CreateAppointmentDialog.tsx` | Create/edit appointment modal |
| `components/AppointmentContextMenu.tsx` | Right-click menu for appointments |
| `pages/VagaroSchedule.tsx` | Main scheduling page wrapper |

### Staff Portal
| File | Purpose |
|------|---------|
| `staff-app.tsx` | Staff portal router entry |
| `pages/StaffLogin.tsx` | Staff login page |
| `pages/staff/StaffDashboard.tsx` | Staff main dashboard |
| `pages/staff/StaffSettings.tsx` | Staff settings page |
| `pages/staff/StaffCheckoutPage.tsx` | POS checkout page |
| `components/StaffNavigation.tsx` | Staff portal navigation bar |

### Authentication
| File | Purpose |
|------|---------|
| `hooks/useStaffAuth.ts` | Staff authentication state hook |
| `components/auth/StaffRouteGuard.tsx` | Protect staff routes |
| `components/auth/StaffPermissionGuard.tsx` | Permission-based access control |
| `lib/adminAuth.ts` | Admin authentication utilities |
| `pages/AdminPanel.tsx` | Admin panel (staff management) |

### Styling & Colors
| File | Purpose |
|------|---------|
| `lib/colorConstants.ts` | All color definitions (status, staff) |
| `lib/appointmentBadges.ts` | Badge/icon definitions |
| `lib/gridConstants.ts` | Calendar grid measurements |
| `components/ColorLegendPopover.tsx` | Color legend popup |
| `index.css` | Global Tailwind styles |

### Data & Services
| File | Purpose |
|------|---------|
| `integrations/supabase/client.ts` | Supabase client instance |
| `integrations/supabase/types.ts` | Database type definitions |
| `services/api.ts` | API helper functions |
| `hooks/useAppointments.ts` | Appointment data hook |
| `hooks/useStaffData.ts` | Staff data fetching |

## Public Customer Routes

```
/                    → Index (Homepage)
/services            → Services (Service catalog)
/booking             → Booking (Appointment booking wizard)
/booking/checkout    → BookingCheckout (Payment for booking)
/shop                → Shop (Product store)
/shop/checkout       → ShopCheckout (Product checkout)
/about               → About (About page)
/team                → Team (Meet the team)
/blog                → Blog (Blog listing)
/blog/:slug          → BlogPost (Individual blog post)
/contact             → Contact (Contact information)
/careers             → Careers (Job listings)
/faq                 → FAQs (Frequently asked questions)
/privacy             → Privacy (Privacy policy)
/terms               → Terms (Terms of service)
/cookie-policy       → CookiePolicy (Cookie policy)
```

## Group Booking Routes

```
/group-booking                          → GroupBooking (Start group booking)
/group-booking/confirmation/:shareCode  → GroupBookingConfirmation
/group-booking/join/:shareCode          → GroupBookingJoin
/group-booking/checkout/:shareCode      → GroupBookingCheckout
```

## Authentication Routes

```
/auth                → Auth (Login page)
/auth/signup         → Auth (Signup page)
/onboarding          → ProfileCompletion (New user onboarding)
/dashboard           → Dashboard (User dashboard)
/admin               → AdminPanel (Admin access)
```

## Staff Portal Routes

```
/staff/login     → StaffLogin (public)
/staff/calendar  → VagaroSchedule (protected)
/staff/checkout  → StaffCheckoutPage (protected)
/staff/inventory → Inventory (protected, requires permission)
/staff/settings  → StaffSettings (protected)
```

## Navigation Menu Structure (AnimatedMenu.tsx)

The main navigation menu has the following structure with working navigation:

| Menu Item | Main Route | Submenus & Links |
|-----------|------------|------------------|
| SERVICES | `/services` | Hair Services (`/services#hair`), Nail Care (`/services#nails`), Skin Care (`/services#skin`), Massage Therapy (`/services#massage`), Tattoo Art (`/services#tattoo`), Piercing (`/services#piercing`) |
| BOOKING | `/booking` | Book Appointment (`/booking`), Group Booking (`/group-booking`) |
| SHOP | `/shop` | Hair Care (`/shop?category=Hair Care`), Skin Care (`/shop?category=Skin Care`), Nail Care (`/shop?category=Nail Care`), Beauty Tools (`/shop?category=Tools`), Body Care (`/shop?category=Body Care`) |
| BLOG | `/blog` | Beauty Tips (`/blog?category=Beauty Tips`), Style Guides (`/blog?category=Style Guides`), Product Reviews (`/blog?category=Product Reviews`) |
| CAREERS | `/careers` | Current Openings (`/careers#openings`), Apply Now (`/careers#apply`) |
| ABOUT | `/about` | Our Story (`/about#story`), Our Team (`/team`) |
| CONTACT | `/contact` | Hours of Operation (`/contact#hours`), Get Directions (Maps - external), Call Us (`/contact#phone`), FAQ (`/faq`) |

**Navigation Types:**
- **Hash anchors** (`#section`): Scroll to specific sections within the same page
- **Query parameters** (`?category=X`): Filter content by category (Shop, Blog)
- **Separate routes** (`/team`, `/group-booking`, `/faq`): Navigate to dedicated pages
- **External links**: Get Directions opens Apple Maps/Google Maps based on platform

## Appointment Status Flow

```
requested → accepted → confirmed → ready_to_start → in_progress → completed
                                                  ↘ no_show
                                ↘ cancelled
```

## Color Scheme (Vibrant/Bold)

| Status | Color | Tailwind Class |
|--------|-------|----------------|
| Requested | Amber | `bg-amber-500` |
| Accepted | Sky Blue | `bg-sky-500` |
| Confirmed | Emerald | `bg-emerald-500` |
| Ready to Start | Cyan | `bg-cyan-500` |
| In Progress | Violet | `bg-violet-500` |
| Completed | Indigo | `bg-indigo-500` |
| Cancelled | Rose | `bg-rose-500` |
| No Show | Slate | `bg-slate-500` |
| Pending | Orange | `bg-orange-500` |
| Personal Task | Fuchsia | `bg-fuchsia-600` |

## Database Tables (Supabase)

| Table | Purpose |
|-------|---------|
| `appointments` | All booking appointments |
| `staff` | Staff member profiles |
| `staff_permissions` | Permission settings per staff |
| `access_audit_log` | Login/access tracking |
| `services` | Available services catalog |
| `customers` | Customer profiles |
| `transactions` | Payment records |

## Component Relationships

```
App.tsx
└── VagaroSchedule.tsx
    ├── ScheduleSidebar.tsx (date picker, staff filter)
    └── ScheduleGrid.tsx
        ├── DraggableAppointment
        │   └── AppointmentPill.tsx
        │       └── AppointmentContextMenu.tsx
        └── CreateAppointmentDialog.tsx

staff-app.tsx
└── StaffNavigation.tsx
    ├── ColorLegendPopover.tsx
    └── [Protected Route Content]
```

## Quick Edits Guide

**Change appointment text size:** `components/AppointmentPill.tsx` (lines 389-424)
**Change calendar colors:** `lib/colorConstants.ts` (STATUS_COLORS)
**Change grid dimensions:** `lib/gridConstants.ts`
**Add new status:** Update `colorConstants.ts`, `AppointmentContextMenu.tsx`
**Change staff navigation:** `components/StaffNavigation.tsx`
