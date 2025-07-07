import { z } from 'zod';
import { GameCategory, TargetAudience, Area, RentalStatus, GameInstanceStatus, Role } from '@prisma/client';

// Game validations
export const createGameSchema = z.object({
  name: z.string().min(1, 'שם המשחק נדרש').max(255, 'שם המשחק ארוך מדי'),
  description: z.string().optional(),
  categories: z.array(z.nativeEnum(GameCategory)).min(1, 'נדרש לפחות קטגוריה אחת'),
  targetAudiences: z.array(z.nativeEnum(TargetAudience)).min(1, 'נדרש לפחות קהל יעד אחד'),
  imageUrl: z.string().url('כתובת תמונה לא תקינה').optional(),
  isActive: z.boolean().default(true),
});

export const updateGameSchema = createGameSchema.partial();

export const gameQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  categories: z.string().optional(), // comma-separated categories
  targetAudiences: z.string().optional(), // comma-separated audiences
  centerId: z.string().optional(),
  availability: z.enum(['available', 'borrowed', 'unavailable', 'all']).default('all'),
  sortBy: z.enum(['name', 'createdAt', 'availableCount']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Center validations
export const createCenterSchema = z.object({
  name: z.string().min(1, 'שם המוקד נדרש').max(255, 'שם המוקד ארוך מדי'),
  city: z.string().min(1, 'עיר נדרשת').max(100, 'שם העיר ארוך מדי'),
  area: z.nativeEnum(Area, { required_error: 'אזור נדרש' }),
  coordinatorId: z.string().optional(),
  superCoordinatorId: z.string().optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
  isActive: z.boolean().default(true),
});

export const updateCenterSchema = createCenterSchema.partial();

export const centerQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  area: z.nativeEnum(Area).optional(),
  hasCoordinator: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'city', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Rental validations
export const createRentalSchema = z.object({
  gameInstanceId: z.string().min(1, 'זיהוי משחק נדרש'),
  expectedReturnDate: z.string().transform((str) => new Date(str)).optional(),
  notes: z.string().max(500, 'הערות ארוכות מדי').optional(),
});

export const updateRentalSchema = z.object({
  status: z.nativeEnum(RentalStatus).optional(),
  borrowDate: z.string().transform((str) => new Date(str)).optional(),
  returnDate: z.string().transform((str) => new Date(str)).optional(),
  expectedReturnDate: z.string().transform((str) => new Date(str)).optional(),
  notes: z.string().max(500, 'הערות ארוכות מדי').optional(),
  rejectionReason: z.string().max(500, 'סיבת דחייה ארוכה מדי').optional(),
});

export const rentalQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(), // comma-separated statuses
  centerId: z.string().optional(),
  gameId: z.string().optional(),
  userId: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z.enum(['requestDate', 'borrowDate', 'expectedReturnDate', 'status']).default('requestDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// User validations
export const updateUserSchema = z.object({
  name: z.string().min(1, 'שם נדרש').max(255, 'שם ארוך מדי').optional(),
  email: z.string().email('כתובת אימייל לא תקינה').optional(),
  phone: z.string().max(20, 'מספר טלפון ארוך מדי').optional(),
  roles: z.array(z.nativeEnum(Role)).optional(),
  managedCenterIds: z.array(z.string()).optional(),
  supervisedCenterIds: z.array(z.string()).optional(),
  defaultDashboard: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const userQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  roles: z.string().optional(), // comma-separated roles
  isActive: z.coerce.boolean().optional(),
  centerId: z.string().optional(), // filter by managed/supervised center
  sortBy: z.enum(['name', 'email', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Game Instance validations
export const createGameInstanceSchema = z.object({
  gameId: z.string().min(1, 'זיהוי משחק נדרש'),
  centerId: z.string().min(1, 'זיהוי מוקד נדרש'),
  status: z.nativeEnum(GameInstanceStatus).default(GameInstanceStatus.AVAILABLE),
  notes: z.string().max(500, 'הערות ארוכות מדי').optional(),
});

export const updateGameInstanceSchema = z.object({
  status: z.nativeEnum(GameInstanceStatus).optional(),
  expectedReturnDate: z.string().transform((str) => new Date(str)).optional(),
  notes: z.string().max(500, 'הערות ארוכות מדי').optional(),
});

// Common validation helpers
export function parseCommaSeparatedEnum<T extends Record<string, string>>(
  value: string | undefined,
  enumObject: T
): Array<T[keyof T]> | undefined {
  if (!value) return undefined;
  
  const values = value.split(',').map(v => v.trim());
  const enumValues = Object.values(enumObject);
  
  return values.filter(v => enumValues.includes(v as any)) as Array<T[keyof T]>;
}

export function parseCommaSeparatedStrings(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  return value.split(',').map(v => v.trim()).filter(v => v.length > 0);
}