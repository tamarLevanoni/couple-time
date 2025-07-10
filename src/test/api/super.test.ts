import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET as getCenters } from '@/app/api/super/centers/route';
import { GET as getCenter, PUT as updateCenter } from '@/app/api/super/centers/[id]/route';
import { POST as createRental, GET as getRentals } from '@/app/api/super/rentals/route';
import { PUT as updateRental } from '@/app/api/super/rentals/[id]/route';
import { POST as addGameInstance, GET as getGames } from '@/app/api/super/games/route';
import { PUT as updateGameInstance } from '@/app/api/super/games/[id]/route';
import { expectSuccessResponse, expectErrorResponse } from '../utils';
import { 
  superCoordinatorJwtFactory, 
  centerFactory, 
  gameInstanceFactory, 
  rentalFactory,
  gameFactory
} from '../factories';
import { createMockRequest, mockPrisma } from '../test-helpers';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}));

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

describe('/api/super/*', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/super/centers', () => {
    it('✅ should return supervised centers', async () => {
      // Arrange
      const superToken = superCoordinatorJwtFactory();
      const mockCenters = [
        centerFactory({ 
          superCoordinatorId: superToken.id,
          isActive: true 
        })
      ];
      
      mockPrisma.center.findMany.mockResolvedValue(mockCenters);

      const request = createMockRequest('GET', 'http://localhost:3000/api/super/centers', undefined, superToken);

      // Act
      const response = await getCenters(request);

      // Assert
      await expectSuccessResponse(response, { length: 1 });
    });

    it('❌ should require authentication', async () => {
      // Arrange
      const request = createMockRequest('GET', 'http://localhost:3000/api/super/centers');

      // Act
      const response = await getCenters(request);

      // Assert
      await expectErrorResponse(response, 401, 'Authentication required');
    });
  });

  describe('GET /api/super/centers/[id]', () => {
    it('✅ should return specific center details', async () => {
      // Arrange
      const superToken = superCoordinatorJwtFactory();
      const mockCenter = centerFactory({ 
        id: 'center-1',
        superCoordinatorId: superToken.id 
      });
      
      mockPrisma.center.findFirst.mockResolvedValue(mockCenter);

      const request = createMockRequest('GET', 'http://localhost:3000/api/super/centers/center-1', undefined, superToken);

      // Act
      const response = await getCenter(request, { params: { id: 'center-1' } });

      // Assert
      await expectSuccessResponse(response, { id: mockCenter.id });
    });

    it('❌ should handle non-existent center', async () => {
      // Arrange
      const superToken = superCoordinatorJwtFactory();
      
      mockPrisma.center.findFirst.mockResolvedValue(null);

      const request = createMockRequest('GET', 'http://localhost:3000/api/super/centers/nonexistent', undefined, superToken);

      // Act
      const response = await getCenter(request, { params: { id: 'nonexistent' } });

      // Assert
      await expectErrorResponse(response, 404, 'Center not found');
    });
  });

  describe('PUT /api/super/centers/[id]', () => {
    it('✅ should update center', async () => {
      // Arrange
      const superToken = superCoordinatorJwtFactory();
      const updateData = { name: 'Updated Center', city: 'New City' };
      const mockCenter = centerFactory({ 
        superCoordinatorId: superToken.id 
      });
      const updatedCenter = { ...mockCenter, ...updateData };
      
      mockPrisma.center.findFirst.mockResolvedValue(mockCenter);
      mockPrisma.center.update.mockResolvedValue(updatedCenter);

      const request = createMockRequest('PUT', 'http://localhost:3000/api/super/centers/center-1', updateData, superToken);

      // Act
      const response = await updateCenter(request, { params: { id: 'center-1' } });

      // Assert
      await expectSuccessResponse(response, { name: updateData.name });
    });

    it('❌ should reject unauthorized center access', async () => {
      // Arrange
      const superToken = superCoordinatorJwtFactory();
      const updateData = { name: 'Updated Center' };
      
      mockPrisma.center.findFirst.mockResolvedValue(null); // Not their center

      const request = createMockRequest('PUT', 'http://localhost:3000/api/super/centers/center-1', updateData, superToken);

      // Act
      const response = await updateCenter(request, { params: { id: 'center-1' } });

      // Assert
      await expectErrorResponse(response, 404, 'Center not found');
    });
  });

  describe('GET /api/super/rentals', () => {
    it('✅ should return rentals for supervised centers', async () => {
      // Arrange
      const superToken = superCoordinatorJwtFactory();
      const mockRentals = [
        rentalFactory({ 
          status: 'PENDING',
          gameInstanceId: 'instance-1'
        })
      ];
      
      mockPrisma.rental.findMany.mockResolvedValue(mockRentals);

      const request = createMockRequest('GET', 'http://localhost:3000/api/super/rentals', undefined, superToken);

      // Act
      const response = await getRentals(request);

      // Assert
      await expectSuccessResponse(response, { length: 1 });
    });
  });

  describe('POST /api/super/rentals', () => {
    it('✅ should create rental for user', async () => {
      // Arrange
      const superToken = superCoordinatorJwtFactory();
      const requestBody = {
        userId: 'user-1',
        gameInstanceId: 'instance-1',
        requestDate: '2024-01-15',
        expectedReturnDate: '2024-01-20',
        notes: 'Test rental',
      };

      const mockGameInstance = gameInstanceFactory({
        id: 'instance-1',
        status: 'AVAILABLE',
        centerId: 'center-1'
      });
      
      const mockCreatedRental = rentalFactory({
        userId: 'user-1',
        gameInstanceId: 'instance-1',
        status: 'ACTIVE',
      });

      mockPrisma.gameInstance.findFirst.mockResolvedValue(mockGameInstance);
      mockPrisma.rental.findFirst.mockResolvedValue(null); // No existing rental
      mockPrisma.rental.create.mockResolvedValue(mockCreatedRental);

      const request = createMockRequest('POST', 'http://localhost:3000/api/super/rentals', requestBody, superToken);

      // Act
      const response = await createRental(request);

      // Assert
      await expectSuccessResponse(response, { id: mockCreatedRental.id });
    });

    it('❌ should reject unavailable game instance', async () => {
      // Arrange
      const superToken = superCoordinatorJwtFactory();
      const requestBody = {
        userId: 'user-1',
        gameInstanceId: 'instance-1',
        requestDate: '2024-01-15',
        expectedReturnDate: '2024-01-20',
      };

      mockPrisma.gameInstance.findFirst.mockResolvedValue(null);

      const request = createMockRequest('POST', 'http://localhost:3000/api/super/rentals', requestBody, superToken);

      // Act
      const response = await createRental(request);

      // Assert
      await expectErrorResponse(response, 404, 'Game instance not found or not available');
    });
  });

  describe('PUT /api/super/rentals/[id]', () => {
    it('✅ should approve rental', async () => {
      // Arrange
      const superToken = superCoordinatorJwtFactory();
      const updateData = { action: 'approve' };
      const mockRental = rentalFactory({ 
        status: 'PENDING',
        gameInstanceId: 'instance-1'
      });
      const updatedRental = { ...mockRental, status: 'ACTIVE' };

      mockPrisma.rental.findFirst.mockResolvedValue(mockRental);
      mockPrisma.rental.update.mockResolvedValue(updatedRental);
      mockPrisma.gameInstance.update.mockResolvedValue({});

      const request = createMockRequest(
        'PUT', 
        'http://localhost:3000/api/super/rentals/rental-1', 
        updateData, 
        superToken
      );

      // Act
      const response = await updateRental(request, { params: { id: 'rental-1' } });

      // Assert
      await expectSuccessResponse(response, { id: updatedRental.id });
    });

    it('❌ should handle non-existent rental', async () => {
      // Arrange
      const superToken = superCoordinatorJwtFactory();
      const updateData = { action: 'approve' };

      mockPrisma.rental.findFirst.mockResolvedValue(null);

      const request = createMockRequest(
        'PUT', 
        'http://localhost:3000/api/super/rentals/nonexistent', 
        updateData, 
        superToken
      );

      // Act
      const response = await updateRental(request, { params: { id: 'nonexistent' } });

      // Assert
      await expectErrorResponse(response, 404, 'Rental not found');
    });
  });

  describe('GET /api/super/games', () => {
    it('✅ should return games at supervised centers', async () => {
      // Arrange
      const superToken = superCoordinatorJwtFactory();
      const mockGameInstances = [
        gameInstanceFactory({ 
          centerId: 'center-1',
          gameId: 'game-1'
        })
      ];
      
      mockPrisma.gameInstance.findMany.mockResolvedValue(mockGameInstances);

      const request = createMockRequest('GET', 'http://localhost:3000/api/super/games', undefined, superToken);

      // Act
      const response = await getGames(request);

      // Assert
      await expectSuccessResponse(response, { length: 1 });
    });
  });

  describe('POST /api/super/games', () => {
    it('✅ should add game instance to center', async () => {
      // Arrange
      const superToken = superCoordinatorJwtFactory();
      const requestBody = {
        gameId: 'game-1',
        centerId: 'center-1',
        notes: 'New instance'
      };

      const mockCenter = centerFactory({ 
        id: 'center-1',
        superCoordinatorId: superToken.id 
      });
      const mockGame = gameFactory({ id: 'game-1' });
      const mockCreatedInstance = gameInstanceFactory({
        gameId: 'game-1',
        centerId: 'center-1'
      });

      mockPrisma.center.findFirst.mockResolvedValue(mockCenter);
      mockPrisma.game.findUnique.mockResolvedValue(mockGame);
      mockPrisma.gameInstance.findFirst.mockResolvedValue(null); // No existing instance
      mockPrisma.gameInstance.create.mockResolvedValue(mockCreatedInstance);

      const request = createMockRequest('POST', 'http://localhost:3000/api/super/games', requestBody, superToken);

      // Act
      const response = await addGameInstance(request);

      // Assert
      await expectSuccessResponse(response, { id: mockCreatedInstance.id });
    });

    it('❌ should reject unauthorized center access', async () => {
      // Arrange
      const superToken = superCoordinatorJwtFactory();
      const requestBody = {
        gameId: 'game-1',
        centerId: 'center-2', // Different center
        notes: 'New instance'
      };

      mockPrisma.center.findFirst.mockResolvedValue(null); // Not their center

      const request = createMockRequest('POST', 'http://localhost:3000/api/super/games', requestBody, superToken);

      // Act
      const response = await addGameInstance(request);

      // Assert
      await expectErrorResponse(response, 403, 'Access denied');
    });
  });

  describe('PUT /api/super/games/[id]', () => {
    it('✅ should update game instance', async () => {
      // Arrange
      const superToken = superCoordinatorJwtFactory();
      const updateData = { status: 'UNAVAILABLE', notes: 'Under maintenance' };
      const mockGameInstance = gameInstanceFactory({ 
        centerId: 'center-1'
      });
      const updatedInstance = { ...mockGameInstance, ...updateData };

      mockPrisma.gameInstance.findFirst.mockResolvedValue(mockGameInstance);
      mockPrisma.gameInstance.update.mockResolvedValue(updatedInstance);

      const request = createMockRequest(
        'PUT', 
        'http://localhost:3000/api/super/games/instance-1', 
        updateData, 
        superToken
      );

      // Act
      const response = await updateGameInstance(request, { params: { id: 'instance-1' } });

      // Assert
      await expectSuccessResponse(response, { id: updatedInstance.id });
    });

    it('❌ should handle non-existent game instance', async () => {
      // Arrange
      const superToken = superCoordinatorJwtFactory();
      const updateData = { status: 'UNAVAILABLE' };

      mockPrisma.gameInstance.findFirst.mockResolvedValue(null);

      const request = createMockRequest(
        'PUT', 
        'http://localhost:3000/api/super/games/nonexistent', 
        updateData, 
        superToken
      );

      // Act
      const response = await updateGameInstance(request, { params: { id: 'nonexistent' } });

      // Assert
      await expectErrorResponse(response, 404, 'Game instance not found');
    });
  });
});