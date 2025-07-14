// Comprehensive tests for /api/user endpoint following CLAUDE.md standards
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getUserProfile, PUT as updateUserProfile } from '@/app/api/user/route';
import { verifyApiResponseStructure, parseJsonResponse, createMockPrisma } from './utils';
import { Role, RentalStatus } from '@/types/schema';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
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

describe('/api/user', () => {
  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    name: 'Test User',
    phone: '050-1234567',
    roles: [Role.USER],
    isActive: true,
    managedCenterId: null,
    rentals: [
      {
        id: 'rental-1',
        status: RentalStatus.ACTIVE,
        gameInstances: [
          {
            id: 'instance-1',
            game: { id: 'game-1', name: 'Test Game' },
            center: { id: 'center-1', name: 'Test Center' },
          },
        ],
      },
    ],
    supervisedCenters: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/user', () => {
    it('should return user profile with active rentals when authenticated', async () => {
      // Mock authentication
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue({ id: mockUser.id } as any);

      // Mock database
      const { prisma } = await import('@/lib/db');
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const request = new NextRequest('http://localhost/api/user');
      const response = await getUserProfile(request);
      
      expect(response.status).toBe(200);
      
      const data = await parseJsonResponse(response);
      verifyApiResponseStructure(data);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        phone: mockUser.phone,
        roles: mockUser.roles,
        currentRentals: mockUser.rentals,
      }));
      
      // Verify database query structure
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: expect.objectContaining({
          id: true,
          email: true,
          name: true,
          phone: true,
          roles: true,
          isActive: true,
          managedCenterId: true,
          rentals: expect.objectContaining({
            where: {
              status: { in: ['PENDING', 'ACTIVE'] }
            },
            include: expect.any(Object),
            orderBy: { createdAt: 'desc' },
          }),
          supervisedCenters: expect.any(Object),
        }),
      });
    });

    it('should return 401 when not authenticated', async () => {
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue(null);

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
      vi.mocked(getToken).mockResolvedValue({ id: mockUser.id } as any);

      const { prisma } = await import('@/lib/db');
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

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
      vi.mocked(getToken).mockResolvedValue({ id: mockUser.id } as any);

      const { prisma } = await import('@/lib/db');
      vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/user');
      const response = await getUserProfile(request);
      
      expect(response.status).toBe(500);
      
      const data = await parseJsonResponse(response);
      verifyApiResponseStructure(data);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Internal server error');
    });

    it('should return profile for coordinator with managed center', async () => {
      const coordinatorUser = {
        ...mockUser,
        roles: [Role.CENTER_COORDINATOR],
        managedCenterId: 'center-1',
      };

      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue({ id: coordinatorUser.id } as any);

      const { prisma } = await import('@/lib/db');
      vi.mocked(prisma.user.findUnique).mockResolvedValue(coordinatorUser as any);

      const request = new NextRequest('http://localhost/api/user');
      const response = await getUserProfile(request);
      
      expect(response.status).toBe(200);
      
      const data = await parseJsonResponse(response);
      expect(data.data.roles).toContain(Role.CENTER_COORDINATOR);
      expect(data.data.managedCenterId).toBe('center-1');
    });

    it('should return profile for super coordinator with supervised centers', async () => {
      const superCoordinatorUser = {
        ...mockUser,
        roles: [Role.SUPER_COORDINATOR],
        supervisedCenters: [
          { id: 'center-1', name: 'Center 1', city: 'City 1', area: 'CENTER', isActive: true },
          { id: 'center-2', name: 'Center 2', city: 'City 2', area: 'NORTH', isActive: true },
        ],
      };

      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue({ id: superCoordinatorUser.id } as any);

      const { prisma } = await import('@/lib/db');
      vi.mocked(prisma.user.findUnique).mockResolvedValue(superCoordinatorUser as any);

      const request = new NextRequest('http://localhost/api/user');
      const response = await getUserProfile(request);
      
      expect(response.status).toBe(200);
      
      const data = await parseJsonResponse(response);
      expect(data.data.roles).toContain(Role.SUPER_COORDINATOR);
      expect(data.data.supervisedCenters).toHaveLength(2);
    });
  });

  describe('PUT /api/user', () => {
    it('should update user profile successfully', async () => {
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue({ id: mockUser.id } as any);

      const updatedUser = {
        id: mockUser.id,
        email: mockUser.email,
        name: 'Updated Name',
        phone: '052-9876543',
      };

      const { prisma } = await import('@/lib/db');
      vi.mocked(prisma.user.update).mockResolvedValue(updatedUser as any);

      const requestBody = {
        name: 'Updated Name',
        phone: '052-9876543',
      };

      const request = new NextRequest('http://localhost/api/user', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      });

      const response = await updateUserProfile(request);
      
      expect(response.status).toBe(200);
      
      const data = await parseJsonResponse(response);
      verifyApiResponseStructure(data);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Updated Name');
      expect(data.data.phone).toBe('052-9876543');
      
      // Verify database update call
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          name: 'Updated Name',
          phone: '052-9876543',
        },
        select: expect.objectContaining({
          id: true,
          email: true,
          name: true,
          phone: true,
        }),
      });
    });

    it('should require authentication', async () => {
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue(null);

      const requestBody = {
        name: 'Updated Name',
      };

      const request = new NextRequest('http://localhost/api/user', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      });

      const response = await updateUserProfile(request);
      
      expect(response.status).toBe(401);
      
      const data = await parseJsonResponse(response);
      verifyApiResponseStructure(data);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Authentication required');
    });

    it('should handle validation errors', async () => {
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue({ id: mockUser.id } as any);

      const invalidRequestBody = {
        name: '', // Empty name should fail validation
      };

      const request = new NextRequest('http://localhost/api/user', {
        method: 'PUT',
        body: JSON.stringify(invalidRequestBody),
      });

      const response = await updateUserProfile(request);
      
      expect(response.status).toBe(400);
      
      const data = await parseJsonResponse(response);
      verifyApiResponseStructure(data);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Invalid request data');
    });

    it('should handle empty request body successfully', async () => {
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue({ id: mockUser.id } as any);

      const updatedUser = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        phone: mockUser.phone,
      };

      const { prisma } = await import('@/lib/db');
      vi.mocked(prisma.user.update).mockResolvedValue(updatedUser as any);

      const emptyRequestBody = {};

      const request = new NextRequest('http://localhost/api/user', {
        method: 'PUT',
        body: JSON.stringify(emptyRequestBody),
      });

      const response = await updateUserProfile(request);
      
      expect(response.status).toBe(200);
      
      const data = await parseJsonResponse(response);
      verifyApiResponseStructure(data);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(updatedUser);
    });


    it('should handle database errors gracefully', async () => {
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue({ id: mockUser.id } as any);

      const { prisma } = await import('@/lib/db');
      vi.mocked(prisma.user.update).mockRejectedValue(new Error('Database error'));

      const requestBody = {
        name: 'Updated Name',
      };

      const request = new NextRequest('http://localhost/api/user', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      });

      const response = await updateUserProfile(request);
      
      expect(response.status).toBe(500);
      
      const data = await parseJsonResponse(response);
      verifyApiResponseStructure(data);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Internal server error');
    });
  });
});