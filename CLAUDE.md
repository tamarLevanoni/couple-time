## 1. Standard Workflow

### ✅ Before You Code

1. **Understand the problem.** Read the relevant codebase and understand the goal.
2. **Write a plan** in `projectplan.md` that outlines the changes you intend to make.
3. **Include a TODO checklist** so that each task can be marked as complete.

### 🛑 Before You Start Coding

4. **Submit the plan for approval.** Do not begin work before I approve it.

### 🧩 While Coding

5. **Mark TODOs as complete** as you implement each part.
6. **Explain every step.** For each change, give a high-level summary of what you did and why.
7. **Keep it simple.** Each code/task change must be:
   - Minimal and focused
   - Intuitive and easy to debug
   - Avoid large or complex refactors

### ✅ After Coding

8. **Update the review section** in `projectplan.md` with a clear summary of the work done.


## API Route Standards
- Use consistent URL patterns for all API routes
- All protected routes should use centralized permission middleware
- Combine related operations into single files when possible
- Use standardized response format: { success: boolean, data?: any, error?: { message: string } }
- Group routes by permissions (auth, admin, coordinator, super, public etc.)
- Avoid checking permissions inside each function separately - use middleware


### ❌ Not Allowed
- Placeholder files, dead code, or unused mocks
- General-purpose helpers unless reused multiple times
- New folders without justification in `projectplan.md`

---

## 5. Testing Standards

- Use **`vitest` only** for all unit/integration tests
- Shared utilities → `src/test/utils.ts`
- Test factories → `src/test/factories.ts`

### 📁 Test File Naming
- Use `*.test.ts` suffix
- Place close to the tested logic when practical

## 6. UI & Data Handling

---

- No data fetching inside UI components unless absolutely necessary
- Each feature/screen must be designed before coding
- Avoid generic or over-abstracted components unless reused

---

## 7. DX & Maintainability

- Keep code readable without extra context
- Don’t abstract core logic away into hidden files
- Log clearly – especially around auth or data failures
- Only optimize when needed

---

## 8. Cleanup Policy

- Regularly remove unused code, mocks, or placeholder files
- Don’t leave commented-out code in the repo
- All files must have a clear reason to exist, or be deleted

---

## Claude Agent Summary

- ✅ Plan before coding  
- ✅ Keep things minimal and clean  
- ❌ No unnecessary files  
- ✅ Explain every step  
- ✅ Delete what’s not needed