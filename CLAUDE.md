# CLAUDE.md - Zavira Salon Project Guidelines

> **🔒 PROTECTED FILE - DO NOT DELETE**
> **Last Audit:** December 20, 2025

This file contains all the rules and guidelines Claude must follow when working on this project.

---

## Project Overview

**Zavira** is a modern salon booking and management system with:
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

**⚠️ PERFORMANCE:** When running background agents, limit to **2 agents at a time maximum** to prevent CLI lag. Run agents in batches and wait for completion before starting new ones.

### Supabase MCP (mcp__supabase__)
**ALWAYS USE for database operations:**
- `mcp__supabase__list_tables` - View database structure
- `mcp__supabase__execute_sql` - Run queries
- `mcp__supabase__apply_migration` - Apply schema changes
- `mcp__supabase__list_projects` - List projects
- `mcp__supabase__get_logs` - Debug issues

**When to use:** Any database work, debugging data issues, schema changes

### Chrome DevTools MCP (mcp__chrome-devtools__)
**ALWAYS USE for testing and verification:**
- `mcp__chrome-devtools__navigate_page` - Go to URL
- `mcp__chrome-devtools__take_screenshot` - Capture page
- `mcp__chrome-devtools__take_snapshot` - Get page structure
- `mcp__chrome-devtools__click` - Click elements
- `mcp__chrome-devtools__fill` - Fill forms
- `mcp__chrome-devtools__list_console_messages` - Check for errors
- `mcp__chrome-devtools__list_network_requests` - Debug API calls

**When to use:** After ANY UI change, to verify it works

**⚠️ IMPORTANT:** After verification is complete, CLOSE the Chrome DevTools browser window. If left open, subsequent sessions will fail with "browser already running" error.

### Playwright E2E Tests
**Location:** `e2e/` folder
**Run with:** `npx playwright test`

**⚠️ CLEANUP:** Delete temporary test scripts from `e2e/` after verification is complete. Only keep permanent regression tests. Remove screenshots from `e2e/screenshots/` after review.

---

## CRITICAL: Verification Behavior

### ⚠️ MANDATORY: Verify EVERY Edit Before Saying Done

**Claude MUST verify each code change BEFORE marking it as complete:**

1. **For EVERY file edit:**
   - After making an edit, Claude MUST verify it worked
   - Use Chrome DevTools MCP to load the page and check the change
   - Take a screenshot to confirm visual changes
   - Check console for errors with `list_console_messages`
   - If verification fails, FIX IT immediately - do not say "done"

2. **Verification Workflow:**
   ```
   Edit File → Navigate to Page → Take Screenshot → Check Console → Confirm Working → Then Say Done
   ```

3. **DO NOT stop and ask user to verify manually. Instead:**
   - Use Chrome DevTools MCP to navigate to the page
   - Take a screenshot to verify
   - Check console for errors
   - If something fails, FIX IT - don't ask user

4. **After database changes:**
   - Use Supabase MCP to verify data
   - Run a test query to confirm
   - Check for errors in logs

5. **If browser gets stuck:**
   - Try refreshing with `navigate_page`
   - Take a new snapshot
   - Check network requests for issues
   - Try a different approach - don't give up

6. **NEVER say:** "Please verify this manually" or "Can you check if this works?"
   - Instead: USE THE TOOLS to verify yourself
   - Only ask user if something truly requires their input (login, payment, etc.)

### Verification Checklist (Use for Every Task)
- [ ] Code edited successfully
- [ ] Page loads without errors
- [ ] Visual change confirmed via screenshot
- [ ] Console shows no new errors
- [ ] Functionality works as expected

---

## 🚀 Background Agent Execution & Parallel Processing

> **Based on 2025 industry best practices for AI agent orchestration**

### Why Use Background Agents?

**Performance Impact:**
- **50% faster completion** for multi-task workflows ([Skywork AI Research](https://skywork.ai/blog/agent/multi-agent-parallel-execution-running-multiple-ai-agents-simultaneously/))
- **90.2% improvement** on complex tasks with parallel subagents
- **14% time reduction** by eliminating sequential blocking
- Handle **50% more tasks per hour** vs sequential processing

**Productivity Benefits:**
- Continue chatting while agents work in background
- Complete independent tasks concurrently
- Reduce overall workflow time from minutes to seconds
- Main agent stays responsive for new requests

**Sources:**
- [Azure AI Agent Design Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
- [Multi-Agent Parallel Execution Guide](https://skywork.ai/blog/agent/multi-agent-parallel-execution-running-multiple-ai-agents-simultaneously/)
- [Claude Async Workflows](https://claudefa.st/blog/guide/agents/async-workflows)
- [Medium: Scale Multi-Agent Systems](https://medium.com/@manojjahgirdar/scale-a-multi-agent-system-effectively-by-parallel-execution-of-agents-acc79a126a0b)

---

### Core Pattern: Orchestrator-Subagent Model

**Claude (Main Agent) = Orchestrator**
- Manages task routing and coordination
- Launches specialized subagents for specific jobs
- Synthesizes results from multiple agents
- Remains available for user interaction

**Background Agents = Specialized Workers**
- Each handles ONE specific task
- Run asynchronously without blocking main agent
- Report back results when complete
- Can run in parallel if tasks are independent

**Industry Standard (2025):**
> "The predominant model features a central orchestrator managing task routing and coordination, while specialized subagents address distinct tasks. In production, stable agents give each subagent one job with the orchestrator handling global planning, delegation, and state."
> — [Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)

---

### When to Use Background Agents

#### ✅ USE Background Agents For:

1. **Independent Tasks** (can run in parallel)
   - Multiple file searches across different directories
   - Security fixes in separate files (rotate API keys, fix configs)
   - API calls to different services
   - Database migrations + npm installs
   - Code linting + running tests
   - Generating multiple reports

2. **Long-Running Operations**
   - `npm install` / `npm audit fix`
   - Git history cleanup with filter-repo
   - Large file processing or transformations
   - Deployment monitoring and verification
   - Running comprehensive E2E test suites
   - Building multiple environments

3. **Research & Analysis**
   - Searching documentation from multiple sources
   - Gathering data from different APIs
   - Analyzing multiple code files for patterns
   - Verifying deployments across environments
   - Security audits across multiple layers

#### ❌ DON'T Use Background Agents For:

1. **Dependent Tasks** (must run sequentially)
   - Edit file → Build → Test → Deploy
   - Create database → Apply migrations → Seed data
   - Install package → Import in code → Use component
   - Fix code → Run tests → Verify pass

2. **Quick Operations** (faster to do directly)
   - Single file edits
   - Simple grep searches
   - Reading one file
   - Running a single bash command
   - Taking a screenshot

3. **Interactive Tasks** (require user input)
   - Asking clarifying questions
   - Getting user approval for changes
   - Requesting credentials or secrets
   - Selecting from multiple options

---

### Batching Strategy: Run 2 Agents at a Time

**Why limit to 2 concurrent agents?**
- **Prevents resource contention** - Each agent needs CPU/memory
- **Avoids system lag** - Too many parallel processes slow everything
- **Easier to monitor** - Track 2 agents vs 6 agents
- **Better error handling** - Issues are easier to debug
- **Balances speed with stability** - Optimal parallelization

**Optimal Batching Pattern:**
```
Batch 1: Launch 2 agents → Wait for completion → Check results
Batch 2: Launch 2 agents → Wait for completion → Check results
Batch 3: Launch 2 agents → Wait for completion → Check results

NOT RECOMMENDED: Launch all 6 agents at once (causes lag and crashes)
```

**Real-World Example: Security Fix Workflow**
```
TASK: Fix 6 security issues across codebase

Batch 1 (Critical Secrets - 2 agents):
  Agent 1: Remove hardcoded Square token from payment function
  Agent 2: Delete EMAIL file containing exposed Resend API key
  → Wait ~2 minutes for completion
  → Verify both succeeded

Batch 2 (Configuration - 2 agents):
  Agent 3: Fix vercel.json (remove hardcoded API keys)
  Agent 4: Run npm audit fix (resolve vulnerabilities)
  → Wait ~3 minutes for completion
  → Check for errors

Batch 3 (Cleanup - 2 agents):
  Agent 5: Clean Git history (remove exposed secrets)
  Agent 6: Add security headers to vercel.json
  → Wait ~2 minutes for completion
  → Final verification

Total Time: ~7 minutes
vs Sequential: ~15 minutes (53% faster!)
```

---

### How to Launch Background Agents

#### Using the Task Tool with run_in_background

**Single Background Agent:**
```
Task tool parameters:
- subagent_type: "general-purpose" (or specialized type)
- description: "Short 3-5 word summary"
- prompt: "Detailed task instructions"
- run_in_background: true  ← KEY: Makes it async
```

**Multiple Agents in Parallel (Batch):**
Send a SINGLE message with MULTIPLE Task tool calls:
```
Message contains:
  Task 1 with run_in_background: true
  Task 2 with run_in_background: true

Both launch immediately in parallel
```

#### Checking Agent Status

**Non-Blocking Check (peek at progress):**
```
TaskOutput with:
- task_id: (agent ID from launch response)
- block: false  ← Returns immediately
- Shows current status without waiting
```

**Blocking Check (wait for completion):**
```
TaskOutput with:
- task_id: (agent ID)
- block: true  ← Waits until agent finishes
- timeout: 120000 (2 minutes)
```

**Best Practice:**
- Use `block: false` to check progress while working
- Use `block: true` when you need the result to continue
- Always set reasonable timeouts (30s-120s typical)

---

### Agent Communication Patterns

#### 1. Fire-and-Forget (Non-Critical)
```
Launch agent → Continue working → Check results later
Example: Background build, non-critical analysis
```

#### 2. Monitored Execution (Standard)
```
Launch batch → Continue chatting → Check progress → Get results → Launch next batch
Example: Most development tasks
```

#### 3. Synchronized Execution (Critical)
```
Launch batch → Wait for completion → Verify results → Then proceed
Example: Security fixes, deployment verification
```

---

### Best Practices for Background Agents

#### DO:
✅ **Launch independent tasks in parallel** (batch of 2)
✅ **Keep main agent available** for user chat
✅ **Use TodoWrite** to track batch progress
✅ **Set descriptive names** (helps debugging)
✅ **Include error handling** in agent prompts
✅ **Verify results** before launching next batch
✅ **Document what each agent does** in description
✅ **Use timeouts** to prevent hanging

#### DON'T:
❌ **Launch >2 agents** simultaneously (causes lag)
❌ **Launch dependent tasks** in parallel
❌ **Forget to check results** before continuing
❌ **Use background agents for quick tasks**
❌ **Block the main agent** unnecessarily
❌ **Launch agents without clear goals**
❌ **Ignore agent failures** (check status!)

---

### Performance Monitoring

#### Key Metrics to Track:
1. **Completion Time** - How long did batch take?
2. **Success Rate** - Did all agents complete successfully?
3. **Error Rate** - How many failed and why?
4. **Speedup** - Sequential time vs parallel time

#### Example Tracking:
```
Batch 1 Started: 10:00:00
Batch 1 Complete: 10:02:15 (2min 15sec)
  ✅ Agent 1: Success (removed token)
  ✅ Agent 2: Success (deleted EMAIL)

Batch 2 Started: 10:02:20
Batch 2 Complete: 10:05:30 (3min 10sec)
  ✅ Agent 3: Success (fixed vercel.json)
  ⚠️ Agent 4: Partial (11 vulns fixed, 24 remain)

Total: 5min 30sec (vs 12min sequential = 54% faster)
```

---

### Common Patterns by Task Type

#### Code Changes (Parallel)
```
Agent 1: Fix file A
Agent 2: Fix file B
→ Independent files = safe to parallelize
```

#### Build Pipeline (Sequential)
```
Agent 1: Fix code
→ Wait for completion
Agent 2: Run build
→ Wait for completion
Agent 3: Run tests
→ Sequential due to dependencies
```

#### Multi-Service Deployment (Parallel)
```
Agent 1: Deploy to Vercel
Agent 2: Deploy Supabase Edge Functions
→ Independent services = safe to parallelize
```

#### Security Audit (Mixed)
```
Batch 1 (Parallel):
  Agent 1: Scan frontend code
  Agent 2: Scan backend code

Batch 2 (Sequential - uses Batch 1 results):
  Agent 3: Generate combined report
  Agent 4: Create fix recommendations
```

---

### Error Handling

**If an agent fails:**
1. Check the error message in TaskOutput
2. Review agent's attempted actions
3. Fix the underlying issue
4. Relaunch only the failed agent (not entire batch)
5. Verify success before proceeding

**Common Failures:**
- **Timeout** → Increase timeout or split task
- **Tool Error** → Fix tool parameters
- **Dependency Missing** → Run prerequisite first
- **Permission Error** → Check file access
- **Resource Exhaustion** → Reduce batch size

---

### Integration with TodoWrite

**Track batch progress:**
```
TodoWrite with todos:
  1. [in_progress] Batch 1: Fix critical secrets (Agent 1 & 2)
  2. [pending] Batch 2: Update configs (Agent 3 & 4)
  3. [pending] Batch 3: Final cleanup (Agent 5 & 6)

Update after each batch:
  1. [completed] Batch 1: Fix critical secrets ✅
  2. [in_progress] Batch 2: Update configs (Agent 3 & 4)
  3. [pending] Batch 3: Final cleanup (Agent 5 & 6)
```

---

### Advanced: Dynamic Batching

**Adaptive batch sizes based on task complexity:**
```
Simple tasks (file edits): Batch of 3
Medium tasks (npm install): Batch of 2
Complex tasks (git rebase): Batch of 1 (sequential)
```

**Auto-scaling based on system resources:**
```
If CPU < 50% and Memory < 70%:
  → Increase batch size to 3
Else:
  → Stick with batch size of 2
```

---

### Summary: The Parallel Processing Advantage

**Before (Sequential):**
```
Task 1 (2 min) → Task 2 (3 min) → Task 3 (2 min) → Task 4 (3 min) = 10 minutes total
Main agent BLOCKED during entire process
User must WAIT for completion
```

**After (Parallel Batches of 2):**
```
Batch 1: Task 1 + Task 2 (3 min in parallel)
Batch 2: Task 3 + Task 4 (3 min in parallel)
= 6 minutes total (40% faster!)

Main agent AVAILABLE for chat
User can CONTINUE working
```

**The Future is Parallel:**
> "2025 is positioning parallel execution as a fundamental pattern for scaling AI agent systems effectively in production environments."
> — Industry research on [agentic AI workflow patterns](https://www.marktechpost.com/2025/08/09/9-agentic-ai-workflow-patterns-transforming-ai-agents-in-2025/)

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

## Database Tables (Supabase)

> Source: `src/integrations/supabase/types.ts`

### Core Tables
| Table | Description |
|-------|-------------|
| `appointments` | Customer appointments with status tracking |
| `services` | Available salon services with pricing |
| `staff` | Staff members with roles and permissions |
| `customers` | Customer profiles and contact info |
| `feedback` | Customer feedback and reviews |

### Admin & Auth
| Table | Description |
|-------|-------------|
| `admin_credentials` | Admin login credentials |
| `staff_permissions` | Role-based permissions |
| `access_audit_log` | Security audit trail |

### Content
| Table | Description |
|-------|-------------|
| `beauty_tips` | Beauty tips and advice content |
| `video_tutorials` | Video tutorial metadata |
| `instagram_posts` | Instagram feed posts |
| `instagram_stories` | Instagram stories |
| `ugc_posts` | User-generated content |

### Group Bookings & Payments
| Table | Description |
|-------|-------------|
| `group_bookings` | Group booking sessions |
| `terminal_checkouts` | Square terminal transactions |
| `newsletter_subscribers` | Email newsletter signups |
| `products` | Shop products |
| `reviews` | Product reviews |

---

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
├── styles/               # Global styles
└── types/                # TypeScript type definitions

public/
├── images/               # Static images (DO NOT DELETE)
└── *.svg, *.png          # Icons and logos

supabase/
├── functions/            # Edge Functions
└── migrations/           # Database migrations

e2e/                      # Playwright test files
```

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

## Files Safe to Delete

These are generated/temporary files:
- `test-results/` - Playwright test output
- `playwright-report/` - Test reports
- `*.png` in root directory - Debug screenshots
- `dist/` - Build output (regenerated)

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

---

## ⚠️ HARDCODED DATA (Needs Migration to Database)

> **AUDIT DATE:** December 20, 2025
> See `HARDCODED_AUDIT_REPORT.md` for full details

### Critical Issues
| File | Issue | Line(s) |
|------|-------|---------|
| `ReceiptConfirmationModal.tsx` | **WRONG ADDRESS** - "123 Beauty Street, Toronto, ON" | ~119 |
| `Contact.tsx` | Hardcoded address, phone, email, hours | 80-114 |
| `Booking.tsx` | Hardcoded time slots (9 AM - 11:30 PM) | 355-386 |
| `Privacy.tsx` | Hardcoded email and phone | Multiple |
| `AnimatedMenu.tsx` | Hardcoded address | Multiple |
| `SEO.tsx` | Hardcoded business metadata | Multiple |

### Price Data (Should be from `services` table)
- `Reports.tsx` - Sample revenue/analytics data
- `StaffAnalytics.tsx` - Sample analytics data
- `StaffDashboard.tsx` - Sample dashboard data
- `LoyaltyProgram.tsx` - Hardcoded point values and rewards

### Customer Data (Should be from `customers` table)
- `CustomersManagement.tsx` - Sample customer list with fake data

### Business Hours
- Currently hardcoded as "Daily: 8:00 AM - 11:30 PM"
- Should be stored in database and fetched dynamically
- Different staff may have different working hours

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

*Last updated: December 20, 2025 - Added comprehensive parallel agent execution guide*
