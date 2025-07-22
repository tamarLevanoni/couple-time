import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyApiResponseStructure, parseJsonResponse, createMockApiResponse, createMockPrisma } from '../utils';
import { mockData, createMockRequest, mockTokens } from '../test-helpers';
import { RentalStatus, GameInstanceStatus } from '@/types/schema';

// Import user rentals route handlers
import { GET as getUserRentals, POST as createUserRental } from '@/app/api/user/rentals/route';
import { PUT as updateUserRental } from '@/app/api/user/rentals/[id]/route';

// Mock dependencies
vi.mock('@/lib/db', () => ({ prisma: createMockPrisma() }));

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

vi.mock('@/lib/api-response', () => ({
  apiResponse: createMockApiResponse(),
}));

vi.mock('@/lib/validations', () => ({
  CreateRentalSchema: { parse: vi.fn() },
  RentalStatusSchema: { safeParse: vi.fn() },
}));

describe('GET /api/user/rentals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user rentals successfully', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    const mockRentals = [
      mockData.rental({ userId: 'user-123', status: RentalStatus.ACTIVE }),
      mockData.rental({ userId: 'user-123', status: RentalStatus.PENDING }),
      mockData.rental({ userId: 'user-123', status: RentalStatus.RETURNED }),
    ];

    vi.mocked(getToken, true).mockResolvedValue({ ...mockTokens.user, googleId: undefined });
    vi.mocked(prisma.rental.findMany, true).mockResolvedValue(mockRentals);

    const request = new NextRequest('http://localhost/api/user/rentals');
    const response = await getUserRentals(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(3);
    expect(data.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ status: RentalStatus.ACTIVE }),
      expect.objectContaining({ status: RentalStatus.PENDING }),
      expect.objectContaining({ status: RentalStatus.RETURNED }),
    ]));

    expect(prisma.rental.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
      include: expect.any(Object), // RENTAL_FOR_USER
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should filter rentals by status', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    const { RentalStatusSchema } = await import('@/lib/validations');
    
    const activeRentals = [mockData.rental({ status: RentalStatus.ACTIVE })];
    
    vi.mocked(getToken, true).mockResolvedValue({ ...mockTokens.user, googleId: undefined });
    vi.mocked(RentalStatusSchema.safeParse).mockReturnValue({ success: true, data: 'ACTIVE' });
    vi.mocked(prisma.rental.findMany, true).mockResolvedValue(activeRentals);

    const request = new NextRequest('http://localhost/api/user/rentals?status=ACTIVE');
    const response = await getUserRentals(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(true);
    expect(prisma.rental.findMany).toHaveBeenCalledWith({
      where: { 
        userId: 'user-123',
        status: 'ACTIVE',
      },
      include: expect.any(Object),
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should return 401 when not authenticated', async () => {
    const { getToken } = await import('next-auth/jwt');
    vi.mocked(getToken, true).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/user/rentals');
    const response = await getUserRentals(request);

    expect(response.status).toBe(401);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Authentication required');
  });
});

describe('POST /api/user/rentals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create rental successfully', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    const { CreateRentalSchema } = await import('@/lib/validations');
    
    const rentalData = {
      centerId: 'center-1',
      gameInstanceIds: ['gi-1', 'gi-2'],
      expectedReturnDate: new Date('2024-02-01'),
      notes: 'Test rental',
    };

    const mockGameInstances = [
      mockData.gameInstance({ id: 'gi-1', centerId: 'center-1', status: GameInstanceStatus.AVAILABLE }),
      mockData.gameInstance({ id: 'gi-2', centerId: 'center-1', status: GameInstanceStatus.AVAILABLE }),
    ];

    const newRental = mockData.rental({
      userId: 'user-123',
      centerId: 'center-1',
      status: RentalStatus.PENDING,
    });

    vi.mocked(getToken, true).mockResolvedValue({ ...mockTokens.user, googleId: undefined });
    vi.mocked(CreateRentalSchema.parse).mockReturnValue(rentalData);
    vi.mocked(prisma.gameInstance.findMany, true).mockResolvedValue(mockGameInstances);
    vi.mocked(prisma.rental.create, true).mockResolvedValue(newRental);

    const request = createMockRequest('http://localhost/api/user/rentals', 'POST', rentalData);
    const response = await createUserRental(request);

    expect(response.status).toBe(201);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(expect.objectContaining({
      userId: 'user-123',
      centerId: 'center-1',
      status: RentalStatus.PENDING,
    }));
  });

  it('should reject rental with game instances from different centers', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    const { CreateRentalSchema } = await import('@/lib/validations');
    
    const rentalData = {
      centerId: 'center-1',
      gameInstanceIds: ['gi-1', 'gi-2'],
      expectedReturnDate: new Date('2024-02-01'),
    };

    const mockGameInstances = [
      mockData.gameInstance({ id: 'gi-1', centerId: 'center-1' }),
      mockData.gameInstance({ id: 'gi-2', centerId: 'center-2' }), // Different center!
    ];

    vi.mocked(getToken, true).mockResolvedValue({ ...mockTokens.user, googleId: undefined });
    vi.mocked(CreateRentalSchema.parse).mockReturnValue(rentalData);
    vi.mocked(prisma.gameInstance.findMany, true).mockResolvedValue(mockGameInstances);

    const request = createMockRequest('http://localhost/api/user/rentals', 'POST', rentalData);
    const response = await createUserRental(request);

    expect(response.status).toBe(400);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
    expect(data.error.message).toContain('must belong to the same center');
  });

  it('should reject rental with unavailable game instances', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    const { CreateRentalSchema } = await import('@/lib/validations');
    
    const rentalData = {
      centerId: 'center-1',
      gameInstanceIds: ['gi-1'],
      expectedReturnDate: new Date('2024-02-01'),
    };

    const mockGameInstances = [
      mockData.gameInstance({ 
        id: 'gi-1', 
        centerId: 'center-1', 
        status: GameInstanceStatus.BORROWED // Not available!
      }),
    ];

    vi.mocked(getToken, true).mockResolvedValue({ ...mockTokens.user, googleId: undefined });
    vi.mocked(CreateRentalSchema.parse).mockReturnValue(rentalData);
    vi.mocked(prisma.gameInstance.findMany, true).mockResolvedValue(mockGameInstances);

    const request = createMockRequest('http://localhost/api/user/rentals', 'POST', rentalData);
    const response = await createUserRental(request);

    expect(response.status).toBe(400);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(false);
    expect(data.error.message).toContain('not available');
  });

  it('should reject rental with duplicate game instances', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    const { CreateRentalSchema } = await import('@/lib/validations');
    
    const rentalData = {
      centerId: 'center-1',
      gameInstanceIds: ['gi-1', 'gi-1'], // Duplicate!
      expectedReturnDate: new Date('2024-02-01'),
    };

    vi.mocked(getToken, true).mockResolvedValue({ ...mockTokens.user, googleId: undefined });
    vi.mocked(CreateRentalSchema.parse).mockReturnValue(rentalData);

    const request = createMockRequest('http://localhost/api/user/rentals', 'POST', rentalData);
    const response = await createUserRental(request);

    expect(response.status).toBe(400);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(false);
    expect(data.error.message).toContain('duplicate');
  });
});

describe('PUT /api/user/rentals/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should cancel pending rental successfully', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    const existingRental = mockData.rental({
      id: 'rental-123',
      userId: 'user-123',
      status: RentalStatus.PENDING,
    });

    const cancelledRental = { ...existingRental, status: RentalStatus.CANCELLED };

    vi.mocked(getToken, true).mockResolvedValue({ ...mockTokens.user, googleId: undefined });
    vi.mocked(prisma.rental.findFirst, true).mockResolvedValue(existingRental);
    vi.mocked(prisma.rental.update, true).mockResolvedValue(cancelledRental);

    const request = createMockRequest('http://localhost/api/user/rentals/rental-123', 'PUT', {
      action: 'cancel',
    });
    const response = await updateUserRental(request, { params: { id: 'rental-123' } });

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe(RentalStatus.CANCELLED);

    expect(prisma.rental.update).toHaveBeenCalledWith({
      where: { id: 'rental-123' },
      data: { status: RentalStatus.CANCELLED },
      include: expect.any(Object),
    });
  });

  it('should reject cancellation of active rental', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    const activeRental = mockData.rental({
      id: 'rental-123',
      userId: 'user-123',
      status: RentalStatus.ACTIVE, // Cannot cancel active rental
    });

    vi.mocked(getToken, true).mockResolvedValue({ ...mockTokens.user, googleId: undefined });
    vi.mocked(prisma.rental.findFirst, true).mockResolvedValue(activeRental);

    const request = createMockRequest('http://localhost/api/user/rentals/rental-123', 'PUT', {
      action: 'cancel',
    });
    const response = await updateUserRental(request, { params: { id: 'rental-123' } });

    expect(response.status).toBe(400);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
    expect(data.error.message).toContain('Cannot cancel');
  });

  it('should handle database errors gracefully', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    vi.mocked(getToken, true).mockResolvedValue({ ...mockTokens.user, googleId: undefined });
    vi.mocked(prisma.rental.findFirst, true).mockRejectedValue(new Error('Database error'));

    const request = createMockRequest('http://localhost/api/user/rentals/rental-123', 'PUT', {
      action: 'cancel',
    });
    const response = await updateUserRental(request, { params: { id: 'rental-123' } });

    expect(response.status).toBe(500);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
  });
});