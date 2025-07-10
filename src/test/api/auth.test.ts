import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET as getMe, PUT as updateMe } from '@/app/api/auth/me/route';
import { POST as register } from '@/app/api/auth/register/route';
import { expectSuccessResponse, expectErrorResponse } from '../utils';
import { userFactory, jwtFactory } from '../factories';
import { createMockRequest, mockPrisma } from '../test-helpers';
import { getServerSession } from 'next-auth';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
  },
}));

describe('/api/auth/*', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/auth/me', () => {
    it('✅ should return user profile', async () => {
      // Arrange
      const mockUser = userFactory({ id: 'user-1' });
      const mockSession = { user: { id: 'user-1' } };
      
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const request = createMockRequest('GET', 'http://localhost:3000/api/auth/me');

      // Act
      const response = await getMe(request);

      // Assert
      await expectSuccessResponse(response, { id: mockUser.id });
    });

    it('❌ should require authentication', async () => {
      // Arrange
      vi.mocked(getServerSession).mockResolvedValue(null);

      const request = createMockRequest('GET', 'http://localhost:3000/api/auth/me');

      // Act
      const response = await getMe(request);

      // Assert
      await expectErrorResponse(response, 401, 'Authentication required');
    });

    it('❌ should handle user not found', async () => {
      // Arrange
      const mockSession = { user: { id: 'user-1' } };
      
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const request = createMockRequest('GET', 'http://localhost:3000/api/auth/me');

      // Act
      const response = await getMe(request);

      // Assert
      await expectErrorResponse(response, 404, 'User not found');
    });
  });

  describe('PUT /api/auth/me', () => {
    it('✅ should update user profile', async () => {
      // Arrange
      const mockSession = { user: { id: 'user-1' } };
      const updateData = { name: 'Updated Name', phone: '+9876543210' };
      const updatedUser = userFactory({ ...updateData });
      
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const request = createMockRequest('PUT', 'http://localhost:3000/api/auth/me', updateData);

      // Act
      const response = await updateMe(request);

      // Assert
      await expectSuccessResponse(response, { name: updateData.name });
    });

    it('❌ should validate input data', async () => {
      // Arrange
      const mockSession = { user: { id: 'user-1' } };
      const invalidData = { name: '', phone: '' }; // Empty fields should fail validation
      
      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const request = createMockRequest('PUT', 'http://localhost:3000/api/auth/me', invalidData);

      // Act
      const response = await updateMe(request);

      // Assert
      await expectErrorResponse(response, 400, 'Invalid request data');
    });

    it('❌ should require authentication', async () => {
      // Arrange
      vi.mocked(getServerSession).mockResolvedValue(null);
      const updateData = { name: 'Updated Name', phone: '+9876543210' };

      const request = createMockRequest('PUT', 'http://localhost:3000/api/auth/me', updateData);

      // Act
      const response = await updateMe(request);

      // Assert
      await expectErrorResponse(response, 401, 'Authentication required');
    });
  });

  describe('POST /api/auth/register', () => {
    it('✅ should register new user', async () => {
      // Arrange
      const registrationData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phone: '+1234567890'
      };
      const newUser = userFactory({
        email: registrationData.email,
        name: registrationData.name,
        phone: registrationData.phone
      });

      mockPrisma.user.findUnique.mockResolvedValue(null); // No existing user
      mockPrisma.user.create.mockResolvedValue(newUser);

      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/register', registrationData);

      // Act
      const response = await register(request);

      // Assert
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(registrationData.email);
    });

    it('❌ should reject duplicate email', async () => {
      // Arrange
      const registrationData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
        phone: '+1234567890'
      };
      const existingUser = userFactory({ email: registrationData.email });

      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/register', registrationData);

      // Act
      const response = await register(request);

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('כבר קיים');
    });

    it('❌ should validate required fields', async () => {
      // Arrange
      const incompleteData = {
        email: 'test@example.com',
        // Missing password, name, phone
      };

      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/register', incompleteData);

      // Act
      const response = await register(request);

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('חסרים פרטים');
    });

    it('❌ should validate password length', async () => {
      // Arrange
      const weakPasswordData = {
        email: 'test@example.com',
        password: '123', // Too short
        name: 'Test User',
        phone: '+1234567890'
      };

      const request = createMockRequest('POST', 'http://localhost:3000/api/auth/register', weakPasswordData);

      // Act
      const response = await register(request);

      // Assert
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('6 תווים');
    });
  });
});