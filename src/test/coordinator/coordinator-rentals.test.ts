import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyApiResponseStructure, parseJsonResponse, createMockApiResponse, createMockPrisma } from '../utils';
import { mockData, createMockRequest, mockTokens } from '../test-helpers';
import { RentalStatus } from '@/types/schema';

// Import coordinator rentals route handlers
import { GET as getCoordinatorRentals, POST as createManualRental } from '@/app/api/coordinator/rentals/route';
import { PUT as updateCoordinatorRental } from '@/app/api/coordinator/rentals/[id]/route';

// Mock dependencies
vi.mock('@/lib/db', () => ({ prisma: createMockPrisma() }));
vi.mock('next-auth/jwt', () => ({ getToken: vi.fn() }));
vi.mock('@/lib/api-response', () => ({ apiResponse: createMockApiResponse() }));
vi.mock('@/lib/validations', () => ({
  CreateManualRentalSchema: { parse: vi.fn() },
  RentalStatusSchema: { safeParse: vi.fn() },
}));

describe('GET /api/coordinator/rentals', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return rentals for coordinator center', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    const mockRentals = [
      mockData.rental({ status: RentalStatus.PENDING }),
      mockData.rental({ status: RentalStatus.ACTIVE }),
    ];

    vi.mocked(getToken, true).mockResolvedValue(mockTokens.coordinator);
    vi.mocked(prisma.rental.findMany, true).mockResolvedValue(mockRentals);

    const request = new NextRequest('http://localhost/api/coordinator/rentals');
    const response = await getCoordinatorRentals(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(prisma.rental.findMany).toHaveBeenCalledWith({
      where: { center: { coordinatorId: 'coordinator-1' } },
      include: expect.any(Object),
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should return 401 when not authenticated', async () => {
    const { getToken } = await import('next-auth/jwt');
    vi.mocked(getToken, true).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/coordinator/rentals');
    const response = await getCoordinatorRentals(request);

    expect(response.status).toBe(401);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Authentication required');
  });
});

describe('POST /api/coordinator/rentals', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should create manual rental successfully', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    const { CreateManualRentalSchema } = await import('@/lib/validations');
    
    const rentalData = {
      userId: 'user-1',
      centerId: 'center-1',
      borrowDate: new Date('2024-01-01'),
      gameInstanceIds: ['gi-1'],
      expectedReturnDate: new Date('2024-02-01'),
    };

    const newRental = mockData.rental(rentalData);

    vi.mocked(getToken, true).mockResolvedValue(mockTokens.coordinator);
    vi.mocked(CreateManualRentalSchema.parse).mockReturnValue(rentalData);
    vi.mocked(prisma.rental.create, true).mockResolvedValue(newRental);

    const request = createMockRequest('http://localhost/api/coordinator/rentals', 'POST', rentalData);
    const response = await createManualRental(request);

    expect(response.status).toBe(201);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(true);
  });
});

describe('PUT /api/coordinator/rentals/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should approve pending rental successfully', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    const existingRental = mockData.rental({ status: RentalStatus.PENDING });
    const approvedRental = { ...existingRental, status: RentalStatus.ACTIVE };

    vi.mocked(getToken, true).mockResolvedValue(mockTokens.coordinator);
    vi.mocked(prisma.rental.findFirst, true).mockResolvedValue(existingRental);
    vi.mocked(prisma.rental.update, true).mockResolvedValue(approvedRental);

    const request = createMockRequest('http://localhost/api/coordinator/rentals/rental-1', 'PUT', {
      action: 'approve',
    });
    const response = await updateCoordinatorRental(request, { params: { id: 'rental-1' } });

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe(RentalStatus.ACTIVE);
  });

  it('should return 404 for rental not in coordinator center', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    vi.mocked(getToken, true).mockResolvedValue(mockTokens.coordinator);
    vi.mocked(prisma.rental.findFirst, true).mockResolvedValue(null);

    const request = createMockRequest('http://localhost/api/coordinator/rentals/other-rental', 'PUT', {
      action: 'approve',
    });
    const response = await updateCoordinatorRental(request, { params: { id: 'other-rental' } });

    expect(response.status).toBe(404);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(false);
  });
});