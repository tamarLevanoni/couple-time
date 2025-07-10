import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET as getUser, PUT as updateUser } from '@/app/api/user/route';
import { POST as createRental } from '@/app/api/user/rentals/route';
import { PUT as updateRental } from '@/app/api/user/rentals/[id]/route';
import { expectSuccessResponse, expectErrorResponse } from '../utils';
import { userFactory, jwtFactory, gameInstanceFactory, rentalFactory } from '../factories';
import { createMockRequest, mockPrisma } from '../test-helpers';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}));

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

describe('/api/user/*', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });


  describe('GET /api/user', () => {
    it('✅ should return user profile', async () => {
      // Arrange
      const userToken = jwtFactory();
      const mockUser = userFactory({ id: userToken.id });
      
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const request = createMockRequest('GET', 'http://localhost:3000/api/user', undefined, userToken);

      // Act
      const response = await getUser(request);

      // Assert
      await expectSuccessResponse(response, { id: mockUser.id });
    });

    it('❌ should require authentication', async () => {
      // Arrange
      const request = createMockRequest('GET', 'http://localhost:3000/api/user');

      // Act
      const response = await getUser(request);

      // Assert
      await expectErrorResponse(response, 401, 'Authentication required');
    });

    it('❌ should handle user not found', async () => {
      // Arrange
      const userToken = jwtFactory();
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const request = createMockRequest('GET', 'http://localhost:3000/api/user', undefined, userToken);

      // Act
      const response = await getUser(request);

      // Assert
      await expectErrorResponse(response, 404, 'User not found');
    });
  });

  describe('PUT /api/user', () => {
    it('✅ should update user profile', async () => {
      // Arrange
      const userToken = jwtFactory();
      const updateData = { name: 'Updated Name', phone: '+9876543210' };
      const existingUser = userFactory({ id: userToken.id });
      const updatedUser = { ...existingUser, ...updateData };

      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const request = createMockRequest('PUT', 'http://localhost:3000/api/user', updateData, userToken);

      // Act
      const response = await updateUser(request);

      // Assert
      await expectSuccessResponse(response, { name: updateData.name });
    });

    it('❌ should validate input data', async () => {
      // Arrange
      const userToken = jwtFactory();
      const invalidData = { name: '' }; // Empty name should fail validation

      const request = createMockRequest('PUT', 'http://localhost:3000/api/user', invalidData, userToken);

      // Act
      const response = await updateUser(request);

      // Assert
      await expectErrorResponse(response, 400, 'Invalid request data');
    });

    it('❌ should require authentication', async () => {
      // Arrange
      const updateData = { name: 'Updated Name' };
      const request = createMockRequest('PUT', 'http://localhost:3000/api/user', updateData);

      // Act
      const response = await updateUser(request);

      // Assert
      await expectErrorResponse(response, 401, 'Authentication required');
    });
  });

  describe('POST /api/user/rentals', () => {
    it('✅ should create rental request', async () => {
      // Arrange
      const userToken = jwtFactory();
      const requestBody = {
        gameInstanceId: 'instance-1',
        requestDate: '2024-01-15',
        expectedReturnDate: '2024-01-20',
        notes: 'Test rental',
      };

      const mockGameInstance = gameInstanceFactory({
        id: 'instance-1',
        status: 'AVAILABLE',
      });
      
      const mockCreatedRental = rentalFactory({
        userId: userToken.id,
        gameInstanceId: 'instance-1',
        status: 'PENDING',
      });

      mockPrisma.gameInstance.findFirst.mockResolvedValue(mockGameInstance);
      mockPrisma.rental.findFirst.mockResolvedValue(null); // No existing rental
      mockPrisma.rental.create.mockResolvedValue(mockCreatedRental);

      const request = createMockRequest('POST', 'http://localhost:3000/api/user/rentals', requestBody, userToken);

      // Act
      const response = await createRental(request);

      // Assert
      await expectSuccessResponse(response, { id: mockCreatedRental.id });
    });

    it('❌ should reject unavailable game instance', async () => {
      // Arrange
      const userToken = jwtFactory();
      const requestBody = {
        gameInstanceId: 'instance-1',
        requestDate: '2024-01-15',
        expectedReturnDate: '2024-01-20',
      };

      mockPrisma.gameInstance.findFirst.mockResolvedValue(null);

      const request = createMockRequest('POST', 'http://localhost:3000/api/user/rentals', requestBody, userToken);

      // Act
      const response = await createRental(request);

      // Assert
      await expectErrorResponse(response, 404, 'Game instance not found or not available');
    });

    it('❌ should prevent duplicate rentals', async () => {
      // Arrange
      const userToken = jwtFactory();
      const requestBody = {
        gameInstanceId: 'instance-1',
        requestDate: '2024-01-15',
        expectedReturnDate: '2024-01-20',
      };

      const mockGameInstance = gameInstanceFactory({ status: 'AVAILABLE' });
      const existingRental = rentalFactory({ userId: userToken.id, status: 'PENDING' });

      mockPrisma.gameInstance.findFirst.mockResolvedValue(mockGameInstance);
      mockPrisma.rental.findFirst.mockResolvedValue(existingRental);

      const request = createMockRequest('POST', 'http://localhost:3000/api/user/rentals', requestBody, userToken);

      // Act
      const response = await createRental(request);

      // Assert
      await expectErrorResponse(response, 400, 'You already have a pending or active rental for this game');
    });
  });

  describe('PUT /api/user/rentals/[id]', () => {
    it('✅ should cancel own rental', async () => {
      // Arrange
      const userToken = jwtFactory();
      const updateData = { action: 'cancel', reason: 'Changed my mind' };
      const mockRental = rentalFactory({ 
        userId: userToken.id, 
        status: 'PENDING' 
      });
      const updatedRental = { ...mockRental, status: 'CANCELLED' };

      mockPrisma.rental.findFirst.mockResolvedValue(mockRental);
      mockPrisma.rental.update.mockResolvedValue(updatedRental);

      const request = createMockRequest(
        'PUT', 
        'http://localhost:3000/api/user/rentals/rental-1', 
        updateData, 
        userToken
      );

      // Act
      const response = await updateRental(request, { params: { id: 'rental-1' } });

      // Assert
      await expectSuccessResponse(response, { id: updatedRental.id });
    });

    it('❌ should reject access to other users rentals', async () => {
      // Arrange
      const userToken = jwtFactory();
      const updateData = { action: 'cancel' };

      mockPrisma.rental.findFirst.mockResolvedValue(null); // Not found for this user

      const request = createMockRequest(
        'PUT', 
        'http://localhost:3000/api/user/rentals/rental-1', 
        updateData, 
        userToken
      );

      // Act
      const response = await updateRental(request, { params: { id: 'rental-1' } });

      // Assert
      await expectErrorResponse(response, 404, 'Rental not found');
    });

    it('❌ should handle non-existent rental', async () => {
      // Arrange
      const userToken = jwtFactory();
      const updateData = { action: 'cancel' };

      mockPrisma.rental.findFirst.mockResolvedValue(null);

      const request = createMockRequest(
        'PUT', 
        'http://localhost:3000/api/user/rentals/nonexistent', 
        updateData, 
        userToken
      );

      // Act
      const response = await updateRental(request, { params: { id: 'nonexistent' } });

      // Assert
      await expectErrorResponse(response, 404, 'Rental not found');
    });
  });
});