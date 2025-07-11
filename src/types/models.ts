// Data models - query objects for APIs and generated types for stores/UI
import { Prisma } from '@prisma/client';

// ===== USER SELECTS =====

export const USER_CONTACT_FIELDS = {
  id: true,
  name: true,
  email: true,
  phone: true,
} as const satisfies Prisma.UserSelect;

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

// ===== GAME SELECTS =====

export const GAME_BASIC_FIELDS = {
  id: true,
  name: true,
  category: true,
  targetAudience: true,
  description: true,
  imageUrl: true,
} as const satisfies Prisma.GameSelect;

// ===== GAME INSTANCE SELECTS =====

export const GAME_INSTANCE_WITH_GAME = {
  game: true,
} as const satisfies Prisma.GameInstanceInclude;

export const GAME_INSTANCE_WITH_CENTER = {
  game: true,
  center: {
    include: CENTER_WITH_COORDINATOR,
  },
} as const satisfies Prisma.GameInstanceInclude;

// ===== RENTAL INCLUDES =====

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
    include: GAME_INSTANCE_WITH_GAME,
  },
} as const satisfies Prisma.RentalInclude;

// ===== GENERATED TYPES FOR STORES/UI =====

export type UserContact = Prisma.UserGetPayload<{ select: typeof USER_CONTACT_FIELDS }>;
export type CenterBasic = Prisma.CenterGetPayload<{ select: typeof CENTER_BASIC_FIELDS }>;
export type CenterWithCoordinator = Prisma.CenterGetPayload<{ include: typeof CENTER_WITH_COORDINATOR }>;
export type GameBasic = Prisma.GameGetPayload<{ select: typeof GAME_BASIC_FIELDS }>;
export type GameInstanceWithGame = Prisma.GameInstanceGetPayload<{ include: typeof GAME_INSTANCE_WITH_GAME }>;
export type GameInstanceWithCenter = Prisma.GameInstanceGetPayload<{ include: typeof GAME_INSTANCE_WITH_CENTER }>;
export type RentalForUser = Prisma.RentalGetPayload<{ include: typeof RENTAL_FOR_USER }>;
export type RentalForCoordinator = Prisma.RentalGetPayload<{ include: typeof RENTAL_FOR_COORDINATOR }>;