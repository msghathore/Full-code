# TechStackSkill.md

## Directory Structure

```
src/
├── components/         # Reusable UI components
│   ├── schedule/       # Calendar/scheduling
│   ├── staff/          # Staff-specific
│   ├── auth/           # Authentication guards
│   ├── layout/         # Sidebars, nav
│   └── ui/             # shadcn/ui base
├── pages/              # Route pages
│   ├── staff/          # Staff portal
│   └── auth/           # Auth pages
├── hooks/              # Custom React hooks
├── lib/                # Utilities and constants
├── services/           # API service layers
├── integrations/       # Third-party
│   └── supabase/       # Supabase client & types
├── styles/             # Global styles
└── types/              # TypeScript types

public/
├── images/             # Static images (DO NOT DELETE)
└── *.svg, *.png        # Icons and logos

supabase/
├── functions/          # Edge Functions
└── migrations/         # Database migrations

e2e/                    # Playwright tests
```

## Critical Files - DO NOT DELETE

### Core
- `src/App.tsx` - Main router
- `src/main.tsx` - Entry point
- `src/staff-app.tsx` - Staff router
- `src/staff-main.tsx` - Staff entry
- `src/index.css` - Global styles

### Config
- `package.json` - Dependencies
- `vite.config.ts` - Build config
- `tailwind.config.ts` - Tailwind
- `tsconfig.json` - TypeScript
- `.env` - Environment (NEVER commit)

### All files in:
- `src/components/` - All used
- `src/pages/` - All routed
- `src/hooks/` - All imported
- `src/lib/` - All used
- `src/services/` - All used
- `public/images/` - All referenced
- `supabase/` - Backend

## Coding Conventions

### TypeScript
```typescript
// Explicit types, no 'any'
interface AppointmentProps {
  id: string;
  clientName: string;
  status: AppointmentStatus;
}

// Functional components
const AppointmentCard = ({ id, clientName, status }: AppointmentProps) => {
  // ...
};
```

### Component Structure
```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types/Interfaces
interface Props { }

// 3. Component
export const MyComponent = ({ prop1 }: Props) => {
  // 4. Hooks first
  const [state, setState] = useState();

  // 5. Derived values
  const computed = useMemo(() => {}, []);

  // 6. Handlers
  const handleClick = () => {};

  // 7. Render
  return <div>...</div>;
};
```

### Styling
- Use Tailwind classes inline
- Use `cn()` for conditional classes
- Keep dark mode as primary
- Use shadcn/ui components

### Database
- Always use RLS policies
- Use migrations for schema changes
- Never hardcode IDs in migrations
