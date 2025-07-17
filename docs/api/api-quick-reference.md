# API Quick Reference - Critical Patterns Only

## Route Groups
```
/api/public/*     - No auth
/api/user/*       - User's own data  
/api/coordinator/* - Center coordinator
/api/super/*      - Super coordinator
/api/admin/*      - Admin (DB role verification)
```

## Standard Flow
```typescript
// 1. Auth - Extract user from JWT token
const token = await getToken(req); // Returns: { id }

// 2. Admin verification - Only for /api/admin/* routes. import from permissions.ts
await assertAdminRole(token); // DB check: role + isActive

// 3. Resource access - Use route-specific access level. import from permissions.ts
await assertRentalAccess(rentalId, token, 'coordinator'); // 'user'|'coordinator'|'super'

// 4. Validation - Parse and validate request body
const data = RequestSchema.parse(await req.json()); // Throws 400 on invalid
//logic:Split into subfunctions if it helps with readability
// 5. Single query - Embed access control, use minimal select
const rentals = await prisma.rental.findMany({
  where: { gameInstances: { some: { center: { coordinatorId: token.id } } } },
  select: { id: true, status: true } // Only fields you need
});

// 6. Response - Return success with data
return apiResponse(true, rentals); // { success: true, data: rentals }
```

## Critical Database Patterns

### ❌ Never Do Multiple Queries
```typescript
// BAD
const center = await prisma.center.findFirst({ where: { coordinatorId: userId } });
const rentals = await prisma.rental.findMany({ where: { centerId: center.id } });
```

### ✅ Always Single Query + Relations
```typescript
// GOOD
const rentals = await prisma.rental.findMany({
  where: {
    gameInstances: { some: { center: { coordinatorId: userId } } }
  },
  select: { id: true, status: true } // Only needed fields
});
```

## Permission Patterns
```typescript
import { assertAdminRole, assertRentalAccess, AccessDeniedError, ResourceNotFoundError } from '@/lib/permissions';

// Admin verification (secure)
await assertAdminRole(token);

// Resource access (route-based)
await assertRentalAccess(rentalId, token, accessLevel);
```

## Error Handling
```typescript
catch (error) {
  if (error instanceof ResourceNotFoundError) return apiResponse(false, null, { message: error.message }, 404);
  if (error instanceof AccessDeniedError) return apiResponse(false, null, { message: error.message }, 403);
  return apiResponse(false, null, { message: 'Server error' }, 500);
}
```

## Key Rules
1. **Route-based permissions** with `accessLevel` parameter
2. **Single queries** with embedded access control  
3. **Minimal selects** for performance
4. **Admin role verification** via database
5. **404 vs 403** error distinction
6. Split into subfunctions if it helps with readability
