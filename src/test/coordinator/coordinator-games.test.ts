import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyApiResponseStructure, parseJsonResponse, createMockApiResponse, createMockPrisma } from '../utils';
import { mockData, createMockRequest, mockTokens } from '../test-helpers';
import { GameInstanceStatus } from '@/types/schema';

// Import coordinator games route handlers
import { GET as getCoordinatorGames } from '@/app/api/coordinator/games/route';
import { PUT as updateGameInstance } from '@/app/api/coordinator/games/[id]/route';

// Mock dependencies
vi.mock('@/lib/db', () => ({ prisma: createMockPrisma() }));
vi.mock('next-auth/jwt', () => ({ getToken: vi.fn() }));
vi.mock('@/lib/api-response', () => ({ apiResponse: createMockApiResponse() }));

describe('GET /api/coordinator/games', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return game instances for coordinator center', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    const mockGameInstances = [
      mockData.gameInstance({ status: GameInstanceStatus.AVAILABLE }),
      mockData.gameInstance({ status: GameInstanceStatus.BORROWED }),
    ];

    vi.mocked(getToken, true).mockResolvedValue(mockTokens.coordinator);
    vi.mocked(prisma.gameInstance.findMany, true).mockResolvedValue(mockGameInstances);

    const request = new NextRequest('http://localhost/api/coordinator/games');
    const response = await getCoordinatorGames(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(prisma.gameInstance.findMany).toHaveBeenCalledWith({
      where: { center: { coordinatorId: 'coordinator-1' } },
      include: expect.any(Object),
      orderBy: { game: { name: 'asc' } },
    });
  });

  it('should return 401 when not authenticated', async () => {
    const { getToken } = await import('next-auth/jwt');
    vi.mocked(getToken, true).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/coordinator/games');
    const response = await getCoordinatorGames(request);

    expect(response.status).toBe(401);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Authentication required');
  });
});

describe('PUT /api/coordinator/games/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should update game instance status successfully', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    const existingInstance = mockData.gameInstance({ 
      id: 'gi-1',
      status: GameInstanceStatus.BORROWED,
    });
    const updatedInstance = { 
      ...existingInstance, 
      status: GameInstanceStatus.AVAILABLE,
    };

    vi.mocked(getToken, true).mockResolvedValue(mockTokens.coordinator);
    vi.mocked(prisma.gameInstance.findFirst, true).mockResolvedValue(existingInstance);
    vi.mocked(prisma.gameInstance.update, true).mockResolvedValue(updatedInstance);

    const request = createMockRequest('http://localhost/api/coordinator/games/gi-1', 'PUT', {
      status: GameInstanceStatus.AVAILABLE,
      notes: 'Game returned',
    });
    const response = await updateGameInstance(request, { params: { id: 'gi-1' } });

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe(GameInstanceStatus.AVAILABLE);
  });

  it('should return 404 for game instance not in coordinator center', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    vi.mocked(getToken, true).mockResolvedValue(mockTokens.coordinator);
    vi.mocked(prisma.gameInstance.findFirst, true).mockResolvedValue(null);

    const request = createMockRequest('http://localhost/api/coordinator/games/other-gi', 'PUT', {
      status: GameInstanceStatus.AVAILABLE,
    });
    const response = await updateGameInstance(request, { params: { id: 'other-gi' } });

    expect(response.status).toBe(404);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(false);
  });
});