# API Routes Documentation - Game Rental System

Based on user stories and business requirements from `/characterization/user_stories_english.md`

## Route Organization by Permission Groups

### PUBLIC Routes (No Authentication)
- `/api/public/games` - **GET** Browse game catalog
- `/api/public/centers` - **GET** Find centers and availability

### AUTH Routes (Authentication & User Management)  
- `/api/auth/register/google` - **POST** User registration (Google OAuth)
- `/api/auth/register/email` - **POST** User registration (Email/Password)
- `/api/auth/login/google` - **POST** Sign in with Google OAuth
- `/api/auth/login/email` - **POST** Sign in with Email/Password
- `/api/user` - **GET, PUT** User profile management
- `/api/user/rentals` - **GET, POST** User rental management
- `/api/user/rentals/[id]` - **PUT** Cancel own rental

### COORDINATOR Routes (Center Coordinators)
- `/api/coordinator` - **GET** Complete center overview  
- `/api/coordinator/rentals` - **GET, POST** Get/Create rentals
- `/api/coordinator/rentals/[id]` - **PUT** Update rental status
- `/api/coordinator/games` - **GET, POST** Game management
- `/api/coordinator/stats` - **GET** Center statistics

### SUPER Routes (Super Coordinators)
- `/api/super/centers` - **GET** Supervise multiple centers
- `/api/super/rentals` - **GET** Cross-center rental management
- `/api/super/rentals/[id]` - **PUT** Update rental status

### ADMIN Routes (System Administrators)
- `/api/admin/users` - **GET** User management
- `/api/admin/users/[id]` - **PUT** Update user details (including roles)
- `/api/admin/centers` - **GET, POST** Center management  
- `/api/admin/centers/[id]` - **PUT** Update center details
- `/api/admin/games` - **GET** Global game management
- `/api/admin/games/[id]` - **PUT** Update game details
- `/api/admin/rentals` - **GET** System-wide rental oversight
- `/api/admin/rentals/[id]` - **PUT** Update any rental (admin override)

---

## API Route Details

### 📁 PUBLIC ROUTES

**GET /api/public/games** - Browse game catalog (US-1.1)
- Request: None
- DB Query: [`GAMES_PUBLIC_INFO`](#games_public_info) → **models.ts**
- Response: `GameForPublic[]` - Array of game objects

**GET /api/public/centers** - Find nearby centers (US-1.2)
- Request: None  
- DB Query: [`CENTER_PUBLIC_INFO`](#center_public_info) → **models.ts**
- Response: `CenterForPublic[]` - Array of center objects

### 📁 AUTH ROUTES

**POST /api/auth/register/google** - Google OAuth registration (US-1.3)
- Request: `googleId, name, email, phone`
- DB Fields: Insert `googleId, name, email, phone, roles`
- Response: `UserContactInfo` - Basic user contact information

**POST /api/auth/register/email** - Email/password registration (US-1.3)
- Request: `name, email, phone, password`
- DB Fields: Insert `name, email, phone, password (hashed), roles`
- Response: `UserContactInfo` - Basic user contact information

**POST /api/auth/login/google** - Google OAuth login
- Request: `googleId`
- DB Query: Find user by `googleId`
- Response: `UserProfileWithRentals` - Full user profile with active rentals

**POST /api/auth/login/email** - Email/password login
- Request: `email, password`
- DB Query: Find user by `email`, verify password
- Response: `UserProfileWithRentals` - Full user profile with active rentals

**GET /api/user** - Get current user profile with active rentals
- Request: None
- DB Query: [`USER_WITH_ACTIVE_RENTALS`](#user_with_active_rentals) → **models.ts**
- Response: `UserProfileWithRentals` - Full user profile with active rentals

**PUT /api/user** - Update personal details (US-1.6)
- Request: `name?, phone?`
- DB Fields: Update `name, phone`
- Response: `UserProfileWithRentals` - Full user profile with active rentals

**GET /api/user/rentals** - View rental history (returned/cancelled) (US-1.4)
- Request: `status?, dateRange?`
- DB Query: [`RENTALS_FOR_USER`](#rentals_for_user) → **models.ts**
- Response: `RentalForUser[]` - Array of user's rental history
- Note: For active/pending rentals, use GET /api/user instead

**POST /api/user/rentals** - Request rental (US-1.3)
- Request: `centerId, gameInstanceIds[], notes?`
- Validation: All `gameInstanceIds` must belong to the specified `centerId`
- DB Operation: Insert rental + connect gameInstances via many-to-many relation
- Response: [`RentalWithDetails`](#rentalwithdetails)
- Errors: 400 if game instances don't belong to center, 409 if games unavailable

**PUT /api/user/rentals/[id]** - Cancel pending rental (US-1.4)
- Request: `action: "cancel"`
- DB Fields: Update `status = CANCELLED`
- Response: [`RentalForUser`](#rentalforuser)

### 📁 COORDINATOR ROUTES

**GET /api/coordinator** - Complete center overview (US-2.1)
- Request: None
- DB Query: [`COORDINATOR_DASHBOARD`](#coordinator_dashboard) → **models.ts**
- Response: `CoordinatorDashboard` - Complete dashboard with center overview

**GET /api/coordinator/rentals** - View rentals with filters (US-2.3)
- Request: `status?, dateRange?, userId?`
- DB Query: [`RENTALS_FOR_COORDINATOR`](#rentals_for_coordinator) → **models.ts**
- Response: [`RentalForCoordinator[]`](#rentalforcoordinator)

**POST /api/coordinator/rentals** - Create manual rental (US-2.5)
- Request: `userId, centerId, gameInstanceIds[], borrowDate?, expectedReturnDate?, notes?`
- DB Operation: Insert rental + connect gameInstances via many-to-many relation
- Response: [`RentalForCoordinator`](#rentalforcoordinator)

**PUT /api/coordinator/rentals/[id]** - Update rental status (US-2.2, US-2.3)
- Request: `action, borrowDate?, expectedReturnDate?, returnDate?, notes?`
- DB Fields: Update `status, borrowDate, expectedReturnDate, returnDate, notes`
- Response: [`RentalForCoordinator`](#rentalforcoordinator)

**GET /api/coordinator/games** - View center games
- Request: None
- DB Query: [`GAME_INSTANCES_FOR_COORDINATOR`](#game_instances_for_coordinator) → **models.ts**
- Response: [`GameInstanceForCoordinator[]`](#gameinstanceforcoordinator)

**POST /api/coordinator/games** - Add game to center (US-2.4)
- Request: `gameId?, name?, description?, categories?, targetAudiences?, imageUrl?, status?, notes?`
- DB Query: [`CREATE_GAME_INSTANCE`](#create_game_instance) → **models.ts**
- Response: [`GameInstanceForCoordinator`](#gameinstanceforcoordinator)

**PUT /api/coordinator/games/[id]** - Update game status
- Request: `action, notes?`
- DB Fields: Update `status, notes`
- Response: [`GameInstanceForCoordinator`](#gameinstanceforcoordinator)

**GET /api/coordinator/stats** - View center statistics (US-2.6)
- Request: `dateRange?, detailed?`
- DB Query: [`CENTER_STATS`](#center_stats) → **models.ts**
- Response: [`CenterStats`](#centerstats)

### 📁 SUPER ROUTES

**GET /api/super/centers** - Supervise centers (US-3.1)
- Request: None
- DB Query: [`CENTERS_FOR_SUPER_COORDINATOR`](#centers_for_super_coordinator) → **models.ts**
- Response: [`CenterForSuperCoordinator[]`](#centerforsupercoordinator)

**GET /api/super/rentals** - Cross-center rental management (US-3.2, US-3.3)
- Request: `centerId?, status?, overdueOnly?, dateRange?`
- DB Query: [`RENTALS_FOR_SUPER_COORDINATOR`](#rentals_for_super_coordinator) → **models.ts**
- Response: [`RentalForSuperCoordinator[]`](#rentalforsupercoordinator)

**PUT /api/super/rentals/[id]** - Update rental status across centers (US-3.2)
- Request: `action, borrowDate?, expectedReturnDate?, returnDate?, notes?`
- DB Fields: Update `status, borrowDate, expectedReturnDate, returnDate, notes`
- Response: [`RentalForSuperCoordinator`](#rentalforsupercoordinator)

### 📁 ADMIN ROUTES

**GET /api/admin/users** - Manage users (US-4.1)
- Request: `search?, roles?, isActive?, centerId?, page?, pageSize?`
- DB Query: [`USERS_FOR_ADMIN`](#users_for_admin) → **models.ts**
- Response: [`UserForAdmin[]`](#userforadmin)

**PUT /api/admin/users/[id]** - Update user details (US-4.1)
- Request: `name?, phone?, roles?, isActive?, managedCenterId?, supervisedCenterIds?`
- DB Fields: Update `name, phone, roles, isActive, managedCenterId, supervisedCenters`
- Response: [`UserForAdmin`](#userforadmin)

**GET /api/admin/centers** - Manage centers (US-4.2)
- Request: None
- DB Query: [`CENTERS_FOR_ADMIN`](#centers_for_admin) → **models.ts**
- Response: [`CenterForAdmin[]`](#centerforadmin)

**POST /api/admin/centers** - Add new center (US-4.2)
- Request: `name, city, area, coordinatorId?, superCoordinatorId?, location?`
- DB Fields: Insert `name, city, area, coordinatorId, superCoordinatorId, location`
- Response: [`CenterForAdmin`](#centerforadmin)

**PUT /api/admin/centers/[id]** - Edit center details (US-4.2)
- Request: `name?, city?, area?, coordinatorId?, superCoordinatorId?, location?, isActive?`
- DB Fields: Update `name, city, area, coordinatorId, superCoordinatorId, location, isActive`
- Response: [`CenterForAdmin`](#centerforadmin)

**GET /api/admin/games** - Global game management (US-4.3)
- Request: None
- DB Query: [`GAMES_FOR_ADMIN`](#games_for_admin) → **models.ts**
- Response: [`GameForAdmin[]`](#gameforadmin)

**PUT /api/admin/games/[id]** - Edit games (US-4.3)
- Request: `name?, description?, categories?, targetAudiences?, imageUrl?`
- DB Fields: Update `name, description, categories, targetAudiences, imageUrl`
- Response: [`GameForAdmin`](#gameforadmin)

**GET /api/admin/rentals** - System-wide rental oversight
- Request: `status?, centerId?, area?, userId?, overdueOnly?, dateRange?, page?, pageSize?`
- DB Query: [`RENTALS_FOR_ADMIN`](#rentals_for_admin) → **models.ts**
- Response: [`RentalForAdmin[]`](#rentalforadmin)

**PUT /api/admin/rentals/[id]** - Update any rental (admin override)
- Request: `action, borrowDate?, expectedReturnDate?, returnDate?, reason?, notes?`
- DB Fields: Update `status, borrowDate, expectedReturnDate, returnDate, notes`
- Response: [`RentalForAdmin`](#rentalforadmin)

---

## Type Definitions

### 📁 PUBLIC TYPES

#### GameForPublic
```typescript
{
  id: string;
  name: string;
  description?: string;
  categories: GameCategory[];
  targetAudiences: TargetAudience[];
  imageUrl?: string;
}
```

#### CenterForPublic
```typescript
{
  id: string;
  name: string;
  city: string;
  area: Area;
  location?: { lat: number; lng: number };
  coordinator: UserContactInfo;
  gameInstances: {
    id: string;
    gameId: string;
    status: GameInstanceStatus;
  }[];
}
```

### 📁 AUTH TYPES

#### UserContactInfo
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
}
```

#### UserProfileWithRentals
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: Role[];
  isActive: boolean;
  currentRentals: RentalForUser[];
}
```

#### RentalForUser
```typescript
{
  id: string;
  status: RentalStatus;
  requestDate?: Date;
  borrowDate?: Date;
  returnDate?: Date;
  expectedReturnDate?: Date;
  notes?: string;
  gameInstances: {
    id: string;
    gameId: string;
    centerId: string;
  }[];
  center: CenterForPublic;
  canCancel: boolean; // Computed
}
```

#### RentalWithDetails (extends RentalForUser)
```typescript
{
  ...RentalForUser;
  isOverdue: boolean; // Computed
  daysOverdue: number; // Computed
  canReturn: boolean; // Computed
}
```

### 📁 COORDINATOR TYPES

#### CoordinatorDashboard
```typescript
{
  center: { id: string; name: string; city: string; area: Area };
  superCoordinator?: { name: string; phone: string; email: string };
  pendingRentals: RentalForCoordinator[];
  activeRentals: RentalForCoordinator[];
  availableGames: GameInstanceForCoordinator[];
  stats: { totalRentals: number; activeRentals: number; overdueRentals: number; totalGames: number };
}
```

#### RentalForCoordinator
```typescript
{
  id: string;
  centerId: string;
  status: RentalStatus;
  requestDate?: Date;
  borrowDate?: Date;
  returnDate?: Date;
  expectedReturnDate?: Date;
  notes?: string;
  user: UserContactInfo; 
  gameInstanceIds: string[]; // Computed from gameInstances relation
  isOverdue: boolean; // Computed
  daysOverdue: number; // Computed
  canApprove: boolean; // Computed
  canCancel: boolean; // Computed
  canReturn: boolean; // Computed
}
```

#### GameInstanceForCoordinator
```typescript
{
  id: string;
  gameId: string;
  centerId: string;
  status: GameInstanceStatus;
  expectedReturnDate: Date;
  notes?: string;
  rentalsIds: string[];

}
```

#### CenterStats
```typescript
{
  totalRentals: number;
  activeRentals: number;
  returnedRentals: number;
  overdueRentals: number;
  totalGames: number;
  availableGames: number;
  popularGames: { gameId: string; gameName: string; rentalCount: number }[];
  overduePercentage: number;
  averageRentalDays: number;
}
```

### 📁 SUPER COORDINATOR TYPES

#### CenterForSuperCoordinator
```typescript
{
  id: string;
  name: string;
  city: string;
  area: Area;
  isActive: boolean;
  coordinator?: { id: string; name: string; phone: string; email: string };
  stats: { totalGames: number; pendingRentals: number; activeRentals: number; overdueRentals: number };
}
```

#### RentalForSuperCoordinator
```typescript
{
  id: string;
  status: RentalStatus;
  requestDate: Date;
  borrowDate?: Date;
  returnDate?: Date;
  expectedReturnDate?: Date;
  notes?: string;
  user: { id: string; name: string; phone: string; email: string };
  center: { id: string; name: string; city: string };
  gameInstances: { id: string; gameId: string; game: { id: string; name: string } }[];
  isOverdue: boolean; // Computed
  daysOverdue: number; // Computed
}
```

### 📁 ADMIN TYPES

#### UserForAdmin
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: Role[];
  isActive: boolean;
  managedCenter?: { id: string; name: string; city: string };
  supervisedCenters: { id: string; name: string; city: string }[];
  createdAt: Date;
}
```

#### CenterForAdmin
```typescript
{
  id: string;
  name: string;
  city: string;
  area: Area;
  isActive: boolean;
  coordinator?: { id: string; name: string; phone: string; email: string };
  superCoordinator?: { id: string; name: string; phone: string; email: string };
  stats: { totalGames: number; activeRentals: number; totalRentals: number };
  createdAt: Date;
}
```

#### GameForAdmin
```typescript
{
  id: string;
  name: string;
  description?: string;
  categories: GameCategory[];
  targetAudiences: TargetAudience[];
  imageUrl?: string;
  totalInstances: number;
  availableInstances: number;
  centerDistribution: { centerId: string; centerName: string; instances: number }[];
  createdAt: Date;
}
```

#### RentalForAdmin
```typescript
{
  id: string;
  status: RentalStatus;
  requestDate: Date;
  borrowDate?: Date;
  returnDate?: Date;
  expectedReturnDate?: Date;
  notes?: string;
  user: { id: string; name: string; phone: string; email: string };
  center: { id: string; name: string; city: string; area: Area };
  gameInstances: { id: string; game: { id: string; name: string } }[];
  isOverdue: boolean; // Computed
  daysOverdue: number; // Computed
}
```

---

## Model Query Objects (models.ts)


### 📁 PUBLIC QUERIES

#### USER_CONTACT_INFO
```typescript
{
  select: {
    id: true,
    name: true,
    email: true,
    phone: true,
  }
}
```


#### GAMES_PUBLIC_INFO
```typescript
{
  select: {
    id: true,
    name: true,
    description: true,
    categories: true,
    targetAudiences: true,
    imageUrl: true,
  }
}
```

#### CENTER_PUBLIC_INFO
```typescript
{
  select: {
    id: true,
    name: true,
    city: true,
    area: true,
    location: true,
    isActive: true,
    gameInstances: {
      select: {
        id: true,
        gameId: true,
        centerId: true,
        status: true,
        expectedReturnDate: true
      }
    },
    coordinator: USER_CONTACT_INFO
  }
}
```

### 📁 USER QUERIES

#### USER_WITH_ACTIVE_RENTALS
```typescript
{
  select: {
    id: true,
    name: true,
    email: true,
    phone: true,
    roles: true,
    rentals: {
      where: {
        status: { in: ['PENDING', 'ACTIVE'] }
      },
      include: {
        gameInstances: {
          select: {
            id: true,
            centerId: true,
            gameId: true
          }
        }
      }
    }
  }
}
```

#### RENTALS_FOR_USER
```typescript
{
  include: {
    gameInstances: {
      select: {
            id: true,
            centerId: true,
            gameId: true
          }
    }
  }
}
```

### 📁 COORDINATOR QUERIES

#### COORDINATOR_DASHBOARD
```typescript
{
  include: {
    superCoordinator: USER_CONTACT_INFO,
    gameInstances: true,
    rentals: {
      where: {
            status: { in: ['PENDING', 'ACTIVE'] },
          },
          include: {
            user: USER_CONTACT_INFO
          }
    }
  }
}
```

#### RENTALS_FOR_COORDINATOR
```typescript
{
  include: {
    gameInstances: true,
    user: USER_CONTACT_INFO, // אם צריך
  },
}
```

#### GAME_INSTANCES_FOR_COORDINATOR
```typescript
{
  include: {
    game: true,
  }
}
```

#### CENTER_STATS
```typescript
{
  include: {
    _count: {
      select: {
        gameInstances: true,
      }
    },
    gameInstances: {
      include: {
        rentals: true,
      }
    }
  }
}
```

### 📁 SUPER COORDINATOR QUERIES

#### CENTERS_FOR_SUPER_COORDINATOR
```typescript
{
  include: {
    coordinator: {
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
      }
    },
    _count: {
      select: {
        gameInstances: true,
      }
    },
    gameInstances: {
      select: {
        rentals: {
          where: {
            status: { in: ['PENDING', 'ACTIVE'] }
          },
          select: {
            status: true,
            expectedReturnDate: true,
          }
        }
      }
    }
  }
}
```

#### RENTALS_FOR_SUPER_COORDINATOR
```typescript
{
  include: {
    user: {
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
      }
    },
    gameInstances: {
      include: {
        center: {
          select: {
            id: true,
            name: true,
            city: true,
          }
        },
        game: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          }
        }
      }
    }
  }
}
```

### 📁 ADMIN QUERIES

#### USERS_FOR_ADMIN
```typescript
{
  include: {
    managedCenter: {
      select: {
        id: true,
        name: true,
        city: true,
      }
    },
    supervisedCenters: {
      select: {
        id: true,
        name: true,
        city: true,
      }
    }
  }
}
```

#### CENTERS_FOR_ADMIN
```typescript
{
  include: {
    coordinator: {
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
      }
    },
    superCoordinator: {
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
      }
    },
    _count: {
      select: {
        gameInstances: true,
      }
    },
    gameInstances: {
      select: {
        rentals: {
          select: {
            status: true,
          }
        }
      }
    }
  }
}
```

#### GAMES_FOR_ADMIN
```typescript
{
  include: {
    _count: {
      select: {
        gameInstances: true,
      }
    },
    gameInstances: {
      include: {
        center: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    }
  }
}
```

#### RENTALS_FOR_ADMIN
```typescript
{
  include: {
    user: {
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
      }
    },
    gameInstances: {
      include: {
        center: {
          select: {
            id: true,
            name: true,
            city: true,
            area: true,
          }
        },
        game: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    }
  }
}
```

### 📁 CREATE/UPDATE QUERIES

#### CREATE_GAME_INSTANCE
```typescript
{
  data: {
    gameId: string,
    centerId: string,
    status: GameInstanceStatus,
    notes?: string,
  },
  include: {
    game: true,
  }
}
```

---

## Database Relationships

### 🔗 **Key Many-to-Many Relations**

**Rental ↔ GameInstance**
- Rental model has `gameInstances GameInstance[]` relation
- GameInstance model has `rentals Rental[]` relation  
- API accepts `gameInstanceIds[]` in requests
- Database operations use Prisma's `connect` syntax:

```typescript
// Example: Creating a rental with game instances
await prisma.rental.create({
  data: {
    userId,
    centerId,
    status: 'PENDING',
    gameInstances: {
      connect: gameInstanceIds.map(id => ({ id }))
    }
  },
  include: {
    gameInstances: {
      select: { id: true, gameId: true, centerId: true }
    }
  }
})
```

**User ↔ Center (Supervision)**
- User model has `supervisedCenters Center[]` relation
- Center model has `superCoordinator User?` relation via `superCoordinatorId`
- One super coordinator can supervise multiple centers

---

## Summary

**Complete API Documentation with:**
- 19 total routes across 5 permission groups
- Clean RESTful design with consistent naming conventions
- Action-based updates using single PUT endpoints
- Complete authentication system: registration + sign-in for both Google OAuth and email/password
- Comprehensive type definitions for all user roles
- Clear field mappings from requests → database → responses
- Detailed Prisma query objects for all database operations
- Proper many-to-many relationship handling

**Ready for implementation with strong type safety and consistent patterns!**
