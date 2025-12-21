# RoutesSkill.md

## Public Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Homepage | Hero video, featured services |
| `/services` | Service catalog | All available services |
| `/booking` | Booking wizard | Multi-step appointment booking |
| `/shop` | Product store | Shop products for sale |
| `/about` | About page | Company info, mission |
| `/team` | Team page | Staff profiles |
| `/blog` | Blog listing | Articles and tips |
| `/contact` | Contact info | Location, hours, contact form |
| `/careers` | Job listings | Open positions |

## Staff Routes (Protected)

| Path | Page | Description |
|------|------|-------------|
| `/staff/login` | Staff login | Authentication page |
| `/staff/calendar` | Schedule view | Appointment calendar |
| `/staff/checkout` | POS checkout | Square terminal integration |
| `/staff/inventory` | Inventory management | Product stock tracking |

## Admin Routes

| Path | Page | Description |
|------|------|-------------|
| `/admin` | Admin panel | System administration |
| `/enterprise` | Enterprise admin | Advanced settings |

## Route Guards

- **Public routes:** Accessible to all
- **Staff routes:** Require Clerk authentication
- **Admin routes:** Require admin role
