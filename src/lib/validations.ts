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
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^[\d\-\+\(\)\s]+$/, 'Invalid phone format').min(9).max(15),
  roles: z.array(RoleSchema).min(1, 'At least one role is required'),
  managedCenterIds: z.array(z.string().cuid()),
  supervisedCenterIds: z.array(z.string().cuid()),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Optional auth fields
  googleId: z.string().optional(),
  password: z.string().optional(),
  image: z.string().url().optional(),
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
  category: GameCategorySchema,
  targetAudience: TargetAudienceSchema,
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
export const UpdateUserProfileSchema = UserSchema.pick({
  name: true,
  phone: true,
}).partial();

// Game API validations
export const CreateGameSchema = GameSchema.pick({
  name: true,
  category: true,
  targetAudience: true,
}).extend({
  description: GameSchema.shape.description,
  imageUrl: GameSchema.shape.imageUrl,
});

export const GameCatalogRequestSchema = z.object({
  centerId: z.string().cuid().optional(),
  filters: z.object({
    category: GameCategorySchema.optional(),
    targetAudience: TargetAudienceSchema.optional(),
    centerId: z.string().cuid().optional(),
    status: GameInstanceStatusSchema.optional(),
    search: z.string().min(1).max(100).optional(),
  }).optional(),
});

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

export const CenterListRequestSchema = z.object({
  filters: z.object({
    area: AreaSchema.optional(),
    city: z.string().min(1).max(50).optional(),
    isActive: z.boolean().optional(),
    hasCoordinator: z.boolean().optional(),
    search: z.string().min(1).max(100).optional(),
  }).optional(),
});

// Rental API validations
export const CreateRentalSchema = z.object({
  gameInstanceIds: z.array(z.string().cuid()).min(1, "At least one game instance is required").max(10, "Maximum 10 games per rental"),
  notes: z.string().max(500).optional(),
});

export const CreateManualRentalSchema = z.object({
  userId: z.string().cuid(),
  gameInstanceIds: z.array(z.string().cuid()).min(1, "At least one game instance is required").max(10, "Maximum 10 games per rental"),
  expectedReturnDate: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

export const UpdateRentalSchema = RentalSchema.pick({
  status: true,
  notes: true,
}).extend({
  expectedReturnDate: z.string().datetime().optional(),
}).partial();

export const RentalListRequestSchema = z.object({
  filters: z.object({
    userId: z.string().cuid().optional(),
    centerId: z.string().cuid().optional(),
    status: RentalStatusSchema.optional(),
    overdue: z.boolean().optional(),
    dateRange: z.object({
      start: z.date(),
      end: z.date(),
    }).optional(),
  }).optional(),
});

// Admin API validations
export const UpdateUserSchema = UserSchema.pick({
  name: true,
  phone: true,
  roles: true,
  isActive: true,
  managedCenterIds: true,
  supervisedCenterIds: true,
}).partial();

export const UserListRequestSchema = z.object({
  filters: z.object({
    roles: z.array(RoleSchema).optional(),
    isActive: z.boolean().optional(),
    search: z.string().min(1).max(100).optional(),
    centerId: z.string().cuid().optional(),
  }).optional(),
});

// Coordinator API validations
export const AddGameToCenterSchema = z.object({
  gameId: z.string().cuid(),
});

// Super Coordinator API validations
export const OverdueReportRequestSchema = z.object({
  centerId: z.string().cuid().optional(),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).optional(),
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
export const IdParamSchema = z.object({
  id: z.string().cuid(),
});

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

// Bulk operations
export const BulkUpdateSchema = z.object({
  items: z.array(z.object({
    id: z.string().cuid(),
    data: z.record(z.any()),
  })).min(1).max(100),
});

// File upload
export const FileUploadSchema = z.object({
  type: z.enum(['game_image', 'center_image', 'document']),
});

// Search and filters
export const SearchSchema = z.object({
  query: z.string().min(1).max(100),
  filters: z.record(z.any()).optional(),
});

// Date range validation
export const DateRangeSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
}).refine(
  (data) => new Date(data.start) < new Date(data.end),
  { message: "Start date must be before end date" }
);

// ===== COMPUTED FIELD VALIDATIONS =====

// For API responses with computed fields
export const RentalWithDetailsSchema = RentalSchema.extend({
  isOverdue: z.boolean(),
  daysOverdue: z.number().int().min(0),
  canCancel: z.boolean(),
  canReturn: z.boolean(),
});

export const CenterWithStatsSchema = CenterSchema.extend({
  totalGames: z.number().int().min(0),
  availableGames: z.number().int().min(0),
  pendingRequests: z.number().int().min(0),
  activeRentals: z.number().int().min(0),
  overdueRentals: z.number().int().min(0),
});

export const GameWithAvailabilitySchema = GameSchema.extend({
  totalCenters: z.number().int().min(0),
  availableCount: z.number().int().min(0),
  borrowedCount: z.number().int().min(0),
  availableCenters: z.array(z.object({
    centerId: z.string().cuid(),
    centerName: z.string(),
    city: z.string(),
    area: AreaSchema,
    availableCount: z.number().int().min(0),
  })),
});

// ===== TYPE EXPORTS =====

// Export inferred types for use in components
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;
export type CreateGameInput = z.infer<typeof CreateGameSchema>;
export type CreateCenterInput = z.infer<typeof CreateCenterSchema>;
export type UpdateCenterInput = z.infer<typeof UpdateCenterSchema>;
export type CreateRentalInput = z.infer<typeof CreateRentalSchema>;
export type CreateManualRentalInput = z.infer<typeof CreateManualRentalSchema>;
export type UpdateRentalInput = z.infer<typeof UpdateRentalSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type AddGameToCenterInput = z.infer<typeof AddGameToCenterSchema>;
export type ReportRequestInput = z.infer<typeof ReportRequestSchema>;
export type IdParam = z.infer<typeof IdParamSchema>;
export type SearchInput = z.infer<typeof SearchSchema>;
export type DateRangeInput = z.infer<typeof DateRangeSchema>;