# CLAUDE.md - Zavira Salon Project Guidelines

> **🔒 PROTECTED FILE - DO NOT DELETE**
> **Last Audit:** December 21, 2025

This file contains all the rules and guidelines Claude must follow when working on this project.

**For detailed autonomous workflow and orchestration patterns, see:**
- **[ORCHESTRATOR.md](./ORCHESTRATOR.md)** - Autonomous agent framework and workflow
- **[SKILLS/](./SKILLS/)** - Modular domain knowledge (<2k tokens each)
- **[TECHNICAL_DEBT.md](./TECHNICAL_DEBT.md)** - Hardcoded data audit and migration plan

---

## Project Overview

**Zavira** is a modern salon booking and management system with:
- **Production Domain:** https://zavira.ca
- Public customer-facing website (booking, shop, blog)
- Staff portal for managing appointments and checkout
- Admin panel for staff management
- Supabase backend with Edge Functions
- Square payment integration

---

## 🏢 Business Information (REAL VALUES)

| Field | Value |
|-------|-------|
| **Name** | Zavira Salon & Spa |
| **Address** | 283 Tache Avenue, Winnipeg, MB, Canada |
| **Phone** | (431) 816-3330 |
| **Email** | zavirasalonandspa@gmail.com |
| **Hours** | Daily: 8:00 AM - 11:30 PM |
| **Timezone** | America/Winnipeg |
| **Founded** | 2020 |

---

## Brand Guidelines

### Brand Identity
- **Name:** Zavira Salon & Spa
- **Tone:** Modern, luxurious, professional yet approachable
- **Target Audience:** Beauty-conscious customers seeking premium salon services

### CRITICAL: Theme Rules (ALWAYS FOLLOW)

#### Public Website (Customer-Facing)
- **Background:** BLACK (`bg-black` or `bg-slate-950`)
- **Text:** WHITE with GLOW effect
- **Logo Text Style:** Same glowing white text effect as logo
- **Glow Effect CSS:**
```css
text-shadow: 0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.4);
```
- **Tailwind class:** `drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]`

#### Staff Portal / Admin Dashboard
- **Background:** WHITE (`bg-white`)
- **Text:** BLACK (`text-black` or `text-slate-900`)
- **Clean, professional look - NO glow effects**

### Color Palette
| Purpose | Color | Hex |
|---------|-------|-----|
| Primary | Deep Purple | `#7c3aed` (violet-600) |
| Secondary | Rose Gold | `#f43f5e` (rose-500) |
| Accent | Emerald | `#10b981` (emerald-500) |
| Public Site BG | Black | `#000000` or `#020617` (slate-950) |
| Admin BG | White | `#ffffff` |
| Public Text | White Glow | `#ffffff` with text-shadow |
| Admin Text | Black | `#0f172a` (slate-900) |

### ⚠️ CRITICAL: Brand Colors ONLY

**DO NOT USE any colors outside of the brand color palette above.**

**FORBIDDEN COLORS (Never use these):**
- ❌ Blue (`blue-*`, `sky-*`, `cyan-*`) - Use `violet-*` instead
- ❌ Teal (`teal-*`) - Use `emerald-*` instead
- ❌ Any non-brand colors

**ALLOWED COLOR FAMILIES:**
- ✅ `violet-*` (primary brand color)
- ✅ `purple-*` (primary family)
- ✅ `rose-*` (secondary brand color)
- ✅ `emerald-*` / `green-*` (accent color)
- ✅ `amber-*` / `yellow-*` (status: requested)
- ✅ `gray-*` / `slate-*` (neutral)
- ✅ `white` / `black` (backgrounds)
- ✅ `red-*` (errors/cancelled status)
- ✅ `indigo-*` (completed status only)
- ✅ `fuchsia-*` (personal task status)

### Typography (from tailwind.config.ts)
| Font Family | CSS Variable | Usage |
|-------------|--------------|-------|
| **Cormorant Garamond** | `font-serif` | Headings, luxury text |
| **Inter** | `font-sans` | Body text, UI elements |
| **Playfair Display** | `font-script` | Decorative accents |

- **Headings:** Bold, uppercase for main titles, use `font-serif`
- **Body:** Clean, readable `font-sans`
- **Logo Font:** Match the Zavira logo style exactly with glow effect

### Design Principles
1. **Elegant & Minimal** - No clutter, generous whitespace
2. **Public = Dark + Glow** - Black background, white glowing text
3. **Admin = Light + Clean** - White background, black text
4. **Smooth Animations** - Subtle transitions and hover effects
5. **Mobile Responsive** - All features work on mobile

---

## MCP Tools - USE THESE AUTOMATICALLY

Claude has access to these MCP tools and MUST use them proactively:

**⚠️ PERFORMANCE:** When running background agents, limit to **2-3 agents at a time maximum** to prevent CLI lag.

**🤖 MAIN AGENT AVAILABILITY:** The main Claude agent MUST always remain available for chat. Use background agents (with `run_in_background: true`) for long-running tasks.

### Supabase MCP (mcp__supabase__)
**ALWAYS USE for database operations:**
- `mcp__supabase__list_tables` - View database structure
- `mcp__supabase__execute_sql` - Run queries
- `mcp__supabase__apply_migration` - Apply schema changes
- `mcp__supabase__get_logs` - Debug issues

### Chrome DevTools MCP (mcp__chrome-devtools__)
**ALWAYS USE for testing and verification:**
- `mcp__chrome-devtools__navigate_page` - Go to URL
- `mcp__chrome-devtools__take_screenshot` - Capture page
- `mcp__chrome-devtools__list_console_messages` - Check for errors
- `mcp__chrome-devtools__list_network_requests` - Debug API calls

**⚠️ IMPORTANT:** After verification is complete, CLOSE the Chrome DevTools browser window.

### Playwright E2E Tests
**Location:** `e2e/` folder
**Run with:** `npx playwright test`

**⚠️ CLEANUP:** Delete temporary test scripts from `e2e/` after verification is complete.

---

## CRITICAL: Verification Behavior

### ⚠️ MANDATORY: Verify EVERY Edit Before Saying Done

**Claude MUST verify each code change BEFORE marking it as complete:**

### 🚫 NEVER Commit Before Reviews!

**THE PROBLEM:** Claude often commits to Git/Vercel too early, discovers bugs later, requires multiple redeploys.

**THE SOLUTION:** Review FIRST, commit SECOND.

**Verification Workflow (STRICT ORDER):**
```
1. Edit File
   ↓
2. Self-Review (check your own work first!)
   ↓
3. Multi-Review (2-3 agent iterations)
   ↓
4. Fix ALL issues found in reviews
   ↓
5. Local Test with MCP (BEFORE COMMIT!)
   ↓
6. ONLY IF ALL PASS: Commit to Git
   ↓
7. Deploy to Vercel Preview
   ↓
8. Verify Live → Production
```

**DO NOT stop and ask user to verify manually. Instead:**
- Use Chrome DevTools MCP to navigate to the page
- Take a screenshot to verify
- Check console for errors
- If something fails, FIX IT - don't ask user

**Pre-Commit Checklist (ALL MUST PASS):**
- [ ] Code edited successfully
- [ ] Self-review completed
- [ ] 2-3 code review agents completed
- [ ] ALL critical issues fixed
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] Local dev server running
- [ ] Chrome DevTools MCP tested page
- [ ] Page loads without errors
- [ ] Visual change confirmed via screenshot
- [ ] Console shows no new errors
- [ ] Tested actual functionality works
- [ ] Brand guidelines followed

**⚠️ ONLY commit to Git if ALL boxes checked!**

**See these Skills for detailed workflows:**
- **[BugFixingSkill.md](./SKILLS/BugFixingSkill.md)** - Bug fixing with review-before-commit
- **[VerificationWorkflowSkill.md](./SKILLS/VerificationWorkflowSkill.md)** - Full verification process

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| State | React Query (TanStack Query) |
| Backend | Supabase (Postgres + Auth + Edge Functions) |
| Payments | Square SDK |
| Auth | Clerk (staff) + Supabase Auth (customers) |
| Testing | Playwright (E2E) |
| Hosting | Vercel |

---

## Critical Files - DO NOT DELETE

### Core Application
- `src/App.tsx` - Main app router
- `src/main.tsx` - App entry point
- `src/staff-app.tsx` - Staff portal router
- `src/staff-main.tsx` - Staff portal entry
- `src/index.css` - Global styles

### Configuration
- `package.json` - Dependencies
- `vite.config.ts` - Build config
- `tailwind.config.ts` - Tailwind config
- `tsconfig.json` - TypeScript config
- `.env` - Environment variables (NEVER commit)

### All files in these folders
- `src/components/` - All components are used
- `src/pages/` - All pages are routed
- `src/hooks/` - All hooks are imported
- `src/lib/` - All utilities are used
- `src/services/` - All services are used
- `public/images/` - All images are referenced
- `supabase/` - Backend functions and migrations

---

## Coding Conventions

### TypeScript
```typescript
// Use explicit types, avoid 'any'
interface AppointmentProps {
  id: string;
  clientName: string;
  status: AppointmentStatus;
}

// Use functional components with arrow functions
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
interface Props {
  // ...
}

// 3. Component
export const MyComponent = ({ prop1, prop2 }: Props) => {
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
- Use `cn()` utility for conditional classes
- Keep dark mode as primary theme
- Use shadcn/ui components when available

### Database
- Always use RLS policies
- Use migrations for schema changes
- Never hardcode IDs in migrations

---

## Appointment Status Colors

| Status | Color | Class |
|--------|-------|-------|
| Requested | Amber | `bg-amber-500` |
| Accepted | Violet | `bg-violet-300` |
| Confirmed | Emerald | `bg-emerald-500` |
| Ready to Start | Teal | `bg-teal-400` |
| In Progress | Violet | `bg-violet-500` |
| Completed | Indigo | `bg-indigo-500` |
| Cancelled | Rose | `bg-rose-500` |
| No Show | Slate | `bg-slate-500` |
| Personal Task | Fuchsia | `bg-fuchsia-600` |

**See [StatusColorsSkill.md](./SKILLS/StatusColorsSkill.md) for full details.**

---

## Routes

### Public Routes
| Path | Page |
|------|------|
| `/` | Homepage |
| `/services` | Service catalog |
| `/booking` | Booking wizard |
| `/shop` | Product store |
| `/about` | About page |
| `/team` | Team page |
| `/blog` | Blog listing |
| `/contact` | Contact info |
| `/careers` | Job listings |

### Staff Routes (Protected)
| Path | Page |
|------|------|
| `/staff/login` | Staff login |
| `/staff/calendar` | Schedule view |
| `/staff/checkout` | POS checkout |
| `/staff/inventory` | Inventory management |

### Admin Routes
| Path | Page |
|------|------|
| `/admin` | Admin panel |
| `/enterprise` | Enterprise admin |

**See [RoutesSkill.md](./SKILLS/RoutesSkill.md) for full details.**

---

## Important Rules

### DO
- Keep components small and focused
- Use existing shadcn/ui components
- Add proper TypeScript types
- Test on mobile viewports
- Use React Query for data fetching
- Follow the existing color scheme
- **USE MCP TOOLS** to verify changes (Supabase, Chrome DevTools)
- **PERSIST** when testing - don't give up and ask user to do it
- **Act autonomously** - follow ORCHESTRATOR.md workflow
- **Invoke NoHardcodedDataSkill** - Always fetch from database

### DON'T
- Delete files without checking imports first
- Add new npm packages without asking
- Change the color scheme without approval
- Modify database schema without migrations
- Commit `.env` or secrets
- Use `any` type in TypeScript
- **Ask user to "verify manually"** - use tools instead
- **Stop when browser gets stuck** - try alternative approaches
- **Forget the theme rules** - black bg + white glow for public, white bg + black for admin
- **Use hardcoded data** - always fetch dynamically

---

## Common Mistakes to AVOID

1. **Wrong theme colors:**
   - Public site must be BLACK background with WHITE GLOWING text
   - Admin/Staff must be WHITE background with BLACK text
   - Never mix these up

2. **Not using MCP tools:**
   - Always use Supabase MCP for database operations
   - Always use Chrome DevTools to verify UI changes
   - Don't just make changes and assume they work

3. **Giving up on verification:**
   - If Chrome DevTools gets stuck, refresh and retry
   - If a test fails, debug and fix it
   - Only ask user for things that truly need their input

4. **Forgetting logo styling:**
   - Text should match the Zavira logo style
   - White text with glow effect on public pages
   - Keep consistent with brand identity

5. **Using hardcoded data:**
   - See [TECHNICAL_DEBT.md](./TECHNICAL_DEBT.md) for audit
   - See [NoHardcodedDataSkill.md](./SKILLS/NoHardcodedDataSkill.md) for examples
   - Always fetch from Supabase database

---

## Quick Commands

```bash
# Development
npm run dev              # Start dev server (port 8080)

# Build
npm run build            # Production build
npm run preview          # Preview build

# Testing
npx playwright test      # Run E2E tests

# Supabase
npx supabase db push     # Push migrations
npx supabase functions deploy  # Deploy edge functions

# Type Generation
npx supabase gen types typescript --project-id <id> > src/integrations/supabase/types.ts
```

---

## Environment Variables Required

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SQUARE_APP_ID=
VITE_SQUARE_LOCATION_ID=
VITE_CLERK_PUBLISHABLE_KEY=
```

---

## Contact & Resources

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Vercel Dashboard:** https://vercel.com
- **Square Dashboard:** https://squareup.com/dashboard

---

## Autonomous Workflow

**Claude operates autonomously using the orchestrator pattern:**

1. Read [ORCHESTRATOR.md](./ORCHESTRATOR.md) for workflow patterns
2. Load relevant Skills from [SKILLS/](./SKILLS/) folder
3. Execute tasks using background agents (max 2-3 concurrent)
4. Run multi-stage code reviews (2-3 iterations) before deploy
5. Verify fully using MCP tools (Chrome DevTools + Playwright)
6. Report concise results with metrics

**See [ORCHESTRATOR.md](./ORCHESTRATOR.md) for complete autonomous workflow documentation.**

---

*Last updated: December 21, 2025 - Modularized into Skills framework with autonomous orchestration*
