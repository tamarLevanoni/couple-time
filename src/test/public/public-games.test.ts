import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyApiResponseStructure, parseJsonResponse, createMockApiResponse, createMockPrisma } from '../utils';
import { mockData } from '../test-helpers';
import { GameCategory, TargetAudience } from '@/types/schema';

// Import public games route handler
import { GET as getPublicGames } from '@/app/api/public/games/route';

// Mock dependencies
vi.mock('@/lib/db', () => ({ prisma: createMockPrisma() }));

vi.mock('@/lib/api-response', () => ({
  apiResponse: createMockApiResponse(),
}));

describe('GET /api/public/games', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all games successfully', async () => {
    const { prisma } = await import('@/lib/db');
    
    const mockGames = [
      mockData.game({ 
        name: 'Game A', 
        categories: [GameCategory.COMMUNICATION],
        targetAudiences: [TargetAudience.MARRIED],
        isActive: true 
      }),
      mockData.game({ 
        name: 'Game B', 
        categories: [GameCategory.THERAPY],
        targetAudiences: [TargetAudience.GENERAL],
        isActive: true 
      }),
      mockData.game({ 
        name: 'Game C', 
        categories: [GameCategory.FUN],
        targetAudiences: [TargetAudience.MARRIED],
        isActive: false // Should still be included as public route doesn't filter by isActive
      }),
    ];

    vi.mocked(prisma.game.findMany, true).mockResolvedValue(mockGames);

    const request = new NextRequest('http://localhost/api/public/games');
    const response = await getPublicGames(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(3);
    expect(data.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Game A', categories: [GameCategory.COMMUNICATION] }),
        expect.objectContaining({ name: 'Game B', categories: [GameCategory.THERAPY] }),
        expect.objectContaining({ name: 'Game C', categories: [GameCategory.FUN] }),
      ])
    );

    // Verify correct query parameters
    expect(prisma.game.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
      select: expect.any(Object), // GAMES_PUBLIC_INFO
    });
  });

  it('should return empty array when no games exist', async () => {
    const { prisma } = await import('@/lib/db');
    
    vi.mocked(prisma.game.findMany, true).mockResolvedValue([]);

    const request = new NextRequest('http://localhost/api/public/games');
    const response = await getPublicGames(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it('should return games sorted by name in ascending order', async () => {
    const { prisma } = await import('@/lib/db');
    
    const mockGames = [
      mockData.game({ name: 'Alpha Game' }),
      mockData.game({ name: 'Beta Game' }),
      mockData.game({ name: 'Charlie Game' }),
    ];

    vi.mocked(prisma.game.findMany, true).mockResolvedValue(mockGames);

    const request = new NextRequest('http://localhost/api/public/games');
    const response = await getPublicGames(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(true);

    // Verify orderBy is applied correctly
    expect(prisma.game.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { name: 'asc' },
      })
    );
  });

  it('should include all games regardless of active status', async () => {
    const { prisma } = await import('@/lib/db');
    
    const mockGames = [
      mockData.game({ name: 'Active Game', isActive: true }),
      mockData.game({ name: 'Inactive Game', isActive: false }),
    ];

    vi.mocked(prisma.game.findMany, true).mockResolvedValue(mockGames);

    const request = new NextRequest('http://localhost/api/public/games');
    const response = await getPublicGames(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);

    // Verify no where clause is applied (all games returned regardless of status)
    expect(prisma.game.findMany).toHaveBeenCalledWith(
      expect.not.objectContaining({
        where: expect.anything(),
      })
    );
  });

  it('should handle database errors gracefully', async () => {
    const { prisma } = await import('@/lib/db');
    
    vi.mocked(prisma.game.findMany, true).mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost/api/public/games');
    const response = await getPublicGames(request);

    expect(response.status).toBe(500);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('שגיאה בטעינת המשחקים');
  });

  it('should use correct select fields for public info only', async () => {
    const { prisma } = await import('@/lib/db');
    
    vi.mocked(prisma.game.findMany, true).mockResolvedValue([]);

    const request = new NextRequest('http://localhost/api/public/games');
    await getPublicGames(request);

    // Verify that GAMES_PUBLIC_INFO select is used (should not include sensitive fields)
    expect(prisma.game.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.any(Object), // GAMES_PUBLIC_INFO constant
      })
    );
  });

  it('should handle various game categories and target audiences', async () => {
    const { prisma } = await import('@/lib/db');
    
    const mockGames = [
      mockData.game({ 
        categories: [GameCategory.COMMUNICATION, GameCategory.THERAPY],
        targetAudiences: [TargetAudience.MARRIED] 
      }),
      mockData.game({ 
        categories: [GameCategory.FUN],
        targetAudiences: [TargetAudience.GENERAL] 
      }),
    ];

    vi.mocked(prisma.game.findMany, true).mockResolvedValue(mockGames);

    const request = new NextRequest('http://localhost/api/public/games');
    const response = await getPublicGames(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    
    // Verify complex enum arrays are handled correctly
    expect(data.data[0]).toEqual(expect.objectContaining({
      categories: expect.arrayContaining([GameCategory.COMMUNICATION, GameCategory.THERAPY]),
      targetAudiences: expect.arrayContaining([TargetAudience.MARRIED]),
    }));
  });

  it('should handle network timeouts gracefully', async () => {
    const { prisma } = await import('@/lib/db');
    
    vi.mocked(prisma.game.findMany, true).mockRejectedValue(new Error('Request timeout'));

    const request = new NextRequest('http://localhost/api/public/games');
    const response = await getPublicGames(request);

    expect(response.status).toBe(500);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('שגיאה בטעינת המשחקים');
  });
});