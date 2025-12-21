# BugFixingSkill.md

## CRITICAL: Review BEFORE Commit/Deploy

**THE PROBLEM:** Claude often commits to Git and deploys to Vercel, THEN discovers the bug isn't fixed, requiring multiple redeploys.

**THE SOLUTION:** 2-3 rounds of in-depth code review BEFORE any commit or deploy.

---

## Bug Fixing Workflow (STRICT ORDER)

```
1. Identify Bug
   ↓
2. Analyze Root Cause (don't guess!)
   ↓
3. Write Fix
   ↓
4. ⚠️ MANDATORY: Multi-Round Code Review (2-3 iterations)
   ├─ Round 1: Self-review - Check your own fix for:
   │  • Does it actually address root cause?
   │  • Any edge cases missed?
   │  • TypeScript errors?
   │  • Logic errors?
   ├─ Round 2: review-expert1 (parallel background agent)
   │  • Bugs, functionality, edge cases
   │  • Does fix solve the original problem?
   ├─ Round 3: review-expert2 (parallel background agent)
   │  • Brand compliance, performance, UX
   │  • Security, accessibility, TypeScript
   ↓
5. Fix Issues Found in Reviews (iterate until ALL pass)
   ↓
6. Local Testing with MCP (BEFORE commit!)
   ├─ Chrome DevTools: Navigate to page
   ├─ Take screenshot
   ├─ Check console for errors
   ├─ Test the specific bug scenario
   └─ Verify fix actually works
   ↓
7. ONLY IF ALL PASS: Commit to Git
   ↓
8. Deploy to Vercel Preview
   ↓
9. Verify Live on Preview URL
   ↓
10. ONLY IF VERIFIED: Deploy to Production
```

---

## ⚠️ NEVER Skip Steps

**DO NOT:**
- ❌ Commit before reviewing
- ❌ Deploy before local testing
- ❌ Assume fix works without verification
- ❌ Skip multi-round reviews
- ❌ Rush to deployment

**ALWAYS:**
- ✅ Review code 2-3 times before commit
- ✅ Test locally with MCP tools first
- ✅ Fix all issues found in reviews
- ✅ Verify on preview before production
- ✅ Document what was fixed and how

---

## Multi-Round Code Review (DETAILED)

### Round 1: Self-Review (You)

Before launching review agents, check your own fix:

**Questions to ask yourself:**
1. Does this fix the **root cause** or just symptoms?
2. Did I test edge cases? (null, undefined, empty arrays, etc.)
3. Are there TypeScript errors?
4. Does this break anything else?
5. Is the logic correct?
6. Did I follow brand guidelines?
7. Is performance acceptable?
8. Are error messages user-friendly?

**If ANY answer is "no" or "unsure" → Fix it now before reviews**

### Round 2: Launch Review Agents (Parallel)

Launch 2 background review agents:

```typescript
// Agent 1: Functionality & Bugs
Task({
  subagent_type: "general-purpose",
  description: "Review fix for bugs/edge cases",
  prompt: `
    Review this bug fix for:
    - Does it solve the original problem?
    - Edge cases (null, undefined, empty data)
    - TypeScript type safety
    - Logic errors
    - Potential new bugs introduced

    Original bug: [describe bug]
    Fix applied: [describe fix]
    Files changed: [list files]

    Report ALL issues found. Be thorough.
  `,
  run_in_background: true
})

// Agent 2: Brand, Performance, Security
Task({
  subagent_type: "general-purpose",
  description: "Review fix for brand/perf/security",
  prompt: `
    Review this bug fix for:
    - Brand compliance (colors, fonts, theme)
    - Performance (unnecessary re-renders, memory leaks)
    - Security (XSS, injection, auth bypass)
    - Accessibility (a11y, keyboard nav)
    - User experience

    Files changed: [list files]

    Report ALL issues found. Be critical.
  `,
  run_in_background: true
})
```

**Wait for both agents to complete.**

### Round 3: Fix Issues & Re-Review if Needed

**If reviews found issues:**
1. Fix ALL issues
2. Re-run reviews (another round)
3. Repeat until ZERO critical issues

**Only proceed when:**
- ✅ Both review agents report NO critical issues
- ✅ All edge cases covered
- ✅ TypeScript compiles with no errors
- ✅ Logic is sound
- ✅ Brand guidelines followed

---

## Local Testing (BEFORE Commit)

**Use MCP tools to test the fix:**

```typescript
// 1. Navigate to the page with the bug
mcp__chrome-devtools__navigate_page({ url: "http://localhost:8080/[page]" })

// 2. Take screenshot BEFORE testing the fix
mcp__chrome-devtools__take_screenshot()

// 3. Reproduce the original bug scenario
// Example: Click button, fill form, trigger edge case

// 4. Verify fix works
// Example: Check that error is gone, feature works

// 5. Check console for errors
mcp__chrome-devtools__list_console_messages()

// 6. Check network requests
mcp__chrome-devtools__list_network_requests()

// 7. Take screenshot AFTER - confirm fix
mcp__chrome-devtools__take_screenshot()
```

**If bug still exists → Go back to step 3 (Write Fix) and iterate**

**DO NOT commit until local testing confirms fix works!**

---

## Example: Good vs Bad Bug Fix Flow

### ❌ BAD (Current Problem)

```
1. See bug
2. Quickly write fix
3. Commit to Git ← TOO EARLY!
4. Deploy to Vercel ← TOO EARLY!
5. Check live site
6. Bug still exists! ← WASTE OF TIME
7. Write another fix
8. Commit again
9. Deploy again
10. Check again
11. Bug STILL exists!
12. Third attempt...
```

**Result:** 3+ deploy cycles, wasted time, frustration

### ✅ GOOD (New Workflow)

```
1. See bug
2. Analyze root cause carefully
3. Write fix
4. Self-review (Round 1)
5. Launch 2 review agents (Round 2)
6. Fix issues found in reviews
7. Re-review if needed (Round 3)
8. ALL reviews pass ← VERIFIED!
9. Local test with MCP
10. Fix works locally ← VERIFIED!
11. ONLY NOW: Commit to Git
12. Deploy to preview
13. Verify on preview ← VERIFIED!
14. Deploy to production
```

**Result:** 1 deploy cycle, bug fixed first time, efficient

---

## Common Bug Types & Review Focus

### UI Bugs
**Focus on:**
- Does visual match design?
- All screen sizes (mobile, tablet, desktop)?
- Dark mode + light mode (public vs admin)?
- Brand colors correct?
- Hover/focus states work?

### Logic Bugs
**Focus on:**
- Edge cases tested?
- Null/undefined handled?
- Empty arrays/objects handled?
- Async race conditions?
- State management correct?

### Data Bugs
**Focus on:**
- TypeScript types match actual data?
- API responses handled correctly?
- Error states shown to user?
- Loading states work?
- Supabase queries correct?

### Performance Bugs
**Focus on:**
- Unnecessary re-renders?
- Memory leaks?
- Large bundle size?
- Slow queries?
- Infinite loops?

---

## Review Checklist (Use for Every Bug Fix)

**Before Commit:**
- [ ] Self-review completed (Round 1)
- [ ] 2 review agents completed (Round 2)
- [ ] All critical issues fixed
- [ ] Re-review if needed (Round 3)
- [ ] Local MCP testing passed
- [ ] Bug actually fixed (tested the scenario)
- [ ] No new bugs introduced
- [ ] TypeScript compiles with no errors
- [ ] Console shows no new errors
- [ ] Brand guidelines followed
- [ ] Performance acceptable

**Only commit if ALL boxes checked!**

---

## If Bug Persists After Reviews

**If local testing shows bug still exists:**

1. **Stop and think:** What did I miss?
2. **Re-analyze root cause:** Was my diagnosis wrong?
3. **Read error messages carefully:** What do they actually say?
4. **Check network tab:** Is API failing?
5. **Check React DevTools:** Is state correct?
6. **Add console.logs:** Where does logic fail?
7. **Ask review agents:** "Why would this fix not work?"
8. **Try different approach:** Maybe solution is wrong

**DO NOT commit until bug is actually fixed!**

---

## Performance Tracking

Track bug fix efficiency:

```
Bug Fix Started: [timestamp]
Reviews Completed: [timestamp]
Local Testing Passed: [timestamp]
Committed to Git: [timestamp]
Deployed to Production: [timestamp]
Total Time: [duration]
Deploy Cycles: 1 (target - first time fix!)
```

**Goal:** Fix bug in ONE deploy cycle, not 2-3.

---

## Integration with TodoWrite

```typescript
TodoWrite({ todos: [
  { content: "Identify bug root cause", status: "completed", activeForm: "Identifying bug" },
  { content: "Write fix", status: "completed", activeForm: "Writing fix" },
  { content: "Multi-round code review (2-3 iterations)", status: "in_progress", activeForm: "Reviewing code" },
  { content: "Fix issues from reviews", status: "pending", activeForm: "Fixing review issues" },
  { content: "Local MCP testing", status: "pending", activeForm: "Testing locally" },
  { content: "Commit & deploy only if verified", status: "pending", activeForm: "Deploying" }
]})
```

Update after each step.

---

## Summary: The Golden Rule

**🚫 NEVER COMMIT OR DEPLOY BEFORE:**
1. Self-review (Round 1)
2. Multi-agent review (Round 2-3)
3. Fixing all review issues
4. Local MCP testing
5. Confirming bug is actually fixed

**This saves time, reduces deploy cycles, and fixes bugs right the first time.**
