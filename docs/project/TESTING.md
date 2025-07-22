## Testing Standards & Guidelines

### 📋 Test File Structure

**File Organization:**
```
/src/test/
├── utils.ts           # Shared utilities for all tests
├── test-helpers.ts    # Mock data factories and test scenarios
├── admin-endpoints.test.ts      # Admin API endpoint tests
├── user-rentals.test.ts        # User rental API tests
└── [feature]-endpoints.test.ts  # Feature-specific endpoint tests
```

**File Naming Convention:**
- Use `*.test.ts` suffix for all test files
- Group tests by feature/API route group (e.g., `admin-endpoints.test.ts`)
- Place test files in `/src/test/` directory for consistency

### 🔧 Test File Template

**Required Imports:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyApiResponseStructure, parseJsonResponse } from './utils';
import { Role, [OtherEnums] } from '@/types/schema';
```

**Utils.ts Usage:**
```typescript
import {
  createMockRequest,
  createMockApiResponse,
  createMockPrisma,
  parseJsonResponse,
  verifyApiResponseStructure
} from './utils';
```

**Mock Setup Pattern:**
```typescript
vi.mock('@/lib/db', () => ({ prisma: createMockPrisma() }));

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

vi.mock('@/lib/api-response', () => ({
  apiResponse: createMockApiResponse(),
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));
```

### 📝 Test Case Structure

**Test Organization:**
```typescript
describe('Feature/Route Group Name', () => {
  const mockUser = { id: 'test-id', name: 'Test User', ... };
  const mockAdmin = { id: 'admin-id', roles: [Role.ADMIN], ... };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/endpoint', () => {
    it('should handle success case', async () => {
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken, true).mockResolvedValue(mockUser);

      const { prisma } = await import('@/lib/db');
      vi.mocked(prisma.user.findMany, true).mockResolvedValue([mockData]);

      const request = new NextRequest('http://localhost/api/endpoint');
      const response = await handlerFunction(request);

      expect(response.status).toBe(200);
      const data = await parseJsonResponse(response);
      verifyApiResponseStructure(data);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(expectedData);
    });

    it('should return 401 when not authenticated', async () => {
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken, true).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/endpoint');
      const response = await handlerFunction(request);

      expect(response.status).toBe(401);
      const data = await parseJsonResponse(response);
      verifyApiResponseStructure(data);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Authentication required');
    });
  });
});
```

### ✅ Required Test Cases

**For Every API Endpoint:**

1. **Success Case Testing:**
   - Valid input with expected success response
   - Response format follows `{ success: true, data }` structure
   - Database queries called with correct parameters

2. **Authentication Testing:**
   - 401 when not authenticated (`getToken` returns null)
   - 403 when insufficient permissions (wrong role)
   - Proper role-based access control verification

3. **Validation Testing:**
   - 400 for invalid request data (missing required fields)
   - 400 for malformed JSON
   - Request body validation with Zod schemas

4. **Error Handling:**
   - 500 for database errors (mock Prisma method to reject)
   - 404 for resource not found
   - Graceful error responses with proper error format

5. **Business Logic Testing:**
   - Edge cases specific to the endpoint
   - Constraint validation (e.g., duplicate email prevention)
   - Status transition validation (e.g., rental status updates)

### 🎯 Testing Best Practices

**Mocking:**
- Prefer using `createMockPrisma()` from utils.ts
- Do not re-mock the same dependency twice
- Use `vi.mocked(fn, true)` for proper typing
- Avoid using `as any` unless absolutely necessary

**Response Verification:**
- Always use `verifyApiResponseStructure()` from utils
- Use `parseJsonResponse()` for consistent JSON parsing
- Check both status code and response body structure
- Use `expect.objectContaining()` for flexible assertions

**Mock Data:**
- Define mock data at describe block level for reusability
- Use consistent mock IDs with `cltest_` prefix
- Include all required fields for proper type checking
- Use realistic data that matches actual API responses

**Mock Data Usage Pattern:**

**Two Approaches Available:**

1. **Fixed Mock Data (`test-helpers.ts`)** - For integration tests with predictable IDs:
```typescript
import { mockData } from './test-helpers';
mockData.user({ id: 'u1', name: 'Test', roles: [Role.ADMIN] })
mockData.center({ area: Area.NORTH })
```

2. **Factory Functions (`factories.ts`)** - For unit tests with random IDs:
```typescript
import { createMockUser, createMockCenter } from './factories';
createMockUser({ name: 'Test', roles: [Role.ADMIN] })
createMockCenter({ area: Area.NORTH })
```

**When to Use Which:**
- **`test-helpers.ts`** - API integration tests, when you need consistent IDs across test cases
- **`factories.ts`** - Unit tests, when you need isolated objects with unique IDs

**Rules:**
- Do **not** pass multiple arguments. Only pass a single object with the fields to override
- Always use proper enum values (`Role.ADMIN`, `Area.NORTH`, etc.)

✅ **Good:**
```typescript
mockData.user({ name: 'Test', roles: [Role.ADMIN] })
createMockGame({ categories: [GameCategory.THERAPY] })
```

❌ **Bad:**
```typescript
mockData.user('u1', 'Test', ['ADMIN'])  // Multiple arguments - WRONG
createMockGame('name', 'THERAPY')       // Multiple arguments - WRONG
```

**Database Mocking:**
- Mock Prisma methods to return expected data structures
- Verify database queries with `expect().toHaveBeenCalledWith()`
- Mock both successful and error scenarios
- Use proper TypeScript typing with `as any` where needed
- Note: `createMockPrisma()` already includes default mocked methods for `user`, `center`, `rental`, `game`, `gameInstance`

**Middleware Testing:**
```typescript
import middleware from '@/middleware';
import { NextRequest } from 'next/server';

it('redirects unauthenticated user', async () => {
  const req = new NextRequest('http://localhost/api/protected');
  const res = await middleware(req);
  expect(res.status).toBe(302);
});
```

### 🚫 Common Pitfalls to Avoid

- Do not re-declare `vi.mock()` for the same path
- Do not skip authentication / permission checks
- Avoid `as any` unless strictly necessary – prefer proper types or `Partial<Type>` when possible
- Do not hardcode raw JSON – use `parseJsonResponse()` and shared mock objects

### 🗂 Folder Structure for Scaling

```
/src/test/
├── mocks/     # reusable mocks like prisma.ts, auth.ts
├── logic/     # unit tests for pure functions
└── endpoints/ # API endpoint tests
```

### 📊 Test Coverage Requirements

**Minimum Coverage:**
- All API endpoints must have success/failure tests
- Authentication/authorization tests for protected routes
- Validation tests for request body parsing
- Error handling tests for database failures
- Business logic tests for complex operations

**Test File Example Structure:**
```typescript
describe('Admin Users API', () => {
  describe('GET /api/admin/users', () => {
    it('should return paginated users for admin', async () => {\n      // Test implementation\n    });
    it('should handle role filter', async () => {\n      // Test implementation\n    });
    it('should return 401 when not authenticated', async () => {\n      // Test implementation\n    });
    it('should return 403 for non-admin users', async () => {\n      // Test implementation\n    });
  });
  
  describe('POST /api/admin/users', () => {
    it('should create new user successfully', async () => {\n      // Test implementation\n    });
    it('should reject duplicate email', async () => {\n      // Test implementation\n    });
    it('should handle validation errors', async () => {\n      // Test implementation\n    });
  });
  
  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {\n      // Test implementation\n    });
  });
});
```

### 🔍 Mock Setup Troubleshooting

**Common Issues and Solutions:**

1. **`mockResolvedValue` TypeScript Error:**
   - **Problem**: Property 'mockResolvedValue' does not exist on type
   - **Solution**: TypeScript errors like `mockResolvedValue` missing typically happen when `vi.mocked(fn)` is not typed properly – recommend `vi.mocked(fn, true)`

2. **External Library Mocking:**
   - **Problem**: bcryptjs or other libraries not mocking properly
   - **Solution**: Set up mocks at top level with proper default return values

3. **Prisma Method Mocking:**
   - **Problem**: Prisma methods returning undefined
   - **Solution**: Mock each method individually with appropriate return values

4. **Authentication Mocking:**
   - **Problem**: getToken not returning expected values
   - **Solution**: Import and mock after vi.mock() call, use proper typing

**Example of Proper Mock Setup:**
```typescript
vi.mock('@/lib/db', () => ({ prisma: createMockPrisma() }));

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

// In tests - use the mocked instances
const { getToken } = await import('next-auth/jwt');
vi.mocked(getToken, true).mockResolvedValue(mockUser);

const { prisma } = await import('@/lib/db');
vi.mocked(prisma.user.findMany, true).mockResolvedValue([mockData]);
```