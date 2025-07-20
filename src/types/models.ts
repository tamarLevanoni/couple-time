// Data models - query objects for APIs and generated types for stores/UI
import { Prisma } from '@prisma/client';

// ===== USER SELECTS =====

export const USER_CONTACT_FIELDS = {
  id: true,
  name: true,
  email: true,
  phone: true,
} as const satisfies Prisma.UserSelect;

export const USER_WITH_ACTIVE_RENTALS = {
  rentals: {
    where: {
      status: { in: ['PENDING', 'ACTIVE'] },
    },
    include: {
      gameInstances: {
        select: {
          id: true,
          centerId: true,
          gameId: true,
        },
      },
    },
  },
} as const satisfies Prisma.UserInclude;

// ===== CENTER SELECTS =====

export const CENTER_BASIC_FIELDS = {
  id: true,
  name: true,
  city: true,
  area: true,
} as const satisfies Prisma.CenterSelect;

export const CENTER_WITH_COORDINATOR = {
  ...CENTER_BASIC_FIELDS,
  coordinator: {
    select: USER_CONTACT_FIELDS,
  },
} as const satisfies Prisma.CenterInclude;

export const CENTER_PUBLIC_INFO = {
    ...CENTER_BASIC_FIELDS,
    location: true,
    gameInstances: {
      select: {
        id: true,
        gameId: true,
        status: true,
      },
    },
    coordinator: {
      select: USER_CONTACT_FIELDS,
    },
} as const satisfies Prisma.CenterSelect;

// ===== GAME SELECTS =====

export const GAME_BASIC_FIELDS = {
  id: true,
  name: true,
  description: true,
  categories: true,
  targetAudiences: true,
  imageUrl: true,
} as const satisfies Prisma.GameSelect;

export const GAMES_PUBLIC_INFO = {
    id: true,
    name: true,
    description: true,
    categories: true,
    targetAudiences: true,
    imageUrl: true,
} as const satisfies Prisma.GameSelect;

export const GAME_WITH_INSTANCES = {
  gameInstances: {
    select: {
      id: true,
      status: true,
      centerId: true,
      expectedReturnDate: true,
      notes: true,
    }
  }
} as const satisfies Prisma.GameInclude;

// ===== GAME INSTANCE SELECTS =====
//check
export const GAME_INSTANCE_WITH_GAME = {
  game: true,
} as const satisfies Prisma.GameInstanceInclude;

export const GAME_INSTANCE_WITH_CENTER = {
  game: {
    select: GAME_BASIC_FIELDS,
  },
  center: {
    select: CENTER_BASIC_FIELDS,
  },
} as const satisfies Prisma.GameInstanceInclude;

export const GAME_INSTANCE_WITH_CENTER_AND_ACTIVE_RENTALS = {
  ...GAME_INSTANCE_WITH_CENTER,
  rentals: {
    where: {
      status: { in: ['PENDING', 'ACTIVE'] },
    },
  },
} as const satisfies Prisma.GameInstanceInclude;

// ===== RENTAL INCLUDES =====
//check
export const RENTAL_FOR_USER = {
  gameInstances: {
    include: GAME_INSTANCE_WITH_CENTER,
  },
} as const satisfies Prisma.RentalInclude;

export const RENTAL_FOR_COORDINATOR = {
  user: {
    select: USER_CONTACT_FIELDS,
  },
  gameInstances: {
    include: {
      center: {
        select: {
          id: true,
          coordinatorId: true,
        },
      },
    },
  },
} as const satisfies Prisma.RentalInclude;

// ===== COORDINATOR QUERIES =====

export const COORDINATOR_DASHBOARD = {
  superCoordinator: {
    select: USER_CONTACT_FIELDS,
  },
  rentals: {
    where: {
      status: { in: ['PENDING', 'ACTIVE'] },
    },
    include: RENTAL_FOR_COORDINATOR,
  },
} as const satisfies Prisma.CenterInclude;

export const CENTER_STATS = {
  _count: {
    select: {
      gameInstances: true,
    },
  },
  gameInstances: {
    include: {
      rentals: true,
    },
  },
} as const satisfies Prisma.CenterInclude;

// ===== SUPER COORDINATOR QUERIES =====

export const CENTERS_FOR_SUPER_COORDINATOR = {
  coordinator: {
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
    },
  },
  _count: {
    select: {
      gameInstances: true,
    },
  },
  gameInstances: {
    select: {
      rentals: {
        where: {
          status: { in: ['PENDING', 'ACTIVE'] },
        },
        select: {
          status: true,
          expectedReturnDate: true,
        },
      },
    },
  },
} as const satisfies Prisma.CenterInclude;

export const RENTALS_FOR_SUPER_COORDINATOR = {
  user: {
    select: USER_CONTACT_FIELDS,
  },
  gameInstances: {
    include: {
      center: {
        select: CENTER_BASIC_FIELDS,
      },
      game: {
        select: GAME_BASIC_FIELDS,
      },
    },
  },
} as const satisfies Prisma.RentalInclude;

// ===== ADMIN QUERIES =====

export const USERS_FOR_ADMIN = {
  managedCenter: {
    select: CENTER_BASIC_FIELDS,
  },
  supervisedCenters: {
    select: CENTER_BASIC_FIELDS,
  },
} as const satisfies Prisma.UserInclude;

export const CENTERS_FOR_ADMIN = {
  coordinator: {
    select: USER_CONTACT_FIELDS,
  },
  superCoordinator: {
    select: USER_CONTACT_FIELDS,
  },
  _count: {
    select: {
      gameInstances: true,
    },
  },
} as const satisfies Prisma.CenterInclude;

export const GAMES_FOR_ADMIN = {
  _count: {
    select: {
      gameInstances: true,
    },
  },
  gameInstances: {
    include: {
      center: {
        select: CENTER_BASIC_FIELDS,
      },
    },
  },
} as const satisfies Prisma.GameInclude;

export const RENTALS_FOR_ADMIN = {
  user: {
    select: USER_CONTACT_FIELDS,
  },
  gameInstances: {
    include: {
      center: {
        select: CENTER_BASIC_FIELDS,
      },
      game: {
        select: GAME_BASIC_FIELDS,
      },
    },
  },
} as const satisfies Prisma.RentalInclude;

// ===== GENERATED TYPES FOR STORES/UI =====

// Basic types
export type UserContact = Prisma.UserGetPayload<{ select: typeof USER_CONTACT_FIELDS }>;
export type UserWithActiveRentals = Prisma.UserGetPayload<{ include: typeof USER_WITH_ACTIVE_RENTALS }>;

export type CenterBasic = Prisma.CenterGetPayload<{ select: typeof CENTER_BASIC_FIELDS }>;
export type CenterWithCoordinator = Prisma.CenterGetPayload<{ include: typeof CENTER_WITH_COORDINATOR }>;
export type CenterPublicInfo = Prisma.CenterGetPayload<{ select: typeof CENTER_PUBLIC_INFO}>;

export type GameBasic = Prisma.GameGetPayload<{ select: typeof GAME_BASIC_FIELDS }>;
export type GameWithInstances = Prisma.GameGetPayload<{ include: typeof GAME_WITH_INSTANCES }>;

export type GameInstanceWithGame = Prisma.GameInstanceGetPayload<{ include: typeof GAME_INSTANCE_WITH_GAME }>;
export type GameInstanceWithCenter = Prisma.GameInstanceGetPayload<{ include: typeof GAME_INSTANCE_WITH_CENTER }>;
export type GameInstanceForCoordinator = Prisma.GameInstanceGetPayload<{ include: typeof GAME_INSTANCE_WITH_GAME }>;

export type RentalForUser = Prisma.RentalGetPayload<{ include: typeof RENTAL_FOR_USER }>;
export type RentalForCoordinator = Prisma.RentalGetPayload<{ include: typeof RENTAL_FOR_COORDINATOR }>;

// Dashboard and specialized types
export type CoordinatorDashboardData = Prisma.CenterGetPayload<{ include: typeof COORDINATOR_DASHBOARD }>;
export type CenterStatsData = Prisma.CenterGetPayload<{ include: typeof CENTER_STATS }>;

// Note: API response types (UserForAdmin, CenterForAdmin, etc.) are defined in computed.ts