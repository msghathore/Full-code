# McpToolsSkill.md

## Supabase MCP

**ALWAYS USE for database operations**

### Tools

- `mcp__supabase__list_tables` - View database structure
- `mcp__supabase__execute_sql` - Run queries
- `mcp__supabase__apply_migration` - Apply schema changes
- `mcp__supabase__list_projects` - List projects
- `mcp__supabase__get_logs` - Debug issues

### When to Use

- Any database work
- Debugging data issues
- Schema changes
- Query testing
- Log analysis

## Chrome DevTools MCP

**ALWAYS USE for testing and verification**

### Tools

- `mcp__chrome-devtools__navigate_page` - Go to URL
- `mcp__chrome-devtools__take_screenshot` - Capture page
- `mcp__chrome-devtools__take_snapshot` - Get page structure
- `mcp__chrome-devtools__click` - Click elements
- `mcp__chrome-devtools__fill` - Fill forms
- `mcp__chrome-devtools__list_console_messages` - Check for errors
- `mcp__chrome-devtools__list_network_requests` - Debug API calls

### When to Use

- After ANY UI change
- To verify functionality
- Debug rendering issues
- Test user flows
- Capture screenshots

### ⚠️ IMPORTANT

**Close browser after verification!**

If left open, subsequent sessions fail with "browser already running" error.

## Playwright E2E Tests

**Location:** `e2e/` folder

**Run:** `npx playwright test`

### When to Use

- Full regression testing
- User flow validation
- Before production deploys

### ⚠️ CLEANUP

- Delete temp test scripts from `e2e/` after use
- Keep only permanent regression tests
- Remove screenshots from `e2e/screenshots/` after review

## Best Practices

**DO:**
- Use Supabase MCP for ALL database work
- Use Chrome DevTools for ALL UI verification
- Close browser after testing
- Clean up temp files

**DON'T:**
- Make database changes without MCP
- Skip UI verification
- Leave browser open
- Commit test artifacts
