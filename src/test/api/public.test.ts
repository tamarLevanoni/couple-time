import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET as getGames } from '@/app/api/public/games/route';
import { GET as getCenters } from '@/app/api/public/centers/route';
import { expectSuccessResponse, expectErrorResponse } from '../utils';
import { gameFactory, centerFactory, gameInstanceFactory } from '../factories';
import { createMockRequest, mockPrisma } from '../test-helpers';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}));

describe('/api/public/*', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/public/games', () => {
    it('✅ should return all games with instances', async () => {
      // Arrange
      const mockGames = [
        gameFactory({
          id: 'game-1',
          name: 'Test Game',
          gameInstances: [
            gameInstanceFactory({
              id: 'instance-1',
              status: 'AVAILABLE',
              centerId: 'center-1'
            })
          ]
        })
      ];
      
      mockPrisma.game.findMany.mockResolvedValue(mockGames);

      const request = createMockRequest('GET', 'http://localhost:3000/api/public/games');

      // Act
      const response = await getGames(request);

      // Assert
      await expectSuccessResponse(response, { length: 1 });
      expect(mockPrisma.game.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: {
          gameInstances: {
            select: {
              id: true,
              status: true,
              centerId: true,
              center: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                  area: true
                }
              }
            }
          }
        }
      });
    });

    it('✅ should handle empty games list', async () => {
      // Arrange
      mockPrisma.game.findMany.mockResolvedValue([]);

      const request = createMockRequest('GET', 'http://localhost:3000/api/public/games');

      // Act
      const response = await getGames(request);

      // Assert
      await expectSuccessResponse(response, { length: 0 });
    });

    it('❌ should handle database errors', async () => {
      // Arrange
      mockPrisma.game.findMany.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest('GET', 'http://localhost:3000/api/public/games');

      // Act
      const response = await getGames(request);

      // Assert
      await expectErrorResponse(response, 500, 'Internal server error');
    });
  });

  describe('GET /api/public/centers', () => {
    it('✅ should return all active centers', async () => {
      // Arrange
      const mockCenters = [
        centerFactory({
          id: 'center-1',
          name: 'Test Center',
          isActive: true
        })
      ];
      
      mockPrisma.center.findMany.mockResolvedValue(mockCenters);

      const request = createMockRequest('GET', 'http://localhost:3000/api/public/centers');

      // Act
      const response = await getCenters(request);

      // Assert
      await expectSuccessResponse(response, { length: 1 });
      expect(mockPrisma.center.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          city: true,
          area: true,
          location: true
        }
      });
    });

    it('✅ should handle empty centers list', async () => {
      // Arrange
      mockPrisma.center.findMany.mockResolvedValue([]);

      const request = createMockRequest('GET', 'http://localhost:3000/api/public/centers');

      // Act
      const response = await getCenters(request);

      // Assert
      await expectSuccessResponse(response, { length: 0 });
    });

    it('❌ should handle database errors', async () => {
      // Arrange
      mockPrisma.center.findMany.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest('GET', 'http://localhost:3000/api/public/centers');

      // Act
      const response = await getCenters(request);

      // Assert
      await expectErrorResponse(response, 500, 'Internal server error');
    });
  });
});