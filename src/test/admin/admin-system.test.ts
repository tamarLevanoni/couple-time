import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyApiResponseStructure, parseJsonResponse, createMockApiResponse, createMockPrisma } from '../utils';
import { mockTokens } from '../test-helpers';

// Import admin system route handler
import { GET as getSystemStats } from '@/app/api/admin/system/route';

// Mock dependencies
vi.mock('@/lib/db', () => ({ prisma: createMockPrisma() }));
vi.mock('next-auth/jwt', () => ({ getToken: vi.fn() }));
vi.mock('@/lib/api-response', () => ({ apiResponse: createMockApiResponse() }));
vi.mock('@/lib/permissions', () => ({ assertAdminRole: vi.fn() }));

describe('GET /api/admin/system', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return system statistics for admin', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    vi.mocked(getToken, true).mockResolvedValue(mockTokens.admin);

    // Mock all count queries - the route makes many count calls in Promise.all
    vi.mocked(prisma.user.count, true)
      .mockResolvedValueOnce(10) // totalUsers
      .mockResolvedValueOnce(8)  // activeUsers
      .mockResolvedValueOnce(2); // newUsers (last call in recentActivity)

    vi.mocked(prisma.center.count, true)
      .mockResolvedValueOnce(5)  // totalCenters
      .mockResolvedValueOnce(4)  // activeCenters
      .mockResolvedValueOnce(1); // newCenters (last call in recentActivity)

    vi.mocked(prisma.game.count, true).mockResolvedValue(20); // totalGames
    vi.mocked(prisma.gameInstance.count, true)
      .mockResolvedValueOnce(50) // totalGameInstances
      .mockResolvedValueOnce(15); // borrowedGameInstances

    vi.mocked(prisma.rental.count, true)
      .mockResolvedValueOnce(100) // totalRentals
      .mockResolvedValueOnce(20)  // activeRentals
      .mockResolvedValueOnce(15)  // pendingRentals
      .mockResolvedValueOnce(5);  // newRentals (last call in recentActivity)

    // Mock groupBy and findMany operations - Prisma's types are too complex for direct casting
    // Use unknown intermediate cast as TypeScript suggests
    type UserGroupByResult = { roles: string[], _count: { id: number } }[];
    type RentalGroupByResult = { status: string, _count: { id: number } }[];
    type CenterGroupByResult = { area: string, _count: { id: number } }[];
    type GameCategoriesOnly = { categories: string[] }[];

    (prisma.user.groupBy as unknown as MockedFunction<() => Promise<UserGroupByResult>>)
      .mockResolvedValue([
        { roles: ['ADMIN'], _count: { id: 2 } },
        { roles: ['CENTER_COORDINATOR'], _count: { id: 3 } },
      ]);

    (prisma.rental.groupBy as unknown as MockedFunction<() => Promise<RentalGroupByResult>>)
      .mockResolvedValue([
        { status: 'PENDING', _count: { id: 15 } },
        { status: 'ACTIVE', _count: { id: 20 } },
      ]);

    (prisma.center.groupBy as unknown as MockedFunction<() => Promise<CenterGroupByResult>>)
      .mockResolvedValue([
        { area: 'NORTH', _count: { id: 2 } },
        { area: 'CENTER', _count: { id: 2 } },
      ]);

    // Mock findMany for games categories - route uses select: { categories: true }
    (prisma.game.findMany as unknown as MockedFunction<() => Promise<GameCategoriesOnly>>)
      .mockResolvedValue([
        { categories: ['THERAPY', 'COMMUNICATION'] },
        { categories: ['FUN'] },
      ]);

    const request = new NextRequest('http://localhost/api/admin/system');
    const response = await getSystemStats(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(expect.objectContaining({
      overview: expect.objectContaining({
        totalUsers: 10,
        activeUsers: 8,
        totalCenters: 5,
        activeCenters: 4,
        totalGames: 20,
        totalGameInstances: 50,
        borrowedGameInstances: 15,
        totalRentals: 100,
        activeRentals: 20,
        pendingRentals: 15,
      }),
      distributions: expect.objectContaining({
        usersByRole: expect.any(Array),
        rentalsByStatus: expect.any(Array),
        centersByArea: expect.any(Array),
        gamesByCategory: expect.any(Array),
      }),
      recentActivity: expect.objectContaining({
        newUsers: 2,
        newRentals: 5,
        newCenters: 1,
      }),
      systemHealth: expect.objectContaining({
        database: 'healthy',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      }),
    }));
  });

  it('should return 401 when not authenticated', async () => {
    const { getToken } = await import('next-auth/jwt');
    vi.mocked(getToken, true).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/admin/system');
    const response = await getSystemStats(request);

    expect(response.status).toBe(401);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Authentication required');
  });
});