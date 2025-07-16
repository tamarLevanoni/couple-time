# API Routes - Quick Reference

## Route Structure
```
/api/public/*     - No auth required
/api/auth/*       - User registration/login
/api/user/*       - Authenticated users
/api/coordinator/* - Center coordinators
/api/super/*      - Super coordinators
/api/admin/*      - System administrators
```

## Authentication Flow
- Add `managedCenterId` to JWT tokens for coordinators
- Use `assertResourceAccess()` helpers for permissions
- Coordinators: direct comparison with `managedCenterId`
- Super coordinators: DB lookup for multiple centers

## Core Routes

### PUBLIC
```
GET /api/public/games        → GameForPublic[]
GET /api/public/centers      → CenterForPublic[]
```

### AUTH
```
POST /api/auth/register/google  → UserContactInfo
POST /api/auth/register/email   → UserContactInfo
POST /api/auth/login/google     → UserProfileWithRentals
POST /api/auth/login/email      → UserProfileWithRentals
```

### USER
```
GET /api/user                   → UserProfileWithRentals
PUT /api/user                   → UserProfileWithRentals
GET /api/user/rentals           → RentalForUser[]
POST /api/user/rentals          → RentalWithDetails
PUT /api/user/rentals/[id]      → RentalForUser
```

### COORDINATOR
```
GET /api/coordinator            → CoordinatorDashboard
GET /api/coordinator/rentals    → RentalForCoordinator[]
POST /api/coordinator/rentals   → RentalForCoordinator
PUT /api/coordinator/rentals/[id] → RentalForCoordinator
GET /api/coordinator/games      → GameInstanceForCoordinator[]
PUT /api/coordinator/games/[id] → GameInstanceForCoordinator
GET /api/coordinator/stats      → CenterStats
```

### SUPER
```
GET /api/super/centers          → CenterForSuperCoordinator[]
GET /api/super/rentals          → RentalForSuperCoordinator[]
PUT /api/super/rentals/[id]     → RentalForSuperCoordinator
```

### ADMIN
```
GET /api/admin/users            → UserForAdmin[]
PUT /api/admin/users/[id]       → UserForAdmin
GET /api/admin/centers          → CenterForAdmin[]
POST /api/admin/centers         → CenterForAdmin
PUT /api/admin/centers/[id]     → CenterForAdmin
GET /api/admin/games            → GameForAdmin[]
PUT /api/admin/games/[id]       → GameForAdmin
GET /api/admin/rentals          → RentalForAdmin[]
PUT /api/admin/rentals/[id]     → RentalForAdmin
```

## Key Types

### Request Patterns
- **Rentals**: `{ gameInstanceIds[], centerId, notes? }`
- **Actions**: `{ action: "approve"|"cancel"|"return", notes? }`
- **Filters**: `{ status?, dateRange?, userId?, centerId? }`

### Response Patterns
- **Success**: `{ success: true, data: T }`
- **Error**: `{ success: false, error: { message: string } }`

### Core Data Models
- **UserContactInfo**: `{ id, name, email, phone }`
- **RentalForUser**: `{ id, status, dates, gameInstances[], center, canCancel }`
- **GameInstanceForCoordinator**: `{ id, gameId, centerId, status, notes }`
- **CenterStats**: `{ totalRentals, activeRentals, overdueRentals, popularGames[] }`

## Permission System

### Route-Based Access Control
```typescript
import { 
  assertAdminRole, 
  assertRentalAccess, 
  assertGameInstanceAccess, 
  assertCenterAccess, 
  assertUserAccess,
  AccessDeniedError,
  ResourceNotFoundError 
} from '@/lib/permissions';

// Admin routes - secure DB verification
await assertAdminRole(token); // Checks role + isActive in database

// Resource-specific access with context
await assertRentalAccess(rentalId, token, 'user');        // User's own rentals
await assertRentalAccess(rentalId, token, 'coordinator'); // Center coordinator access
await assertRentalAccess(rentalId, token, 'super');      // Super coordinator access

await assertGameInstanceAccess(gameInstanceId, token, 'coordinator');
await assertCenterAccess(centerId, token, 'super');
await assertUserAccess(targetUserId, token, 'user');
```

### Error Types
- **ResourceNotFoundError** → 404 (resource doesn't exist)
- **AccessDeniedError** → 403 (exists but no permission)

## Database Query Best Practices

### ❌ Avoid Multiple Database Queries
```typescript
// BAD: Multiple queries
const center = await prisma.center.findFirst({ where: { coordinatorId: userId } });
const rentals = await prisma.rental.findMany({ where: { centerId: center.id } });
```

### ✅ Use Single Query with Relations
```typescript
// GOOD: Single query with proper where clause
const rentals = await prisma.rental.findMany({
  where: {
    gameInstances: {
      some: {
        center: {
          coordinatorId: userId,
          isActive: true,
        },
      },
    },
  },
  include: RENTAL_FOR_COORDINATOR,
});
```

### ✅ Use Relation-Based Access Control
```typescript
// Embed access control in the query itself
const gameInstance = await prisma.gameInstance.findFirst({
  where: {
    id: gameInstanceId,
    center: {
      coordinatorId: token.id,  // Access control built into query
    },
  },
  select: { id: true, status: true },
});
```

### ✅ Include Related Data Only When Needed
```typescript
// Only include rentals if we need to check for unavailable status
const gameInstance = await prisma.gameInstance.findFirst({
  where: { id: gameInstanceId },
  select: {
    id: true,
    status: true,
    center: { select: { coordinatorId: true } },
    // Conditional include based on business logic
    ...(updateData.status === 'UNAVAILABLE' && {
      rentals: {
        where: { status: { in: ['PENDING', 'ACTIVE'] } },
        select: { id: true },
      },
    }),
  },
});
```

### ✅ Optimal Select Patterns
```typescript
// Use minimal select for performance
const rental = await prisma.rental.findFirst({
  where: { id: rentalId },
  select: { 
    id: true, 
    userId: true, 
    status: true,
    center: { select: { coordinatorId: true } }
  },
});

// Use query objects from models.ts for complex selections
const rentals = await prisma.rental.findMany({
  where: { userId: token.id },
  ...RENTAL_FOR_USER,
});
```

### ✅ Many-to-Many Relations
```typescript
// Use connect for linking existing records
await prisma.rental.create({
  data: {
    userId,
    centerId,
    gameInstances: {
      connect: gameInstanceIds.map(id => ({ id }))
    }
  }
});
```

## Standard Route Flow

### 1. Authentication
```typescript
const token = await getToken(req);
// Returns: { id, role, managedCenterId? }
// Throws: 401 if token invalid/missing
```

### 2. Authorization (Route-Specific)
```typescript
// Admin routes: Verify admin role first
if (route.startsWith('/api/admin/')) {
  await assertAdminRole(token); // DB verification: role + isActive
}

// Resource-specific permissions with access level context
await assertRentalAccess(rentalId, token, 'user');        // /api/user/*
await assertRentalAccess(rentalId, token, 'coordinator'); // /api/coordinator/*
await assertRentalAccess(rentalId, token, 'super');      // /api/super/*

// Throws: 403 if access denied, 404 if resource not found
```

### 3. Validation
```typescript
const data = RequestSchema.parse(await req.json());
// Validates request body structure
// Throws: 400 if validation fails
```

### 4. Business Logic (Optimized Queries)
```typescript
// GET: Single query with embedded access control + minimal selects
const rentals = await prisma.rental.findMany({
  where: {
    gameInstances: {
      some: { center: { coordinatorId: token.id } }
    }
  },
  select: {
    id: true,
    status: true,
    userId: true,
    gameInstances: {
      select: { id: true, gameId: true }
    },
    user: { select: { name: true, phone: true } }
  }
});

// POST/PUT: Create/update with proper relations
const rental = await prisma.rental.create({
  data: {
    userId,
    centerId,
    status: 'PENDING',
    gameInstances: { 
      connect: gameInstanceIds.map(id => ({ id })) 
    }
  },
  include: RENTAL_FOR_COORDINATOR // Use predefined query objects
});
```

### 5. Response
```typescript
// Success (200/201)
return apiResponse(true, data);

// Error handling with proper status codes
try {
  // ... route logic
} catch (error) {
  if (error instanceof ValidationError) {
    return apiResponse(false, null, { message: error.message }, 400);
  }
  if (error instanceof ResourceNotFoundError) {
    return apiResponse(false, null, { message: error.message }, 404);
  }
  if (error instanceof AccessDeniedError) {
    return apiResponse(false, null, { message: error.message }, 403);
  }
  return apiResponse(false, null, { message: 'Server error' }, 500);
}
```

