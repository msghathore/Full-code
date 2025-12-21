# ParallelOrchestrationSkill.md

## Parallel Execution Strategy

**Performance Gain:** 40-50% faster than sequential

**Max Concurrent:** 2-3 agents (prevents lag)

## When to Use Parallel

### ✅ Independent Tasks
- Multiple file searches
- Security fixes in separate files
- API calls to different services
- Database migration + npm install
- Code linting + running tests
- Generating multiple reports

### ❌ Dependent Tasks
- Edit file → Build → Test → Deploy
- Create database → Migrations → Seed
- Install package → Import → Use
- Fix code → Run tests → Verify

## Batching Pattern

```
Batch 1: Launch 2-3 agents → Wait → Check results
Batch 2: Launch 2-3 agents → Wait → Check results
Batch 3: Launch 2-3 agents → Wait → Check results
```

**NOT:** Launch all 6 at once (causes lag/crashes)

## Complexity-Based Batching

- **Simple** (file edits): Batch of 3
- **Medium** (npm install): Batch of 2
- **Complex** (git rebase): Batch of 1 (sequential)

## Agent Naming

Easy names for debugging:
- `ui-expert` - UI/frontend tasks
- `db-expert` - Database operations
- `review-expert1`, `review-expert2`, `review-expert3` - Code reviews
- `test-expert` - Testing and verification
- `deploy-expert` - Deployment tasks

## Launch Pattern

**Single message with multiple Tasks:**
```typescript
// In ONE message:
Task({
  subagent_type: "general-purpose",
  description: "Fix booking UI",
  prompt: "Detailed instructions. Act autonomously.",
  run_in_background: true
})
Task({
  subagent_type: "general-purpose",
  description: "Update database schema",
  prompt: "Detailed instructions. Act autonomously.",
  run_in_background: true
})
```

## Monitoring

**Non-blocking (peek):**
```typescript
TaskOutput({ task_id: "agent-123", block: false })
```

**Blocking (wait):**
```typescript
TaskOutput({ task_id: "agent-123", block: true, timeout: 120000 })
```

## Communication Patterns

### 1. Fire-and-Forget
```
Launch → Continue working → Check later
Use: Non-critical background tasks
```

### 2. Monitored (Standard)
```
Launch batch → Chat → Check progress → Get results → Next batch
Use: Most development tasks
```

### 3. Synchronized (Critical)
```
Launch batch → Wait → Verify → Then proceed
Use: Security fixes, deployments
```

## Error Handling

**If agent fails:**
1. Check `TaskOutput` error message
2. Review attempted actions
3. Fix underlying issue
4. Relaunch ONLY failed agent
5. Verify before proceeding

**Common failures:**
- Timeout → Increase timeout or split
- Tool error → Fix parameters
- Dependency missing → Run prereq
- Permission error → Check access
- Resource exhaustion → Reduce batch

## Performance Metrics

Track for every batch:
- ⏱️ Completion time
- ✅ Success rate
- ❌ Error rate
- 🚀 Speedup vs sequential

**Target:** 40-50% faster, <5min tasks, 90%+ success

## TodoWrite Integration

```typescript
TodoWrite({ todos: [
  { content: "Batch 1: Fix UI + Update DB", status: "in_progress", activeForm: "Running Batch 1" },
  { content: "Batch 2: Run tests + Deploy", status: "pending", activeForm: "Running Batch 2" }
]})
```

Update after each batch completes.
