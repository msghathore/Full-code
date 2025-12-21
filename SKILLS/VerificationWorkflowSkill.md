# VerificationWorkflowSkill.md

## MANDATORY: Verify EVERY Edit

**Claude MUST verify each code change BEFORE marking complete.**

## ⚠️ CRITICAL: Review BEFORE Commit!

**THE PROBLEM:** Claude often commits/deploys too early, discovers bugs later, requires multiple redeploys.

**THE SOLUTION:** Follow this STRICT order. DO NOT skip or reorder steps!

## Workflow (STRICT ORDER - NO EXCEPTIONS)

```
1. Edit File
   ↓
2. ⚠️ MANDATORY: Multi-Stage Code Review (2-3 iterations)
   ├─ Self-review first (check your own work!)
   ├─ review-expert1: Bugs, functionality, edge cases
   ├─ review-expert2: Brand compliance, performance, UX
   └─ review-expert3 (if needed): Security, accessibility, TypeScript
   ↓
3. Fix Issues Found in Reviews (iterate until ALL reviews pass)
   ├─ Fix ALL critical issues
   ├─ Re-run reviews if major changes
   └─ ONLY proceed when ZERO critical issues remain
   ↓
4. ⚠️ Local Testing (BEFORE COMMIT!)
   ├─ Chrome DevTools MCP: Navigate, screenshot, console
   ├─ Test the actual functionality/bug fix
   ├─ Verify change works as expected
   └─ Playwright: Run E2E tests
   ↓
5. ⚠️ ONLY IF ALL PASS: Commit to Git
   ├─ Reviews passed ✓
   ├─ Local testing passed ✓
   └─ Functionality verified ✓
   ↓
6. Deploy to Vercel Preview
   ↓
7. Verify Live (MCP on preview URL)
   ↓
8. Production Deploy (only if 100% pass)
```

## 🚫 NEVER Do This (Common Mistake)

```
❌ BAD FLOW (causes multiple redeploys):
1. Edit file
2. Commit to Git ← TOO EARLY!
3. Deploy to Vercel ← TOO EARLY!
4. Check live site
5. Bug still exists! ← WASTED TIME
6. Fix again
7. Commit again
8. Deploy again...
```

**This is inefficient! Always review and test BEFORE commit.**

## Multi-Stage Review (DETAILED)

### Step 1: Self-Review (MANDATORY FIRST STEP)

**Before launching review agents, check your own work:**

Ask yourself:
1. Does this fix the root cause or just symptoms?
2. Did I handle edge cases? (null, undefined, empty arrays)
3. Are there TypeScript errors? (run `npx tsc --noEmit`)
4. Does this break anything else?
5. Is the logic actually correct?
6. Did I follow brand guidelines? (colors, fonts, theme)
7. Is performance acceptable? (no unnecessary re-renders)
8. Are error messages clear and user-friendly?

**If ANY answer is "no" or "unsure" → Fix it NOW before reviews**

### Step 2: Launch Review Agents (Parallel)

**Launch 2-3 review agents in parallel:**

```typescript
// Agent 1: Functionality & Bugs (CRITICAL)
Task({
  subagent_type: "general-purpose",
  description: "Review bugs and functionality",
  prompt: `
    Review this code change for:
    - Does it solve the problem correctly?
    - Edge cases handled? (null, undefined, empty data, invalid input)
    - TypeScript type safety
    - Logic errors or potential bugs
    - Any new bugs introduced?

    Files changed: [list files]

    Be THOROUGH. Report ALL issues found.
  `,
  run_in_background: true
})

// Agent 2: Brand, Performance, UX (IMPORTANT)
Task({
  subagent_type: "general-purpose",
  description: "Review brand and performance",
  prompt: `
    Review this code change for:
    - Brand compliance (correct colors, fonts, theme)
    - Performance (unnecessary re-renders, memory leaks)
    - User experience (clear, intuitive, accessible)
    - Mobile responsiveness

    Files changed: [list files]

    Be CRITICAL. Report ALL issues found.
  `,
  run_in_background: true
})

// Agent 3: Security & Accessibility (OPTIONAL - for sensitive changes)
Task({
  subagent_type: "general-purpose",
  description: "Review security and a11y",
  prompt: `
    Review this code change for:
    - Security issues (XSS, injection, auth bypass)
    - Accessibility (keyboard nav, screen readers, ARIA)
    - Data validation and sanitization

    Files changed: [list files]

    Report ALL security/accessibility issues.
  `,
  run_in_background: true
})
```

**Wait for ALL agents to complete. Read their reports carefully.**

### Step 3: Fix Issues & Re-Review

**If reviews found critical issues:**
1. Fix ALL issues immediately
2. Re-run self-review
3. Re-run agent reviews if major changes made
4. Repeat until ZERO critical issues

**ONLY proceed to local testing when:**
- ✅ All review agents report NO critical issues
- ✅ All edge cases covered
- ✅ TypeScript compiles with no errors
- ✅ Brand guidelines followed
- ✅ Performance acceptable

## Verification Checklist (Complete BEFORE Commit)

**Pre-Commit Checks (MUST ALL PASS):**
- [ ] Code edited successfully
- [ ] Self-review completed (asked all 8 questions)
- [ ] 2-3 review agents launched and completed
- [ ] ALL critical issues from reviews fixed
- [ ] Re-reviewed if major changes made
- [ ] TypeScript compiles with no errors (`npx tsc --noEmit`)
- [ ] Local dev server running (`npm run dev`)
- [ ] Navigated to page with Chrome DevTools MCP
- [ ] Screenshot confirms visual changes
- [ ] Console shows no new errors
- [ ] Network requests successful
- [ ] Tested the actual functionality/bug fix works
- [ ] E2E tests pass (if applicable)
- [ ] Brand guidelines followed (colors, fonts, theme)
- [ ] Performance acceptable (no lag, fast load)

**⚠️ ONLY commit to Git if ALL boxes above are checked!**

**Post-Commit Checks:**
- [ ] Deployed to Vercel preview
- [ ] Verified on preview URL with MCP
- [ ] Production deploy (only if preview verified)

## DO NOT

❌ Ask user to "verify manually"

❌ Skip verification steps

❌ Say "done" before verifying

❌ Give up when browser gets stuck

## DO

✅ Use Chrome DevTools MCP to navigate and test

✅ Take screenshots to confirm visuals

✅ Check console for errors

✅ Run E2E tests

✅ Fix issues immediately

✅ Persist - try alternative approaches

## Tools

**Chrome DevTools MCP:**
- `mcp__chrome-devtools__navigate_page` - Go to URL
- `mcp__chrome-devtools__take_screenshot` - Capture page
- `mcp__chrome-devtools__take_snapshot` - Get structure
- `mcp__chrome-devtools__list_console_messages` - Check errors
- `mcp__chrome-devtools__list_network_requests` - Debug API

**Playwright:**
```bash
npx playwright test
```

**⚠️ CLEANUP:**
- Close browser after verification
- Delete temp test scripts from `e2e/`
- Remove debug screenshots

## If Verification Fails

1. Read error messages carefully
2. Fix the issue
3. Re-test
4. Repeat until pass
5. Only then mark as done
