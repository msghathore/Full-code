# Zavira Salon

Modern salon booking and management system built with React, TypeScript, and Supabase.

## Features

- Online appointment booking with real-time availability
- Staff scheduling and calendar management
- Point of Sale (POS) checkout system
- Group booking support
- Product shop with Square payments
- Customer portal with booking history
- Staff portal with role-based permissions
- Admin panel for staff management

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Postgres, Auth, Edge Functions)
- **Payments:** Square SDK
- **Auth:** Clerk (staff) + Supabase Auth (customers)
- **Testing:** Playwright

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SQUARE_APP_ID=your_square_app_id
VITE_SQUARE_LOCATION_ID=your_square_location_id
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

## Project Structure

```
src/
├── components/    # Reusable UI components
├── pages/         # Route page components
├── hooks/         # Custom React hooks
├── lib/           # Utilities and constants
├── services/      # API service layers
└── integrations/  # Third-party integrations

supabase/
├── functions/     # Edge Functions
└── migrations/    # Database migrations
```

## Documentation

See [CLAUDE.md](./CLAUDE.md) for detailed project guidelines and architecture.

## License

MIT
