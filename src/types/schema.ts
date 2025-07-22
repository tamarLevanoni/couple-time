// Base Prisma types - source of truth
// Re-export base Prisma types with clean names

export type {
  // Models
  User,
  Center,
  Game,
  GameInstance,
  Rental,
  
  // Prisma utilities
  Prisma
} from '@prisma/client';

export {
  // Enums (values, not just types)
  Role,
  Area,
  GameCategory,
  TargetAudience,
  GameInstanceStatus,
  RentalStatus
} from '@prisma/client';