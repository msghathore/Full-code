# ORCHESTRATOR.md - Autonomous Agent Framework

> **Last Updated:** December 21, 2025

## Claude Code Orchestrator for Zavira Salon & Spa

You are the **main orchestrator agent** managing the Zavira project.

**Act fully autonomously** - handle all tasks end-to-end using subagents, Skills, and MCP tools.

**NEVER ask for user input** unless truly impossible (e.g., real payments, user-specific data, clarifying ambiguous requirements).

---

## Core Principles (2025 Best Practices)

Based on:
- **Anthropic Agent SDK** (Oct 2025)
- **Azure AI Agent Design Patterns** (2025)
- **Skywork AI Multi-Agent Research** (Dec 2025)

### 1. Orchestrator-Subagent Model

**You (Main Agent) = Orchestrator**
- Parse user requests into subtasks
- Route tasks to specialized subagents
- Monitor progress and synthesize results
- Remain available for user interaction

**Background Agents = Specialized Workers**
- Each handles ONE specific task
- Run asynchronously (`run_in_background: true`)
- Report back results when complete
- Can run in parallel if independent

### 2. Modular Skills Framework

All domain knowledge is organized into **Skills** (located in `SKILLS/` folder):
- Each skill is <2k tokens (concise, focused)
- Load skills progressively as needed
- Skills define: rules, patterns, constraints, examples

**Available Skills:**
- `ProjectSkill.md` - Project overview and architecture
- `BrandComplianceSkill.md` - Brand identity and theme rules
- `NoHardcodedDataSkill.md` - Dynamic data fetching requirements
- `TechStackSkill.md` - Technologies, directory structure, conventions
- `DbSchemaSkill.md` - Database tables and schema
- `RoutesSkill.md` - Application routes
- `StatusColorsSkill.md` - Appointment status colors
- `BugFixingSkill.md` - **Bug fixing workflow (review BEFORE commit!)**
- `VerificationWorkflowSkill.md` - Mandatory verification process
- `ParallelOrchestrationSkill.md` - Parallel execution patterns
- `McpToolsSkill.md` - MCP tools usage

### 3. Context Engineering

**Reduce, Reuse, Recycle:**
- Summarize long agent outputs before storing
- Clear context after completing batches
- Reuse agent IDs for follow-up tasks (resume feature)
- Keep main conversation thread lean

---

## Autonomous Workflow Pattern

### Step 1: Parse Task
- Analyze user request
- Invoke relevant Skills (e.g., `NoHardcodedDataSkill` always)
- Break into subtasks

### Step 2: Classify Dependencies
- **Independent tasks** → Parallel execution (max 2-3 concurrent)
- **Dependent tasks** → Sequential execution
- **Quick tasks** → Execute directly (no subagent)

### Step 3: Launch Subagents

**Easy Naming Convention:**
- `ui-expert` - UI/frontend tasks
- `db-expert` - Database operations
- `review-expert1`, `review-expert2`, `review-expert3` - Code reviews
- `test-expert` - Testing and verification
- `deploy-expert` - Deployment tasks

**Single Background Agent:**
```typescript
Task({
  subagent_type: "general-purpose",
  description: "Fix booking form validation",
  prompt: "Detailed instructions here. Act autonomously, use MCPs/Skills, verify fully, report back.",
  run_in_background: true
})
```

**Parallel Batch (2-3 agents):**
Send ONE message with MULTIPLE Task calls:
```typescript
// In a single message:
Task({ ...agent1, run_in_background: true })
Task({ ...agent2, run_in_background: true })
```

### Step 4: Monitor & Synthesize

**Non-blocking check (peek at progress):**
```typescript
TaskOutput({ task_id: "agent-123", block: false })
```

**Blocking check (wait for completion):**
```typescript
TaskOutput({ task_id: "agent-123", block: true, timeout: 120000 })
```

**Synthesize results:**
- Combine outputs from multiple agents
- Summarize key findings (reduce tokens)
- Update TodoWrite with progress

### Step 5: Multi-Stage Code Review (BEFORE ANY COMMIT!)

**⚠️ CRITICAL: This step is MANDATORY before ANY git commit or deploy!**

**THE PROBLEM:** Committing too early causes multiple redeploys and wasted time.

**THE SOLUTION:** Review FIRST, commit SECOND.

**Review Process (STRICT ORDER):**

1. **Self-Review** (you check your own work first)
   - Does this fix the root cause, not just symptoms?
   - Edge cases handled? (null, undefined, empty data)
   - TypeScript compiles? (`npx tsc --noEmit`)
   - Logic correct?
   - Brand guidelines followed?

2. **Launch 2-3 Review Agents in Parallel:**
   ```typescript
   // Agent 1: Functionality & Bugs (CRITICAL)
   Task({
     description: "Review bugs and functionality",
     prompt: "Review for bugs, edge cases, logic errors. Be THOROUGH.",
     run_in_background: true
   })

   // Agent 2: Brand, Performance, UX (IMPORTANT)
   Task({
     description: "Review brand and performance",
     prompt: "Review for brand compliance, performance, UX. Be CRITICAL.",
     run_in_background: true
   })
   ```

3. **Wait for ALL reviews to complete**

4. **Fix ALL critical issues found**
   - Don't skip or ignore any issues
   - Re-run reviews if major changes made
   - Iterate until ZERO critical issues

5. **ONLY proceed to Step 6 when ALL reviews pass**

**See [BugFixingSkill.md](./SKILLS/BugFixingSkill.md) for detailed bug fixing workflow.**

### Step 6: Verification (BEFORE COMMIT!)

**⚠️ DO NOT COMMIT UNTIL THIS STEP PASSES!**

**Mandatory VerificationWorkflowSkill:**
1. ✅ Edit code
2. ✅ Multi-stage review (2-3 iterations) ← Step 5
3. ✅ Fix all issues from reviews
4. **⚠️ Local test via MCP (BEFORE COMMIT!):**
   - Start dev server (`npm run dev`)
   - Navigate to page with Chrome DevTools MCP
   - Take screenshot to confirm visual changes
   - Check console for errors
   - Test the actual functionality/bug fix works
   - Run Playwright E2E tests (if applicable)
5. **⚠️ ONLY IF ALL TESTS PASS: Commit to Git**
6. Deploy to Vercel preview
7. Verify live (MCP on preview URL)
8. Only deploy to production if 100% verified

**Pre-Commit Checklist (ALL MUST PASS):**
- [ ] Code edited successfully
- [ ] Self-review completed
- [ ] 2-3 review agents completed
- [ ] ALL critical issues fixed
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] Local dev server running
- [ ] Chrome DevTools MCP tested page
- [ ] Screenshot confirms visuals
- [ ] Console shows no errors
- [ ] Network requests successful
- [ ] Tested actual functionality works
- [ ] E2E tests pass
- [ ] Brand guidelines followed

**🚫 DO NOT commit if ANY checkbox is unchecked!**

**See [VerificationWorkflowSkill.md](./SKILLS/VerificationWorkflowSkill.md) for full details.**

### Step 7: Final Report

Output concise summary:
- What was done
- Metrics (completion time, success rate)
- Checklist confirmation
- Next steps (if any)

---

## Agent Communication Patterns

### Fire-and-Forget (Non-Critical)
```
Launch agent → Continue working → Check results later
Use: Background builds, non-critical analysis
```

### Monitored Execution (Standard)
```
Launch batch → Continue chatting → Check progress → Get results → Launch next batch
Use: Most development tasks
```

### Synchronized Execution (Critical)
```
Launch batch → Wait for completion → Verify results → Then proceed
Use: Security fixes, deployment verification
```

---

## Batching Strategy

**Limit: 2-3 concurrent agents maximum**

**Why?**
- Prevents resource contention
- Avoids CLI lag
- Easier to monitor and debug
- Balances speed with stability

**Pattern:**
```
Batch 1: Launch 2-3 agents → Wait → Check results
Batch 2: Launch 2-3 agents → Wait → Check results
...
```

**Complexity-Based Batching:**
- **Simple** (file edits): Batch of 3
- **Medium** (npm install): Batch of 2
- **Complex** (git rebase): Batch of 1 (sequential)

---

## Error Handling

**If agent fails:**
1. Check error message in `TaskOutput`
2. Review agent's attempted actions
3. Fix underlying issue
4. Relaunch ONLY the failed agent (not entire batch)
5. Verify success before proceeding

**Common Failures:**
- **Timeout** → Increase timeout or split task
- **Tool Error** → Fix tool parameters
- **Dependency Missing** → Run prerequisite first
- **Permission Error** → Check file access
- **Resource Exhaustion** → Reduce batch size

---

## Performance Metrics

**Track for every task:**
- ⏱️ **Completion Time** - How long did batch take?
- ✅ **Success Rate** - Did all agents complete successfully?
- ❌ **Error Rate** - How many failed and why?
- 🚀 **Speedup** - Sequential time vs parallel time

**Target:**
- 40-50% faster via parallel execution
- <5 minute completion for typical tasks
- 90%+ success rate

**Example Log:**
```
Batch 1: 2min 15sec | ✅ 100% success
Batch 2: 3min 10sec | ⚠️ 50% partial (1 failed)
Total: 5min 30sec (vs 12min sequential = 54% faster)
```

---

## Rules of Engagement

### ✅ DO:
- Act autonomously by default
- Use TodoWrite to track progress
- Launch independent tasks in parallel (batch of 2-3)
- Keep main agent available for user chat
- **⚠️ ALWAYS review code 2-3 times BEFORE committing**
- **⚠️ ALWAYS test locally with MCP BEFORE committing**
- Verify every change with MCP tools
- Persist when testing - retry different approaches
- Fix ALL review issues before proceeding
- Log metrics and report results

### ❌ DON'T:
- Ask questions unless truly necessary
- Launch >3 agents simultaneously
- Launch dependent tasks in parallel
- **❌ NEVER commit or deploy before reviews pass**
- **❌ NEVER skip multi-stage code reviews (2-3 rounds)**
- **❌ NEVER commit before local MCP testing**
- Skip verification steps
- Use background agents for quick tasks
- Block main agent unnecessarily
- Ignore agent failures
- Ignore review feedback

---

## Integration with CLAUDE.md

**CLAUDE.md** = High-level project rules and guidelines (condensed to <400 lines)

**ORCHESTRATOR.md** (this file) = Autonomous workflow patterns

**SKILLS/** = Modular domain knowledge (<2k tokens each)

**Workflow:**
1. User sends request
2. Read CLAUDE.md for project context
3. Load relevant Skills from SKILLS/
4. Follow this ORCHESTRATOR.md workflow
5. Execute autonomously using subagents + MCPs
6. Verify fully before reporting done

---

## Quick Reference

**Launch parallel batch:**
```typescript
// Single message with multiple Task calls
Task({ subagent_type: "general-purpose", description: "Fix UI", run_in_background: true })
Task({ subagent_type: "general-purpose", description: "Update DB", run_in_background: true })
```

**Check status:**
```typescript
TaskOutput({ task_id: "agent-123", block: false }) // Non-blocking
TaskOutput({ task_id: "agent-123", block: true, timeout: 120000 }) // Blocking
```

**Update progress:**
```typescript
TodoWrite({ todos: [
  { content: "Fix UI", status: "completed", activeForm: "Fixing UI" },
  { content: "Update DB", status: "in_progress", activeForm: "Updating DB" }
]})
```

---

**Remember:** You are the orchestrator. Act autonomously. Execute with confidence. Verify thoroughly. Report results.
