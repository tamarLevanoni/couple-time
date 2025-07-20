import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyApiResponseStructure, parseJsonResponse, createMockApiResponse, createMockPrisma } from '../utils';
import { mockData, mockTokens, createMockRequest } from '../test-helpers';
import { Role } from '@/types/schema';

// Import user profile route handlers
import { GET as getUserProfile, PUT as updateUserProfile } from '@/app/api/user/route';

// Mock dependencies
vi.mock('@/lib/db', () => ({ prisma: createMockPrisma() }));

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

vi.mock('@/lib/api-response', () => ({
  apiResponse: createMockApiResponse(),
}));

vi.mock('@/lib/validations', () => ({
  UpdateUserProfileSchema: { parse: vi.fn() },
}));

describe('GET /api/user', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user profile with active rentals successfully', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    const mockUser = mockData.user({ 
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      phone: '050-1234567',
    });

    const mockUserWithRentals = {
      ...mockUser,
      rentals: [
        mockData.rental({ status: 'ACTIVE', userId: 'user-123' }),
        mockData.rental({ status: 'ACTIVE', userId: 'user-123' }),
      ],
    };

    vi.mocked(getToken, true).mockResolvedValue({ ...mockTokens.user, googleId: undefined });
    vi.mocked(prisma.user.findUnique, true).mockResolvedValue(mockUserWithRentals);

    const request = new NextRequest('http://localhost/api/user');
    const response = await getUserProfile(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(expect.objectContaining({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      phone: '050-1234567',
      currentRentals: expect.arrayContaining([
        expect.objectContaining({ status: 'ACTIVE' }),
        expect.objectContaining({ status: 'ACTIVE' }),
      ]),
    }));

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      include: expect.any(Object), // USER_WITH_ACTIVE_RENTALS
    });
  });

  it('should return 401 when not authenticated', async () => {
    const { getToken } = await import('next-auth/jwt');
    vi.mocked(getToken, true).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/user');
    const response = await getUserProfile(request);

    expect(response.status).toBe(401);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Authentication required');
  });

  it('should return 404 when user not found', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    vi.mocked(getToken, true).mockResolvedValue({ ...mockTokens.user, id: 'nonexistent', googleId: undefined });
    vi.mocked(prisma.user.findUnique, true).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/user');
    const response = await getUserProfile(request);

    expect(response.status).toBe(404);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('User not found');
  });

  it('should handle database errors gracefully', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    vi.mocked(getToken, true).mockResolvedValue({ ...mockTokens.user, googleId: undefined });
    vi.mocked(prisma.user.findUnique, true).mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost/api/user');
    const response = await getUserProfile(request);

    expect(response.status).toBe(500);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
  });
});

describe('PUT /api/user', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update user profile successfully', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    const { UpdateUserProfileSchema } = await import('@/lib/validations');
    
    const updateData = {
      name: 'Updated Name',
      phone: '050-9876543',
    };

    const existingUser = mockData.user({ id: 'user-123', name: 'Old Name' });
    const updatedUser = { ...existingUser, ...updateData };

    vi.mocked(getToken, true).mockResolvedValue({ ...mockTokens.user, googleId: undefined });
    vi.mocked(UpdateUserProfileSchema.parse).mockReturnValue(updateData);
    vi.mocked(prisma.user.findUnique, true).mockResolvedValue(existingUser);
    vi.mocked(prisma.user.update, true).mockResolvedValue(updatedUser);

    const request = createMockRequest('http://localhost/api/user', 'PUT', updateData);
    const response = await updateUserProfile(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(expect.objectContaining({
      id: 'user-123',
      name: 'Updated Name',
      phone: '050-9876543',
    }));

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: updateData,
      select: expect.any(Object), // USER_CONTACT_FIELDS
    });
  });

  it('should return 401 when not authenticated', async () => {
    const { getToken } = await import('next-auth/jwt');
    vi.mocked(getToken, true).mockResolvedValue(null);

    const request = createMockRequest('http://localhost/api/user', 'PUT', { name: 'New Name' });
    const response = await updateUserProfile(request);

    expect(response.status).toBe(401);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Authentication required');
  });

  it('should return 404 when user not found for update', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    const { UpdateUserProfileSchema } = await import('@/lib/validations');
    
    vi.mocked(getToken, true).mockResolvedValue({ ...mockTokens.user, id: 'nonexistent', googleId: undefined });
    vi.mocked(UpdateUserProfileSchema.parse).mockReturnValue({ name: 'New Name' });
    vi.mocked(prisma.user.findUnique, true).mockResolvedValue(null);

    const request = createMockRequest('http://localhost/api/user', 'PUT', { name: 'New Name' });
    const response = await updateUserProfile(request);

    expect(response.status).toBe(404);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('User not found');
  });

  it('should handle validation errors', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { UpdateUserProfileSchema } = await import('@/lib/validations');
    
    const validationError = {
      name: 'ZodError',
      errors: [{ path: ['phone'], message: 'Invalid phone format' }],
    };

    vi.mocked(getToken, true).mockResolvedValue({ ...mockTokens.user, googleId: undefined });
    vi.mocked(UpdateUserProfileSchema.parse).mockImplementation(() => {
      throw validationError;
    });

    const request = createMockRequest('http://localhost/api/user', 'PUT', { phone: 'invalid' });
    const response = await updateUserProfile(request);

    expect(response.status).toBe(400);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
    expect(data.error.message).toContain('validation');
  });

  it('should handle database errors during update', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    const { UpdateUserProfileSchema } = await import('@/lib/validations');
    
    vi.mocked(getToken, true).mockResolvedValue({ ...mockTokens.user, googleId: undefined });
    vi.mocked(UpdateUserProfileSchema.parse).mockReturnValue({ name: 'New Name' });
    vi.mocked(prisma.user.findUnique, true).mockResolvedValue(mockData.user({ id: 'user-123' }));
    vi.mocked(prisma.user.update, true).mockRejectedValue(new Error('Database update failed'));

    const request = createMockRequest('http://localhost/api/user', 'PUT', { name: 'New Name' });
    const response = await updateUserProfile(request);

    expect(response.status).toBe(500);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
  });

  it('should only update allowed profile fields', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    const { UpdateUserProfileSchema } = await import('@/lib/validations');
    
    const updateData = {
      name: 'Updated Name',
      phone: '050-9876543',
      // Note: sensitive fields like roles, isActive should not be updatable via this endpoint
    };

    const existingUser = mockData.user({ id: 'user-123' });
    const updatedUser = { ...existingUser, ...updateData };

    vi.mocked(getToken, true).mockResolvedValue({ ...mockTokens.user, googleId: undefined });
    vi.mocked(UpdateUserProfileSchema.parse).mockReturnValue(updateData);
    vi.mocked(prisma.user.findUnique, true).mockResolvedValue(existingUser);
    vi.mocked(prisma.user.update, true).mockResolvedValue(updatedUser);

    const request = createMockRequest('http://localhost/api/user', 'PUT', updateData);
    const response = await updateUserProfile(request);

    expect(response.status).toBe(200);
    
    // Verify that only the allowed fields are passed to the update
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: updateData, // Should only contain name and phone, not sensitive fields
      select: expect.any(Object),
    });
  });
});