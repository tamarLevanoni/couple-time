import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyApiResponseStructure, parseJsonResponse, createMockApiResponse, createMockPrisma } from '../utils';
import { mockData, mockTokens, createMockRequest } from '../test-helpers';
import { GameCategory, TargetAudience } from '@/types/schema';

// Import admin games route handlers
import { GET as getAdminGames, POST as createAdminGame } from '@/app/api/admin/games/route';
import { PUT as updateAdminGame } from '@/app/api/admin/games/[id]/route';

// Mock dependencies
vi.mock('@/lib/db', () => ({ prisma: createMockPrisma() }));
vi.mock('next-auth/jwt', () => ({ getToken: vi.fn() }));
vi.mock('@/lib/api-response', () => ({ apiResponse: createMockApiResponse() }));
vi.mock('@/lib/permissions', () => ({ assertAdminRole: vi.fn() }));
vi.mock('@/lib/validations', () => ({
  CreateGameSchema: { parse: vi.fn() },
  UpdateGameSchema: { parse: vi.fn() },
}));

describe('GET /api/admin/games', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return paginated games for admin', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    const mockGames = [
      mockData.game({ categories: [GameCategory.THERAPY] }),
      mockData.game({ categories: [GameCategory.COMMUNICATION] }),
    ];
    
    vi.mocked(getToken, true).mockResolvedValue(mockTokens.admin);
    vi.mocked(prisma.game.findMany, true).mockResolvedValue(mockGames);
    vi.mocked(prisma.game.count, true).mockResolvedValue(2);

    const request = new NextRequest('http://localhost/api/admin/games');
    const response = await getAdminGames(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
    expect(data.data.games).toHaveLength(2);
  });
});

describe('POST /api/admin/games', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should create new game successfully', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    const { CreateGameSchema } = await import('@/lib/validations');
    
    const gameData = {
      name: 'New Game',
      description: 'Test game',
      categories: [GameCategory.THERAPY],
      targetAudiences: [TargetAudience.GENERAL],
    };

    vi.mocked(getToken, true).mockResolvedValue(mockTokens.admin);
    vi.mocked(CreateGameSchema.parse).mockReturnValue(gameData);
    vi.mocked(prisma.game.create, true).mockResolvedValue(mockData.game(gameData));

    const request = createMockRequest('http://localhost/api/admin/games', 'POST', gameData);
    const response = await createAdminGame(request);

    expect(response.status).toBe(201);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('New Game');
  });
});