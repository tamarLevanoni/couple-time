import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyApiResponseStructure, parseJsonResponse, createMockApiResponse, createMockPrisma } from '../utils';
import { mockData, mockTokens, createMockRequest } from '../test-helpers';
import { Area } from '@/types/schema';

// Import super centers route handlers
import { GET as getSuperCenters } from '@/app/api/super/centers/route';
import { PUT as updateSuperCenter } from '@/app/api/super/centers/[id]/route';

// Mock dependencies
vi.mock('@/lib/db', () => ({ prisma: createMockPrisma() }));
vi.mock('next-auth/jwt', () => ({ getToken: vi.fn() }));
vi.mock('@/lib/api-response', () => ({ apiResponse: createMockApiResponse() }));
vi.mock('@/lib/permissions', () => ({ assertSuperCoordinatorRole: vi.fn() }));
vi.mock('@/lib/validations', () => ({
  CreateCenterSchema: { parse: vi.fn() },
  UpdateCenterSchema: { parse: vi.fn() },
}));

describe('GET /api/super/centers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return centers managed by super coordinator', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    const mockCenters = [
      mockData.centerWithRelations({ superCoordinatorId: 'super-1' }),
      mockData.centerWithRelations({ superCoordinatorId: 'super-1' }),
    ];
    
    vi.mocked(getToken, true).mockResolvedValue(mockTokens.superCoordinator);
    vi.mocked(prisma.center.findMany, true).mockResolvedValue(mockCenters);

    const request = new NextRequest('http://localhost/api/super/centers');
    const response = await getSuperCenters(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(prisma.center.findMany).toHaveBeenCalledWith({
      where: { superCoordinatorId: 'super-1' },
      include: expect.any(Object),
      orderBy: { name: 'asc' },
    });
  });

  it('should return 401 when not authenticated', async () => {
    const { getToken } = await import('next-auth/jwt');
    vi.mocked(getToken, true).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/super/centers');
    const response = await getSuperCenters(request);

    expect(response.status).toBe(401);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Authentication required');
  });
});
