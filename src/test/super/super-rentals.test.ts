import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyApiResponseStructure, parseJsonResponse, createMockApiResponse, createMockPrisma } from '../utils';
import { mockData, mockTokens, createMockRequest } from '../test-helpers';
import { RentalStatus } from '@/types/schema';

// Import super rentals route handlers
import { GET as getSuperRentals } from '@/app/api/super/rentals/route';
import { PUT as updateSuperRental } from '@/app/api/super/rentals/[id]/route';

// Mock dependencies
vi.mock('@/lib/db', () => ({ prisma: createMockPrisma() }));
vi.mock('next-auth/jwt', () => ({ getToken: vi.fn() }));
vi.mock('@/lib/api-response', () => ({ apiResponse: createMockApiResponse() }));
vi.mock('@/lib/permissions', () => ({ assertSuperCoordinatorRole: vi.fn() }));

describe('GET /api/super/rentals', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return rentals for super coordinator centers', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    const mockRentals = [
      mockData.rental({ status: RentalStatus.PENDING }),
      mockData.rental({ status: RentalStatus.ACTIVE }),
    ];
    
    vi.mocked(getToken, true).mockResolvedValue(mockTokens.superCoordinator);
    vi.mocked(prisma.rental.findMany, true).mockResolvedValue(mockRentals);

    const request = new NextRequest('http://localhost/api/super/rentals');
    const response = await getSuperRentals(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(prisma.rental.findMany).toHaveBeenCalledWith({
      where: { center: { superCoordinatorId: 'super-1' } },
      include: expect.any(Object),
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should return 401 when not authenticated', async () => {
    const { getToken } = await import('next-auth/jwt');
    vi.mocked(getToken, true).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/super/rentals');
    const response = await getSuperRentals(request);

    expect(response.status).toBe(401);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Authentication required');
  });
});

describe('PUT /api/super/rentals/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should update rental status successfully', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    const existingRental = mockData.rental({ 
      id: 'rental-1',
      status: RentalStatus.PENDING,
    });
    const updatedRental = { 
      ...existingRental, 
      status: RentalStatus.ACTIVE,
    };

    vi.mocked(getToken, true).mockResolvedValue(mockTokens.superCoordinator);
    vi.mocked(prisma.rental.findFirst, true).mockResolvedValue(existingRental);
    vi.mocked(prisma.rental.update, true).mockResolvedValue(updatedRental);

    const request = createMockRequest('http://localhost/api/super/rentals/rental-1', 'PUT', {
      action: 'approve',
    });
    const response = await updateSuperRental(request, { params: { id: 'rental-1' } });

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe(RentalStatus.ACTIVE);
  });

  it('should return 404 for rental not in super coordinator centers', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    vi.mocked(getToken, true).mockResolvedValue(mockTokens.superCoordinator);
    vi.mocked(prisma.rental.findFirst, true).mockResolvedValue(null);

    const request = createMockRequest('http://localhost/api/super/rentals/other-rental', 'PUT', {
      action: 'approve',
    });
    const response = await updateSuperRental(request, { params: { id: 'other-rental' } });

    expect(response.status).toBe(404);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(false);
  });
});