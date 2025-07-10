import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET as getCoordinatorDashboard } from '@/app/api/coordinator/route';
import { POST as createRental } from '@/app/api/coordinator/rentals/route';
import { PUT as updateRental } from '@/app/api/coordinator/rentals/[id]/route';
import { POST as addGameInstance } from '@/app/api/coordinator/games/route';
import { PUT as updateGameInstance } from '@/app/api/coordinator/games/[id]/route';
import { expectSuccessResponse, expectErrorResponse } from '../utils';
import { 
  coordinatorJwtFactory, 
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

describe('/api/coordinator/*', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/coordinator', () => {
    it('✅ should return coordinator dashboard', async () => {
      // Arrange
      const coordinatorToken = coordinatorJwtFactory();
      const mockCenter = centerFactory({ 
        coordinatorId: coordinatorToken.id,
        isActive: true 
      });
      
      mockPrisma.center.findMany.mockResolvedValue([mockCenter]);

      const request = createMockRequest('GET', 'http://localhost:3000/api/coordinator', undefined, coordinatorToken);

      // Act
      const response = await getCoordinatorDashboard(request);

      // Assert
      await expectSuccessResponse(response, { id: mockCenter.id });
    });

    it('❌ should require authentication', async () => {
      // Arrange
      const request = createMockRequest('GET', 'http://localhost:3000/api/coordinator');

      // Act
      const response = await getCoordinatorDashboard(request);

      // Assert
      await expectErrorResponse(response, 401, 'Authentication required');
    });
  });


  describe('POST /api/coordinator/rentals', () => {
    it('✅ should create rental for user', async () => {
      // Arrange
      const coordinatorToken = coordinatorJwtFactory();
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

      const request = createMockRequest('POST', 'http://localhost:3000/api/coordinator/rentals', requestBody, coordinatorToken);

      // Act
      const response = await createRental(request);

      // Assert
      await expectSuccessResponse(response, { id: mockCreatedRental.id });
    });

    it('❌ should reject unavailable game instance', async () => {
      // Arrange
      const coordinatorToken = coordinatorJwtFactory();
      const requestBody = {
        userId: 'user-1',
        gameInstanceId: 'instance-1',
        requestDate: '2024-01-15',
        expectedReturnDate: '2024-01-20',
      };

      mockPrisma.gameInstance.findFirst.mockResolvedValue(null);

      const request = createMockRequest('POST', 'http://localhost:3000/api/coordinator/rentals', requestBody, coordinatorToken);

      // Act
      const response = await createRental(request);

      // Assert
      await expectErrorResponse(response, 404, 'Game instance not found or not available');
    });
  });

  describe('PUT /api/coordinator/rentals/[id]', () => {
    it('✅ should approve rental', async () => {
      // Arrange
      const coordinatorToken = coordinatorJwtFactory();
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
        'http://localhost:3000/api/coordinator/rentals/rental-1', 
        updateData, 
        coordinatorToken
      );

      // Act
      const response = await updateRental(request, { params: { id: 'rental-1' } });

      // Assert
      await expectSuccessResponse(response, { id: updatedRental.id });
    });

    it('❌ should handle non-existent rental', async () => {
      // Arrange
      const coordinatorToken = coordinatorJwtFactory();
      const updateData = { action: 'approve' };

      mockPrisma.rental.findFirst.mockResolvedValue(null);

      const request = createMockRequest(
        'PUT', 
        'http://localhost:3000/api/coordinator/rentals/nonexistent', 
        updateData, 
        coordinatorToken
      );

      // Act
      const response = await updateRental(request, { params: { id: 'nonexistent' } });

      // Assert
      await expectErrorResponse(response, 404, 'Rental not found');
    });
  });

  describe('POST /api/coordinator/games', () => {
    it('✅ should add game instance to center', async () => {
      // Arrange
      const coordinatorToken = coordinatorJwtFactory();
      const requestBody = {
        gameId: 'game-1',
        centerId: 'center-1',
        notes: 'New instance'
      };

      const mockCenter = centerFactory({ 
        id: 'center-1',
        coordinatorId: coordinatorToken.id 
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

      const request = createMockRequest('POST', 'http://localhost:3000/api/coordinator/games', requestBody, coordinatorToken);

      // Act
      const response = await addGameInstance(request);

      // Assert
      await expectSuccessResponse(response, { id: mockCreatedInstance.id });
    });

    it('❌ should reject unauthorized center access', async () => {
      // Arrange
      const coordinatorToken = coordinatorJwtFactory();
      const requestBody = {
        gameId: 'game-1',
        centerId: 'center-2', // Different center
        notes: 'New instance'
      };

      mockPrisma.center.findFirst.mockResolvedValue(null); // Not their center

      const request = createMockRequest('POST', 'http://localhost:3000/api/coordinator/games', requestBody, coordinatorToken);

      // Act
      const response = await addGameInstance(request);

      // Assert
      await expectErrorResponse(response, 403, 'Access denied');
    });
  });

  describe('PUT /api/coordinator/games/[id]', () => {
    it('✅ should update game instance', async () => {
      // Arrange
      const coordinatorToken = coordinatorJwtFactory();
      const updateData = { status: 'UNAVAILABLE', notes: 'Under maintenance' };
      const mockGameInstance = gameInstanceFactory({ 
        centerId: 'center-1'
      });
      const updatedInstance = { ...mockGameInstance, ...updateData };

      mockPrisma.gameInstance.findFirst.mockResolvedValue(mockGameInstance);
      mockPrisma.gameInstance.update.mockResolvedValue(updatedInstance);

      const request = createMockRequest(
        'PUT', 
        'http://localhost:3000/api/coordinator/games/instance-1', 
        updateData, 
        coordinatorToken
      );

      // Act
      const response = await updateGameInstance(request, { params: { id: 'instance-1' } });

      // Assert
      await expectSuccessResponse(response, { id: updatedInstance.id });
    });

    it('❌ should handle non-existent game instance', async () => {
      // Arrange
      const coordinatorToken = coordinatorJwtFactory();
      const updateData = { status: 'UNAVAILABLE' };

      mockPrisma.gameInstance.findFirst.mockResolvedValue(null);

      const request = createMockRequest(
        'PUT', 
        'http://localhost:3000/api/coordinator/games/nonexistent', 
        updateData, 
        coordinatorToken
      );

      // Act
      const response = await updateGameInstance(request, { params: { id: 'nonexistent' } });

      // Assert
      await expectErrorResponse(response, 404, 'Game instance not found');
    });
  });
});