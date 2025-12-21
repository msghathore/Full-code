# DbSchemaSkill.md

## Database Tables (Supabase)

Source: `src/integrations/supabase/types.ts`

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

## Usage

**ALWAYS use Supabase MCP tools** for database operations:
- `mcp__supabase__list_tables` - View structure
- `mcp__supabase__execute_sql` - Run queries
- `mcp__supabase__apply_migration` - Schema changes
- `mcp__supabase__get_logs` - Debug issues

## Type Generation

After schema changes:
```bash
npx supabase gen types typescript --project-id <id> > src/integrations/supabase/types.ts
```
