import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyApiResponseStructure, parseJsonResponse, createMockApiResponse, createMockPrisma } from '../utils';
import { mockData, mockTokens, createMockRequest } from '../test-helpers';
import { GameInstanceStatus } from '@/types/schema';

// Import super games route handlers
import { POST as createSuperGameInstance } from '@/app/api/super/games/route';
import { PUT as updateSuperGameInstance } from '@/app/api/super/games/[id]/route';

// Mock dependencies
vi.mock('@/lib/db', () => ({ prisma: createMockPrisma() }));
vi.mock('next-auth/jwt', () => ({ getToken: vi.fn() }));
vi.mock('@/lib/api-response', () => ({ apiResponse: createMockApiResponse() }));
vi.mock('@/lib/permissions', () => ({ assertSuperCoordinatorRole: vi.fn() }));
vi.mock('@/lib/validations', () => ({
  CreateGameInstanceSchema: { omit: vi.fn().mockReturnValue({ parse: vi.fn() }) },
  UpdateGameInstancePartialSchema: { parse: vi.fn() },
}));

describe('POST /api/super/games', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should create game instance successfully', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    const { CreateGameInstanceSchema } = await import('@/lib/validations');
    
    const gameInstanceData = {
      gameId: 'game-1',
      centerId: 'center-1',
      notes: 'Test game instance',
    };

    const mockCenter = mockData.center({ 
      id: 'center-1', 
      superCoordinatorId: 'super-1' 
    });
    const mockGame = mockData.game({ id: 'game-1' });
    const mockGameInstance = mockData.gameInstance({
      ...gameInstanceData,
      status: GameInstanceStatus.AVAILABLE,
    });

    vi.mocked(getToken, true).mockResolvedValue(mockTokens.superCoordinator);
    // Mock the schema parsing
    vi.mocked(CreateGameInstanceSchema.omit, true).mockReturnValue({
      parse: vi.fn().mockReturnValue(gameInstanceData),
      // Add minimal ZodObject properties to satisfy type
      _def: {},
      safeParse: vi.fn(),
      refine: vi.fn(),
      superRefine: vi.fn(),
      _cached: undefined,
      _getCached: vi.fn(),
      _parse: vi.fn(),
      shape: {},
    } as any);
    
    vi.mocked(prisma.center.findFirst, true).mockResolvedValue(mockCenter);
    vi.mocked(prisma.game.findFirst, true).mockResolvedValue(mockGame);
    vi.mocked(prisma.gameInstance.create, true).mockResolvedValue({
      ...mockGameInstance,
    });

    const request = createMockRequest('http://localhost/api/super/games', 'POST', gameInstanceData);
    const response = await createSuperGameInstance(request);

    expect(response.status).toBe(201);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe(GameInstanceStatus.AVAILABLE);
  });

  it('should return 401 when not authenticated', async () => {
    const { getToken } = await import('next-auth/jwt');
    vi.mocked(getToken, true).mockResolvedValue(null);

    const request = createMockRequest('http://localhost/api/super/games', 'POST', {
      gameId: 'game-1',
      centerId: 'center-1',
    });
    const response = await createSuperGameInstance(request);

    expect(response.status).toBe(401);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Authentication required');
  });

  it('should return 404 for center not supervised by super coordinator', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    const { CreateGameInstanceSchema } = await import('@/lib/validations');
    
    const gameInstanceData = {
      gameId: 'game-1',
      centerId: 'other-center',
    };

    vi.mocked(getToken, true).mockResolvedValue(mockTokens.superCoordinator);
    // Mock the schema parsing
    vi.mocked(CreateGameInstanceSchema.omit, true).mockReturnValue({
      parse: vi.fn().mockReturnValue(gameInstanceData),
      _def: {},
      safeParse: vi.fn(),
      refine: vi.fn(),
      superRefine: vi.fn(),
      _cached: undefined,
      _getCached: vi.fn(),
      _parse: vi.fn(),
      shape: {},
    } as any);
    
    vi.mocked(prisma.center.findFirst, true).mockResolvedValue(null); // Center not found

    const request = createMockRequest('http://localhost/api/super/games', 'POST', gameInstanceData);
    const response = await createSuperGameInstance(request);

    expect(response.status).toBe(404);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Center not found or access denied');
  });
});

describe('PUT /api/super/games/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should update game instance successfully', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    const { UpdateGameInstancePartialSchema } = await import('@/lib/validations');
    
    const updateData = {
      status: GameInstanceStatus.AVAILABLE,
      notes: 'Game returned',
    };

    const existingInstance = mockData.gameInstance({ 
      id: 'gi-1',
      status: GameInstanceStatus.BORROWED,
    });
    const updatedInstance = {
      ...existingInstance,
      ...updateData,
      game: mockData.game(),
      center: { id: 'center-1', name: 'Test Center' },
    };

    vi.mocked(getToken, true).mockResolvedValue(mockTokens.superCoordinator);
    vi.mocked(UpdateGameInstancePartialSchema.parse).mockReturnValue(updateData);
    vi.mocked(prisma.gameInstance.findFirst, true).mockResolvedValue(existingInstance);
    vi.mocked(prisma.rental.findMany, true).mockResolvedValue([]); // No active rentals
    vi.mocked(prisma.gameInstance.update, true).mockResolvedValue(updatedInstance);

    const request = createMockRequest('http://localhost/api/super/games/gi-1', 'PUT', updateData);
    const response = await updateSuperGameInstance(request, { params: { id: 'gi-1' } });

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe(GameInstanceStatus.AVAILABLE);
  });
});