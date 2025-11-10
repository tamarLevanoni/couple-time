import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyApiResponseStructure, parseJsonResponse, createMockApiResponse, createMockPrisma } from '../utils';
import { mockData, mockTokens } from '../test-helpers';
import { RentalStatus, Area } from '@/types/schema';

// Import coordinator dashboard route handler
import { GET as getCoordinatorDashboard } from '@/app/api/coordinator/route';

// Mock dependencies
vi.mock('@/lib/db', () => ({ prisma: createMockPrisma() }));

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

vi.mock('@/lib/api-response', () => ({
  apiResponse: createMockApiResponse(),
}));

describe('GET /api/coordinator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return coordinator dashboard successfully', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    const coordinatorId = 'coordinator-1';
    const mockCenter = mockData.centerWithRelations({
      id: 'center-1',
      name: 'Test Center',
      area: Area.NORTH,
      coordinatorId,
      superCoordinator: {
        id: 'super-1',
        name: 'Super Coordinator',
        email: 'super@example.com',
        phone: '050-1111111',
      },
      rentals: [
        mockData.rental({ status: RentalStatus.PENDING, centerId: 'center-1' }),
        mockData.rental({ status: RentalStatus.PENDING, centerId: 'center-1' }),
        mockData.rental({ status: RentalStatus.ACTIVE, centerId: 'center-1' }),
        mockData.rental({ status: RentalStatus.ACTIVE, centerId: 'center-1' }),
        mockData.rental({ status: RentalStatus.RETURNED, centerId: 'center-1' }),
      ],
    });

    vi.mocked(getToken, true).mockResolvedValue(mockTokens.coordinator);
    vi.mocked(prisma.center.findFirst, true).mockResolvedValue(mockCenter);

    const request = new NextRequest('http://localhost/api/coordinator');
    const response = await getCoordinatorDashboard(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
    
    expect(data.data).toEqual(expect.objectContaining({
      center: expect.objectContaining({
        id: 'center-1',
        name: 'Test Center',
        area: Area.NORTH,
      }),
      superCoordinator: expect.objectContaining({
        id: 'super-1',
        name: 'Super Coordinator',
      }),
      pendingRentals: expect.arrayContaining([
        expect.objectContaining({ status: RentalStatus.PENDING }),
        expect.objectContaining({ status: RentalStatus.PENDING }),
      ]),
      activeRentals: expect.arrayContaining([
        expect.objectContaining({ status: RentalStatus.ACTIVE }),
        expect.objectContaining({ status: RentalStatus.ACTIVE }),
      ]),
    }));

    // Verify that pendingRentals and activeRentals are separated correctly
    expect(data.data.pendingRentals).toHaveLength(2);
    expect(data.data.activeRentals).toHaveLength(2);
    
    // Verify that returned rentals are not included in dashboard
    expect(data.data.pendingRentals.every((r: any) => r.status === RentalStatus.PENDING)).toBe(true);
    expect(data.data.activeRentals.every((r: any) => r.status === RentalStatus.ACTIVE)).toBe(true);

    expect(prisma.center.findFirst).toHaveBeenCalledWith({
      where: {
        coordinatorId,
        isActive: true,
      },
      include: expect.any(Object), // COORDINATOR_DASHBOARD
    });
  });

  it('should return 401 when not authenticated', async () => {
    const { getToken } = await import('next-auth/jwt');
    vi.mocked(getToken, true).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/coordinator');
    const response = await getCoordinatorDashboard(request);

    expect(response.status).toBe(401);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Authentication required');
  });

  it('should return 404 when coordinator has no center', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    vi.mocked(getToken, true).mockResolvedValue(mockTokens.coordinator);
    vi.mocked(prisma.center.findFirst, true).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/coordinator');
    const response = await getCoordinatorDashboard(request);

    expect(response.status).toBe(404);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('No center found for this coordinator');
  });

  it('should handle center without super coordinator', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    const coordinatorId = 'coordinator-1';
    const mockCenter = mockData.centerWithRelations({
      id: 'center-1',
      name: 'Test Center',
      area: Area.CENTER,
      coordinatorId,
      superCoordinator: null, // No super coordinator assigned
      rentals: [],
    });

    vi.mocked(getToken, true).mockResolvedValue(mockTokens.coordinator);
    vi.mocked(prisma.center.findFirst, true).mockResolvedValue(mockCenter);

    const request = new NextRequest('http://localhost/api/coordinator');
    const response = await getCoordinatorDashboard(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(true);
    expect(data.data.superCoordinator).toBeUndefined();
    expect(data.data.center).toEqual(expect.objectContaining({
      id: 'center-1',
      name: 'Test Center',
    }));
  });

  it('should only return rentals for coordinator center', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    const coordinatorId = 'coordinator-1';
    const mockCenter = mockData.centerWithRelations({
      id: 'center-1',
      name: 'Test Center',
      area: Area.SOUTH,
      coordinatorId,
      superCoordinator: null,
      rentals: [
        mockData.rental({ status: RentalStatus.PENDING, centerId: 'center-1' }),
      ],
    });

    vi.mocked(getToken, true).mockResolvedValue(mockTokens.coordinator);
    vi.mocked(prisma.center.findFirst, true).mockResolvedValue(mockCenter);

    const request = new NextRequest('http://localhost/api/coordinator');
    const response = await getCoordinatorDashboard(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(true);
    
    // Verify that the query correctly filters by coordinatorId and isActive
    expect(prisma.center.findFirst).toHaveBeenCalledWith({
      where: {
        coordinatorId,
        isActive: true,
      },
      include: expect.any(Object),
    });
  });

  it('should handle database errors gracefully', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    vi.mocked(getToken, true).mockResolvedValue(mockTokens.coordinator);
    vi.mocked(prisma.center.findFirst, true).mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost/api/coordinator');
    const response = await getCoordinatorDashboard(request);

    expect(response.status).toBe(500);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Internal server error');
  });

  it('should return empty arrays when center has no rentals', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    const coordinatorId = 'coordinator-1';
    const mockCenter = mockData.centerWithRelations({
      id: 'center-1',
      name: 'Test Center',
      area: Area.CENTER,
      coordinatorId,
      superCoordinator: null,
      rentals: [], // No rentals
    });

    vi.mocked(getToken, true).mockResolvedValue(mockTokens.coordinator);
    vi.mocked(prisma.center.findFirst, true).mockResolvedValue(mockCenter);

    const request = new NextRequest('http://localhost/api/coordinator');
    const response = await getCoordinatorDashboard(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(true);
    expect(data.data.pendingRentals).toEqual([]);
    expect(data.data.activeRentals).toEqual([]);
  });
});