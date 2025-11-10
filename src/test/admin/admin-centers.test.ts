import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyApiResponseStructure, parseJsonResponse, createMockApiResponse, createMockPrisma } from '../utils';
import { mockData, mockTokens, createMockRequest } from '../test-helpers';
import { Area } from '@/types/schema';

// Import admin centers route handlers
import { GET as getAdminCenters, POST as createAdminCenter } from '@/app/api/admin/centers/route';
import { PUT as updateAdminCenter } from '@/app/api/admin/centers/[id]/route';

// Mock dependencies
vi.mock('@/lib/db', () => ({ prisma: createMockPrisma() }));
vi.mock('next-auth/jwt', () => ({ getToken: vi.fn() }));
vi.mock('@/lib/api-response', () => ({ apiResponse: createMockApiResponse() }));
vi.mock('@/lib/permissions', () => ({ assertAdminRole: vi.fn() }));
vi.mock('@/lib/validations', () => ({
  CreateCenterSchema: { parse: vi.fn() },
  UpdateCenterSchema: { parse: vi.fn() },
}));

describe('GET /api/admin/centers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return paginated centers for admin', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    const mockCenters = [
      mockData.centerWithRelations({ area: Area.NORTH }),
      mockData.centerWithRelations({ area: Area.CENTER }),
    ];
    
    vi.mocked(getToken, true).mockResolvedValue(mockTokens.admin);
    vi.mocked(prisma.center.findMany, true).mockResolvedValue(mockCenters);
    vi.mocked(prisma.center.count, true).mockResolvedValue(2);

    const request = new NextRequest('http://localhost/api/admin/centers');
    const response = await getAdminCenters(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
    expect(data.data.centers).toHaveLength(2);
  });

  it('should filter centers by area', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    vi.mocked(getToken, true).mockResolvedValue(mockTokens.admin);
    vi.mocked(prisma.center.findMany, true).mockResolvedValue([]);
    vi.mocked(prisma.center.count, true).mockResolvedValue(0);

    const request = new NextRequest('http://localhost/api/admin/centers?area=NORTH');
    const response = await getAdminCenters(request);

    expect(response.status).toBe(200);
    expect(prisma.center.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ area: 'NORTH' }),
      })
    );
  });
});

describe('POST /api/admin/centers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should create new center successfully', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    const { CreateCenterSchema } = await import('@/lib/validations');
    
    const centerData = {
      name: 'New Center',
      area: Area.NORTH,
      coordinatorId: 'coordinator-1',
    };

    vi.mocked(getToken, true).mockResolvedValue(mockTokens.admin);
    vi.mocked(CreateCenterSchema.parse).mockReturnValue(centerData);
    vi.mocked(prisma.center.create, true).mockResolvedValue(mockData.centerWithRelations(centerData));

    const request = createMockRequest('http://localhost/api/admin/centers', 'POST', centerData);
    const response = await createAdminCenter(request);
    console.log('response',response)
    expect(response.status).toBe(201);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('New Center');
  });
});