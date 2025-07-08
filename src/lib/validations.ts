import { z } from 'zod';

// ===== ENUMS =====
export const RoleSchema = z.enum(['USER', 'CENTER_COORDINATOR', 'SUPER_COORDINATOR', 'ADMIN']);
export const TargetAudienceSchema = z.enum(['SINGLES', 'MARRIED', 'GENERAL']);
export const GameInstanceStatusSchema = z.enum(['AVAILABLE', 'BORROWED', 'UNAVAILABLE']);
export const RentalStatusSchema = z.enum(['PENDING', 'APPROVED', 'ACTIVE', 'RETURNED', 'REJECTED']);
export const GameCategorySchema = z.enum(['COMMUNICATION', 'INTIMACY', 'FUN', 'THERAPY', 'PERSONAL_DEVELOPMENT']);
export const AreaSchema = z.enum(['NORTH', 'CENTER', 'SOUTH', 'JERUSALEM', 'JUDEA_SAMARIA']);

// ===== SHARED SCHEMAS =====
export const IdSchema = z.string().cuid();
export const EmailSchema = z.string().email('כתובת דוא"ל לא תקינה');
export const PhoneSchema = z.string().regex(/^05\d{8}$/, 'מספר טלפון לא תקין (צריך להתחיל ב-05 ולהכיל 10 ספרות)').optional();

// ===== USER SCHEMAS =====
export const CreateUserSchema = z.object({
  name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים').max(100, 'שם לא יכול להכיל יותר מ-100 תווים'),
  email: EmailSchema,
  phone: PhoneSchema,
  password: z.string().min(6, 'סיסמה חייבת להכיל לפחות 6 תווים').optional(),
  roles: z.array(RoleSchema).default(['USER']),
  managedCenterIds: z.array(IdSchema).default([]),
  supervisedCenterIds: z.array(IdSchema).default([]),
  defaultDashboard: z.string().optional(),
});

export const UpdateUserSchema = CreateUserSchema.partial().extend({
  id: IdSchema,
});

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'סיסמה נדרשת'),
});

// ===== CENTER SCHEMAS =====
export const CreateCenterSchema = z.object({
  name: z.string().min(2, 'שם מרכז חייב להכיל לפחות 2 תווים').max(100, 'שם מרכז לא יכול להכיל יותר מ-100 תווים'),
  city: z.string().min(2, 'שם עיר חייב להכיל לפחות 2 תווים').max(50, 'שם עיר לא יכול להכיל יותר מ-50 תווים'),
  area: AreaSchema,
  coordinatorId: IdSchema.optional(),
  superCoordinatorId: IdSchema.optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
});

export const UpdateCenterSchema = CreateCenterSchema.partial().extend({
  id: IdSchema,
});

// ===== GAME SCHEMAS =====
export const CreateGameSchema = z.object({
  name: z.string().min(2, 'שם משחק חייב להכיל לפחות 2 תווים').max(100, 'שם משחק לא יכול להכיל יותר מ-100 תווים'),
  description: z.string().max(1000, 'תיאור לא יכול להכיל יותר מ-1000 תווים').optional(),
  category: GameCategorySchema,
  targetAudience: TargetAudienceSchema,
  imageUrl: z.string().url('כתובת תמונה לא תקינה').optional(),
});

export const UpdateGameSchema = CreateGameSchema.partial().extend({
  id: IdSchema,
});

// ===== GAME INSTANCE SCHEMAS =====
export const CreateGameInstanceSchema = z.object({
  gameId: IdSchema,
  centerId: IdSchema,
  status: GameInstanceStatusSchema.default('AVAILABLE'),
  expectedReturnDate: z.coerce.date().optional(),
  notes: z.string().max(500, 'הערות לא יכולות להכיל יותר מ-500 תווים').optional(),
});

export const UpdateGameInstanceSchema = CreateGameInstanceSchema.partial().extend({
  id: IdSchema,
});

// ===== RENTAL SCHEMAS =====
export const CreateRentalSchema = z.object({
  userId: IdSchema.optional(), // Optional for guest rentals
  gameInstanceId: IdSchema,
  expectedReturnDate: z.coerce.date().optional(),
  notes: z.string().max(500, 'הערות לא יכולות להכיל יותר מ-500 תווים').optional(),
});

export const UpdateRentalSchema = z.object({
  id: IdSchema,
  status: RentalStatusSchema.optional(),
  approvedDate: z.coerce.date().optional(),
  borrowDate: z.coerce.date().optional(),
  returnDate: z.coerce.date().optional(),
  expectedReturnDate: z.coerce.date().optional(),
  notes: z.string().max(500, 'הערות לא יכולות להכיל יותר מ-500 תווים').optional(),
  rejectionReason: z.string().max(500, 'סיבת דחייה לא יכולה להכיל יותר מ-500 תווים').optional(),
});

// ===== GUEST RENTAL SCHEMA =====
export const GuestRentalSchema = z.object({
  // User data for auto-registration
  name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים').max(100, 'שם לא יכול להכיל יותר מ-100 תווים'),
  email: EmailSchema,
  phone: PhoneSchema,
  
  // Rental data
  gameInstanceId: IdSchema,
  expectedReturnDate: z.coerce.date().optional(),
  notes: z.string().max(500, 'הערות לא יכולות להכיל יותר מ-500 תווים').optional(),
});

// ===== QUERY PARAMETER SCHEMAS =====
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const GameFiltersSchema = z.object({
  category: GameCategorySchema.optional(),
  targetAudience: TargetAudienceSchema.optional(),
  search: z.string().optional(),
}).merge(PaginationSchema);

export const RentalFiltersSchema = z.object({
  status: RentalStatusSchema.optional(),
  userId: IdSchema.optional(),
  centerId: IdSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).merge(PaginationSchema);

// ===== TYPE EXPORTS =====
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type Login = z.infer<typeof LoginSchema>;

export type CreateCenter = z.infer<typeof CreateCenterSchema>;
export type UpdateCenter = z.infer<typeof UpdateCenterSchema>;

export type CreateGame = z.infer<typeof CreateGameSchema>;
export type UpdateGame = z.infer<typeof UpdateGameSchema>;

export type CreateGameInstance = z.infer<typeof CreateGameInstanceSchema>;
export type UpdateGameInstance = z.infer<typeof UpdateGameInstanceSchema>;

export type CreateRental = z.infer<typeof CreateRentalSchema>;
export type UpdateRental = z.infer<typeof UpdateRentalSchema>;
export type GuestRental = z.infer<typeof GuestRentalSchema>;

export type GameFilters = z.infer<typeof GameFiltersSchema>;
export type RentalFilters = z.infer<typeof RentalFiltersSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;

// ===== VALIDATION HELPER FUNCTIONS =====
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return {
      success: false,
      errors: ['שגיאה בתיקוף נתונים']
    };
  }
}

export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => {
    const result = validateSchema(schema, data);
    if (!result.success) {
      throw new Error(`Validation failed: ${result.errors.join(', ')}`);
    }
    return result.data;
  };
}