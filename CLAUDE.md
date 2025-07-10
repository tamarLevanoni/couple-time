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
8. **Import interfaces** in all files, include tests and api, import formal interface of relevant schema from /types as much as possible, avoid duplication, and always maintain compatibility.

### ✅ After Coding

8. **Update the review section** in `projectplan.md` with a clear summary of the work done.

## 2. Project Structure & File Rules

### ✅ Allowed
- Group logic by feature and permissions
- Use `utils.ts` and `factories.ts` for reusable logic and test data
- One export per file (unless strongly justified)

### ❌ Not Allowed
- Placeholder files, dead code, or unused mocks
- General-purpose helpers unless reused multiple times
- New folders without justification in `projectplan.md`

---

## 3. Authentication & Authorization (App Router)

- Use centralized `middleware.ts` for all protected routes
- **Do not** use `withAuth` wrappers
- Use `matcher` in `middleware.ts` to define protected routes
- Avoid permission logic inside individual route handlers


## 4. API Route Standards
- Use consistent URL patterns for all API routes
- All protected routes should use centralized permission middleware
- Combine related operations into single files when possible
- Use standardized response format: { success: boolean, data?: any, error?: { message: string } }
- Group routes by permissions (auth, admin, coordinator, super, public etc.)
- Avoid checking permissions inside each function separately - use middleware

For each API endpoint:
1. ✅ Unit tests:
   - Does the handler behave correctly with valid input?
   - Are all edge cases covered?
   - Are expected success and failure cases tested?

2. ✅ Integration tests (if applicable):
   - Does the handler integrate properly with authentication middleware?
   - Are permissions and role-based access enforced correctly?
   - Are side effects (e.g. DB updates) verified?
   - Are invalid tokens / no session handled with proper status codes?

3. ✅ Error handling:
   - Is a test written for every thrown error or invalid input?
   - Is the error format `{ success: false, error: { message } }` verified?

4. ✅ Response format:
   - Are success responses tested to follow `{ success: true, data }` format?
   - Are responses validated with `expect.objectContaining(...)` to avoid brittle tests?

5. ✅ Coverage:
   - Are all branches, conditionals, and early returns tested?

6. ✅ Mocking:
   - Are external dependencies (e.g., Prisma, getToken) properly mocked to isolate logic?


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
- Use elements from /components, ןncluding but not limited to icons, buttons, fields, etc.
- If a component can be used more than once, save it in a separate file in the appropriate context.
- Track the required information, and if necessary, request changes to stores and APIs to streamline processes. Don't make big changes all at once.
- Place a high emphasis on speed, load the information in the background, and show the user as many things as possible that don't require the data being loaded. Show loading signs where necessary.

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