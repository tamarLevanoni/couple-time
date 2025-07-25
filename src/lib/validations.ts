// Validation schemas using Zod - matches Prisma schema exactly
// Source: /prisma/schema.prisma

import { z } from 'zod';
import {
  Role,
  Area,
  GameCategory,
  TargetAudience,
  GameInstanceStatus,
  RentalStatus,
} from '@prisma/client';

// ===== ENUM VALIDATIONS =====

export const RoleSchema = z.nativeEnum(Role);
export const AreaSchema = z.nativeEnum(Area);
export const GameCategorySchema = z.nativeEnum(GameCategory);
export const TargetAudienceSchema = z.nativeEnum(TargetAudience);
export const GameInstanceStatusSchema = z.nativeEnum(GameInstanceStatus);
export const RentalStatusSchema = z.nativeEnum(RentalStatus);

// ===== BASE MODEL VALIDATIONS =====

// User validation
export const UserSchema = z.object({
  id: z.string().cuid(),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^[\d\-\+\(\)\s]+$/, 'Invalid phone format').min(9).max(15),
  roles: z.array(RoleSchema).min(1, 'At least one role is required'),
  managedCenterId: z.string().cuid().optional(),
  supervisedCenterIds: z.array(z.string().cuid()).optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Optional auth fields
  googleId: z.string().optional(),
  password: z.string().optional(),
});

// Center validation
export const CenterSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, 'Center name is required').max(100),
  city: z.string().min(1, 'City is required').max(50),
  area: AreaSchema,
  coordinatorId: z.string().cuid().optional(),
  superCoordinatorId: z.string().cuid().optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Game validation
export const GameSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, 'Game name is required').max(100),
  description: z.string().max(1000).optional(),
  categories: z.array(GameCategorySchema).min(1, 'At least one category is required'),
  targetAudiences: z.array(TargetAudienceSchema).min(1, 'At least one targetAudience is required'),
  imageUrl: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Game Instance validation
export const GameInstanceSchema = z.object({
  id: z.string().cuid(),
  gameId: z.string().cuid(),
  centerId: z.string().cuid(),
  status: GameInstanceStatusSchema,
  expectedReturnDate: z.date().optional(),
  notes: z.string().max(500).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Rental validation
export const RentalSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  centerId: z.string().cuid(),
  status: RentalStatusSchema,
  requestDate: z.date(),
  borrowDate: z.date().optional(),
  returnDate: z.date().optional(),
  expectedReturnDate: z.date().optional(),
  notes: z.string().max(500).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ===== API REQUEST VALIDATIONS =====

// User API validations
export const CreateUserSchema = UserSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  roles: true,
}).extend({
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  managedCenterId: UserSchema.shape.managedCenterId,
  supervisedCenterIds: z.array(z.string().cuid()).optional(),
});


export const CompleteGoogleProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z
    .string()
    .regex(/^[\d\-\+\(\)\s]+$/, 'Invalid phone format')
    .min(9)
    .max(15),
});

export const RegisterWithEmailSchema = z.object({
  firstName: UserSchema.shape.firstName,
  lastName: UserSchema.shape.lastName,
  email: UserSchema.shape.email,
  phone: UserSchema.shape.phone,
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});

export const LoginWithGoogleSchema = z.object({
  googleId: z.string().min(1, 'Google ID is required'),
});

export const LinkGoogleToExistingUserSchema = z.object({
  googleId: z.string().min(1, 'Google ID is required'),
  email: UserSchema.shape.email,
});

export const LoginWithEmailSchema = z.object({
  email: UserSchema.shape.email,
  password: z.string().min(1, 'Password is required'),
});

export const UpdateUserProfileSchema = UserSchema.pick({
  firstName: true,
  lastName: true,
  phone: true,
}).partial();

// Game API validations
export const CreateGameSchema = GameSchema.pick({
  name: true,
  categories: true,
  targetAudiences: true,
}).extend({
  description: GameSchema.shape.description,
  imageUrl: GameSchema.shape.imageUrl,
});

export const UpdateGameSchema = GameSchema.pick({
  name: true,
  categories: true,
  targetAudiences: true,
  description: true,
  imageUrl: true
}).partial();

// Center API validations
export const CreateCenterSchema = CenterSchema.pick({
  name: true,
  city: true,
  area: true,
}).extend({
  coordinatorId: CenterSchema.shape.coordinatorId,
  superCoordinatorId: CenterSchema.shape.superCoordinatorId,
  location: CenterSchema.shape.location,
});

export const UpdateCenterSchema = CenterSchema.pick({
  name: true,
  city: true,
  area: true,
  coordinatorId: true,
  superCoordinatorId: true,
  location: true,
  isActive: true,
}).partial();

// ===== RENTAL API VALIDATIONS =====
// Business Rule: All game instances in a rental must belong to the same center
// This prevents cross-center rental attempts and ensures operational efficiency

// Rental API validations
export const CreateRentalSchema = z.object({
  centerId: z.string().cuid(),
  gameInstanceIds: z.array(z.string().cuid())
    .min(1, "At least one game instance is required")
    .max(10, "Maximum 10 games per rental")
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Duplicate game instance IDs are not allowed"
    }),
  notes: RentalSchema.shape.notes,
});

// Note: Additional validation should be implemented in API route handlers:
// 1. Verify all gameInstanceIds exist and belong to the specified centerId
// 2. Check that all game instances are available (status: AVAILABLE)
// 3. Validate user permissions for the center
//
// Example implementation:
// const instances = await prisma.gameInstance.findMany({
//   where: { id: { in: data.gameInstanceIds }, centerId: data.centerId, status: 'AVAILABLE' }
// });
// if (instances.length !== data.gameInstanceIds.length) {
//   throw new Error("Some game instances are unavailable or don't belong to this center");
// }

export const CreateManualRentalSchema = z.object({
  userId: RentalSchema.shape.userId,
  centerId: z.string().cuid(),
  gameInstanceIds: z.array(z.string().cuid())
    .min(1, "At least one game instance is required")
    .max(10, "Maximum 10 games per rental")
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Duplicate game instance IDs are not allowed"
    }),
  borrowDate: z
    .string()
    .datetime()
    .transform((val) => new Date(val)),
  expectedReturnDate: z
    .string()
    .datetime()
    .transform((val) => new Date(val)),
  notes: RentalSchema.shape.notes,
});

// Note: Same validation logic applies for manual rentals

export const UpdateRentalSchema = z.object({
  borrowDate: z.string().datetime().optional(),
  returnDate: z.string().datetime().optional(),
  expectedReturnDate: z.string().datetime().optional(),
  notes: RentalSchema.shape.notes,
  gameInstanceIds: z.array(z.string().cuid()).min(1).max(10).optional(),
  status: z.enum([RentalStatus.CANCELLED]).optional(), // Users can only cancel rentals
});
export const UpdateByUserRentalSchema = z.object({
  notes: RentalSchema.shape.notes,
  gameInstanceIds: z.array(z.string().cuid()).min(1).max(10).optional(),
  action: z.enum(['cancel']).optional(), // Users can only cancel rentals
});

export const UpdateRentalByCoordinatorSchema = z.object({
  borrowDate: z.string().datetime().optional(),
  returnDate: z.string().datetime().optional(),
  expectedReturnDate: z.string().datetime().optional(),
  notes: RentalSchema.shape.notes,
  gameInstanceIds: z.array(z.string().cuid()).min(1).max(10).optional(),
  status: z.enum([RentalStatus.PENDING, RentalStatus.ACTIVE, RentalStatus.RETURNED, RentalStatus.CANCELLED]).optional(),
});


// Admin API validations
export const UpdateUserSchema = UserSchema.pick({
  firstName: true,
  lastName: true,
  phone: true,
  roles: true,
  isActive: true,
  managedCenterId: true,
}).extend({
  supervisedCenterIds: z.array(z.string().cuid()).optional(),
}).partial();

export const UserListRequestSchema = z.object({
  filters: z.object({
    roles: z.array(RoleSchema).optional(),
    isActive: z.boolean().optional(),
    search: z.string().min(1).max(100).optional(),
    centerId: z.string().cuid().optional(),
  }).optional(),
});

export const AssignRoleSchema = z.object({
  userId: z.string().cuid(),
  roles: z.array(RoleSchema).min(1, 'At least one role is required'),
  managedCenterId: z.string().cuid().optional(),
  supervisedCenterIds: z.array(z.string().cuid()).optional(),
});

// Game Instance API validations  
export const CreateGameInstanceSchema = GameInstanceSchema.pick({
  gameId: true,
  centerId: true,
  status: true,
}).extend({
  notes: GameInstanceSchema.shape.notes,
});

export const UpdateGameInstancePartialSchema = GameInstanceSchema.pick({
  status: true,
  notes: true,
  expectedReturnDate: true,
}).partial();

// Coordinator API validations
export const AddGameToCenterSchema = z.object({
  gameId: GameInstanceSchema.shape.gameId,
  centerId: GameInstanceSchema.shape.centerId,
  status: GameInstanceSchema.shape.status.refine(
    (val) => val !== GameInstanceStatus.BORROWED,
    { message: "Cannot add game to center with status 'RENTED'" }
  ),
  notes: GameInstanceSchema.shape.notes,
});


// Admin Reports validation
export const ReportRequestSchema = z.object({
  type: z.enum(['rentals', 'games', 'centers', 'coordinators']),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).optional(),
  centerId: z.string().cuid().optional(),
  area: AreaSchema.optional(),
  format: z.enum(['json', 'csv', 'excel']).optional(),
});

// ===== UTILITY VALIDATIONS =====

// Common validations
export const IdSchema = z.object({
  id: z.string().cuid(),
});

export const IdParamSchema = z.object({
  id: z.string().cuid(),
});

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});


// ===== TYPE EXPORTS =====

// Export inferred types for use in components
export type CompleteGoogleProfileInput = z.infer<typeof CompleteGoogleProfileSchema>;
export type RegisterWithEmailInput = z.infer<typeof RegisterWithEmailSchema>;
export type LoginWithGoogleInput = z.infer<typeof LoginWithGoogleSchema>;
export type LinkGoogleToExistingUserInput = z.infer<typeof LinkGoogleToExistingUserSchema>;
export type LoginWithEmailInput = z.infer<typeof LoginWithEmailSchema>;
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;
export type CreateGameInput = z.infer<typeof CreateGameSchema>;
export type UpdateGameInput = z.infer<typeof UpdateGameSchema>;
export type CreateCenterInput = z.infer<typeof CreateCenterSchema>;
export type UpdateCenterInput = z.infer<typeof UpdateCenterSchema>;
export type CreateRentalInput = z.infer<typeof CreateRentalSchema>;
export type CreateManualRentalInput = z.infer<typeof CreateManualRentalSchema>;
export type UpdateRentalInput = z.infer<typeof UpdateRentalSchema>;
export type UpdateRentalByCoordinatorInput = z.infer<typeof UpdateRentalByCoordinatorSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type AddGameToCenterInput = z.infer<typeof AddGameToCenterSchema>;
export type ReportRequestInput = z.infer<typeof ReportRequestSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type CreateGameInstanceInput = z.infer<typeof CreateGameInstanceSchema>;
export type UpdateGameInstancePartialInput = z.infer<typeof UpdateGameInstancePartialSchema>;
export type IdParam = z.infer<typeof IdParamSchema>;
export type IdInput = z.infer<typeof IdSchema>;
export type AssignRoleInput = z.infer<typeof AssignRoleSchema>;
export type UserListRequestInput = z.infer<typeof UserListRequestSchema>;

