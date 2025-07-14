// Comprehensive tests for /api/user/rentals endpoints following CLAUDE.md standards
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getUserRentals, POST as createUserRental } from '@/app/api/user/rentals/route';
import { PUT as updateUserRental } from '@/app/api/user/rentals/[id]/route';
import { verifyApiResponseStructure, parseJsonResponse, createMockPrisma } from './utils';
import { RentalStatus, GameInstanceStatus } from '@/types/schema';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    rental: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    gameInstance: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

vi.mock('@/lib/api-response', () => ({
  apiResponse: vi.fn((success, data, error, status) => {
    if (success) {
      return new Response(JSON.stringify({ success: true, data }), { 
        status: status || 200,
        headers: { 'content-type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ success: false, error }), { 
        status: status || 400,
        headers: { 'content-type': 'application/json' }
      });
    }
  }),
}));

describe('/api/user/rentals', () => {
  const mockUser = {
    id: 'cltest_user123',
    email: 'user@example.com',
    name: 'Test User',
  };

  const mockRentals = [
    {
      id: 'cltest_rental1',
      userId: 'cltest_user123',
      status: RentalStatus.ACTIVE,
      notes: 'Test rental',
      createdAt: '2025-01-14T01:26:17.526Z', // API returns dates as strings
      gameInstances: [
        {
          id: 'cltest_inst1',
          game: { id: 'cltest_game1', name: 'Test Game 1' },
          center: { id: 'cltest_center1', name: 'Test Center' },
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/user/rentals', () => {
    it('should return user rentals when authenticated', async () => {
      // Mock authentication
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue(mockUser as any);

      // Mock database
      const { prisma } = await import('@/lib/db');
      vi.mocked(prisma.rental.findMany).mockResolvedValue(mockRentals as any);

      const request = new NextRequest('http://localhost/api/user/rentals');
      const response = await getUserRentals(request);
      
      expect(response.status).toBe(200);
      
      const data = await parseJsonResponse(response);
      verifyApiResponseStructure(data);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockRentals);
      
      // Verify database query
      expect(prisma.rental.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        include: expect.objectContaining({
          gameInstances: expect.any(Object),
        }),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return 401 when not authenticated', async () => {
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/user/rentals');
      const response = await getUserRentals(request);
      
      expect(response.status).toBe(401);
      
      const data = await parseJsonResponse(response);
      verifyApiResponseStructure(data);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Authentication required');
    });

    it('should handle database errors gracefully', async () => {
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue(mockUser as any);

      const { prisma } = await import('@/lib/db');
      vi.mocked(prisma.rental.findMany).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/user/rentals');
      const response = await getUserRentals(request);
      
      expect(response.status).toBe(500);
      
      const data = await parseJsonResponse(response);
      verifyApiResponseStructure(data);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Internal server error');
    });
  });

  describe('POST /api/user/rentals', () => {
    const mockGameInstances = [
      {
        id: 'cltest_inst1',
        gameId: 'cltest_game1',
        centerId: 'cltest_center1',
        status: GameInstanceStatus.AVAILABLE,
      },
      {
        id: 'cltest_inst2',
        gameId: 'cltest_game2',
        centerId: 'cltest_center1',
        status: GameInstanceStatus.AVAILABLE,
      },
    ];

    it('should create rental with multiple games from same center', async () => {
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue(mockUser as any);

      const { prisma } = await import('@/lib/db');
      vi.mocked(prisma.gameInstance.findMany).mockResolvedValue(mockGameInstances as any);
      vi.mocked(prisma.rental.findMany).mockResolvedValue([]); // No existing rentals
      vi.mocked(prisma.rental.create).mockResolvedValue({
        ...mockRentals[0],
        gameInstances: mockGameInstances,
      } as any);

      const requestBody = {
        centerId: 'cltest_center1',
        gameInstanceIds: ['cltest_inst1', 'cltest_inst2'],
        notes: 'Test rental request',
      };

      const request = new NextRequest('http://localhost/api/user/rentals', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await createUserRental(request);
      
      expect(response.status).toBe(200);
      
      const data = await parseJsonResponse(response);
      verifyApiResponseStructure(data);
      expect(data.success).toBe(true);
      expect(data.data.gameInstances).toHaveLength(2);
    });

    it('should reject rental with games from different centers', async () => {
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue(mockUser as any);

      const differentCenterGameInstances = [
        { ...mockGameInstances[0], centerId: 'cltest_center1' },
        { ...mockGameInstances[1], centerId: 'cltest_center2' }, // Different center
      ];

      const { prisma } = await import('@/lib/db');
      vi.mocked(prisma.gameInstance.findMany).mockResolvedValue(differentCenterGameInstances as any);

      const requestBody = {
        centerId: 'cltest_center1',
        gameInstanceIds: ['cltest_inst1', 'cltest_inst2'],
        notes: 'Test rental request',
      };

      const request = new NextRequest('http://localhost/api/user/rentals', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await createUserRental(request);
      
      expect(response.status).toBe(400);
      
      const data = await parseJsonResponse(response);
      verifyApiResponseStructure(data);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('All games must be from the same center');
    });

    it('should reject rental with duplicate games', async () => {
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue(mockUser as any);

      const duplicateGameInstances = [
        { ...mockGameInstances[0], gameId: 'cltest_game1' },
        { ...mockGameInstances[1], gameId: 'cltest_game1' }, // Same game
      ];

      const { prisma } = await import('@/lib/db');
      vi.mocked(prisma.gameInstance.findMany).mockResolvedValue(duplicateGameInstances as any);

      const requestBody = {
        centerId: 'cltest_center1',
        gameInstanceIds: ['cltest_inst1', 'cltest_inst2'],
        notes: 'Test rental request',
      };

      const request = new NextRequest('http://localhost/api/user/rentals', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await createUserRental(request);
      
      expect(response.status).toBe(400);
      
      const data = await parseJsonResponse(response);
      verifyApiResponseStructure(data);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Cannot request duplicate games in the same rental');
    });

    it('should reject rental when game instances not found', async () => {
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue(mockUser as any);

      const { prisma } = await import('@/lib/db');
      vi.mocked(prisma.gameInstance.findMany).mockResolvedValue([mockGameInstances[0]] as any); // Only 1 found

      const requestBody = {
        centerId: 'cltest_center1',
        gameInstanceIds: ['cltest_inst1', 'cltest_inst2'],
        notes: 'Test rental request',
      };

      const request = new NextRequest('http://localhost/api/user/rentals', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await createUserRental(request);
      
      expect(response.status).toBe(404);
      
      const data = await parseJsonResponse(response);
      verifyApiResponseStructure(data);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('One or more game instances not found');
    });

    it('should reject rental when user has existing rental for same games', async () => {
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue(mockUser as any);

      const { prisma } = await import('@/lib/db');
      vi.mocked(prisma.gameInstance.findMany).mockResolvedValue(mockGameInstances as any);
      vi.mocked(prisma.rental.findMany).mockResolvedValue([mockRentals[0]] as any); // Existing rental found

      const requestBody = {
        centerId: 'cltest_center1',
        gameInstanceIds: ['cltest_inst1', 'cltest_inst2'],
        notes: 'Test rental request',
      };

      const request = new NextRequest('http://localhost/api/user/rentals', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await createUserRental(request);
      
      expect(response.status).toBe(400);
      
      const data = await parseJsonResponse(response);
      verifyApiResponseStructure(data);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('You already have a pending or active rental for one or more of these games');
    });

    it('should handle validation errors', async () => {
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue(mockUser as any);

      const invalidRequestBody = {
        centerId: 'cltest_center1',
        gameInstanceIds: [], // Empty array should fail validation
        notes: 'Test rental request',
      };

      const request = new NextRequest('http://localhost/api/user/rentals', {
        method: 'POST',
        body: JSON.stringify(invalidRequestBody),
      });

      const response = await createUserRental(request);
      
      expect(response.status).toBe(400);
      
      const data = await parseJsonResponse(response);
      verifyApiResponseStructure(data);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Invalid request data');
    });
  });

  describe('PUT /api/user/rentals/[id]', () => {
    it('should cancel pending rental successfully', async () => {
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue(mockUser as any);

      const pendingRental = { ...mockRentals[0], status: RentalStatus.PENDING };

      const { prisma } = await import('@/lib/db');
      vi.mocked(prisma.rental.findFirst).mockResolvedValue(pendingRental as any);
      vi.mocked(prisma.rental.update).mockResolvedValue({
        ...pendingRental,
        status: 'CANCELLED',
      } as any);

      const requestBody = {
        status: 'CANCELLED',
      };

      const request = new NextRequest('http://localhost/api/user/rentals/rental-1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      });

      const response = await updateUserRental(request, { params: { id: 'rental-1' } });
      
      expect(response.status).toBe(200);
      
      const data = await parseJsonResponse(response);
      verifyApiResponseStructure(data);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe(RentalStatus.CANCELLED);
    });

    it('should reject cancellation of non-pending rental', async () => {
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue(mockUser as any);

      const activeRental = { ...mockRentals[0], status: RentalStatus.ACTIVE };

      const { prisma } = await import('@/lib/db');
      vi.mocked(prisma.rental.findFirst).mockResolvedValue(activeRental as any);

      const requestBody = {
        status: 'CANCELLED',
      };

      const request = new NextRequest('http://localhost/api/user/rentals/rental-1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      });

      const response = await updateUserRental(request, { params: { id: 'rental-1' } });
      
      expect(response.status).toBe(400);
      
      const data = await parseJsonResponse(response);
      verifyApiResponseStructure(data);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Only pending rentals can be updated');
    });

    it('should return 404 for non-existent or unauthorized rental', async () => {
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue(mockUser as any);

      const { prisma } = await import('@/lib/db');
      vi.mocked(prisma.rental.findFirst).mockResolvedValue(null);

      const requestBody = {
        status: 'CANCELLED',
      };

      const request = new NextRequest('http://localhost/api/user/rentals/rental-1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      });

      const response = await updateUserRental(request, { params: { id: 'rental-1' } });
      
      expect(response.status).toBe(404);
      
      const data = await parseJsonResponse(response);
      verifyApiResponseStructure(data);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Rental not found');
    });

    it('should require authentication', async () => {
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue(null);

      const requestBody = {
        status: 'CANCELLED',
      };

      const request = new NextRequest('http://localhost/api/user/rentals/rental-1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      });

      const response = await updateUserRental(request, { params: { id: 'rental-1' } });
      
      expect(response.status).toBe(401);
      
      const data = await parseJsonResponse(response);
      verifyApiResponseStructure(data);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Authentication required');
    });
  });
});