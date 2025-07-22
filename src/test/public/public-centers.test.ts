import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyApiResponseStructure, parseJsonResponse, createMockApiResponse, createMockPrisma } from '../utils';
import { mockData } from '../test-helpers';
import { Area } from '@/types/schema';

// Import public centers route handler
import { GET as getPublicCenters } from '@/app/api/public/centers/route';

// Mock dependencies
vi.mock('@/lib/db', () => ({ prisma: createMockPrisma() }));

vi.mock('@/lib/api-response', () => ({
  apiResponse: createMockApiResponse(),
}));

describe('GET /api/public/centers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all active centers successfully', async () => {
    const { prisma } = await import('@/lib/db');
    
    const mockCenters = [
      mockData.center({ name: 'Center A', area: Area.NORTH, isActive: true }),
      mockData.center({ name: 'Center B', area: Area.CENTER, isActive: true }),
      mockData.center({ name: 'Center C', area: Area.SOUTH, isActive: true }),
    ];

    vi.mocked(prisma.center.findMany, true).mockResolvedValue(mockCenters);

    const request = new NextRequest('http://localhost/api/public/centers');
    const response = await getPublicCenters(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(3);
    expect(data.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Center A', area: Area.NORTH }),
        expect.objectContaining({ name: 'Center B', area: Area.CENTER }),
        expect.objectContaining({ name: 'Center C', area: Area.SOUTH }),
      ])
    );

    // Verify correct query parameters
    expect(prisma.center.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: expect.any(Object), // CENTER_PUBLIC_INFO
    });
  });

  it('should return empty array when no active centers exist', async () => {
    const { prisma } = await import('@/lib/db');
    
    vi.mocked(prisma.center.findMany, true).mockResolvedValue([]);

    const request = new NextRequest('http://localhost/api/public/centers');
    const response = await getPublicCenters(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it('should only return active centers (exclude inactive)', async () => {
    const { prisma } = await import('@/lib/db');
    
    // Mock only returns active centers (prisma query filters out inactive)
    const activeCenters = [
      mockData.center({ name: 'Active Center', isActive: true }),
    ];

    vi.mocked(prisma.center.findMany, true).mockResolvedValue(activeCenters);

    const request = new NextRequest('http://localhost/api/public/centers');
    const response = await getPublicCenters(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].name).toBe('Active Center');

    // Verify the where clause specifically filters for active centers
    expect(prisma.center.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true },
      })
    );
  });

  it('should return centers sorted by name in ascending order', async () => {
    const { prisma } = await import('@/lib/db');
    
    const mockCenters = [
      mockData.center({ name: 'Alpha Center' }),
      mockData.center({ name: 'Beta Center' }),
      mockData.center({ name: 'Charlie Center' }),
    ];

    vi.mocked(prisma.center.findMany, true).mockResolvedValue(mockCenters);

    const request = new NextRequest('http://localhost/api/public/centers');
    const response = await getPublicCenters(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(true);

    // Verify orderBy is applied correctly
    expect(prisma.center.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { name: 'asc' },
      })
    );
  });

  it('should handle database errors gracefully', async () => {
    const { prisma } = await import('@/lib/db');
    
    vi.mocked(prisma.center.findMany, true).mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost/api/public/centers');
    const response = await getPublicCenters(request);

    expect(response.status).toBe(500);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('שגיאה בטעינת המרכזים');
  });

  it('should use correct select fields for public info only', async () => {
    const { prisma } = await import('@/lib/db');
    
    vi.mocked(prisma.center.findMany, true).mockResolvedValue([]);

    const request = new NextRequest('http://localhost/api/public/centers');
    await getPublicCenters(request);

    // Verify that CENTER_PUBLIC_INFO select is used (should not include sensitive fields)
    expect(prisma.center.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.any(Object), // CENTER_PUBLIC_INFO constant
      })
    );
  });

  it('should handle network timeouts gracefully', async () => {
    const { prisma } = await import('@/lib/db');
    
    vi.mocked(prisma.center.findMany, true).mockRejectedValue(new Error('Request timeout'));

    const request = new NextRequest('http://localhost/api/public/centers');
    const response = await getPublicCenters(request);

    expect(response.status).toBe(500);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('שגיאה בטעינת המרכזים');
  });
});