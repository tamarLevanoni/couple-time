import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyApiResponseStructure, parseJsonResponse, createMockApiResponse, createMockPrisma } from '../utils';
import { mockData, mockTokens, createMockRequest } from '../test-helpers';
import { Role } from '@/types/schema';

// Import admin users route handlers
import { GET as getAdminUsers, POST as createAdminUser } from '@/app/api/admin/users/route';
import { PUT as updateAdminUser } from '@/app/api/admin/users/[id]/route';

// Mock dependencies
vi.mock('@/lib/db', () => ({ prisma: createMockPrisma() }));
vi.mock('next-auth/jwt', () => ({ getToken: vi.fn() }));
vi.mock('@/lib/api-response', () => ({ apiResponse: createMockApiResponse() }));
vi.mock('@/lib/permissions', () => ({ assertAdminRole: vi.fn() }));
vi.mock('@/lib/validations', () => ({
  CreateUserSchema: { parse: vi.fn() },
  UpdateUserSchema: { parse: vi.fn() },
}));
vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn().mockResolvedValue('hashed-password') },
}));

describe('GET /api/admin/users', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return paginated users for admin', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    
    const mockUsers = [mockData.user(), mockData.user({ id: 'user-2' })];
    
    vi.mocked(getToken, true).mockResolvedValue(mockTokens.admin);
    vi.mocked(prisma.user.findMany, true).mockResolvedValue(mockUsers);
    vi.mocked(prisma.user.count, true).mockResolvedValue(2);

    const request = new NextRequest('http://localhost/api/admin/users?page=1&limit=10');
    const response = await getAdminUsers(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
    expect(data.data.users).toHaveLength(2);
    expect(data.data.pagination).toEqual(expect.objectContaining({
      page: 1,
      limit: 10,
      total: 2,
    }));
  });

  it('should return 401 when not authenticated', async () => {
    const { getToken } = await import('next-auth/jwt');
    vi.mocked(getToken, true).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/admin/users');
    const response = await getAdminUsers(request);

    expect(response.status).toBe(401);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Authentication required');
  });
});

describe('POST /api/admin/users', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should create new user successfully', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    const { CreateUserSchema } = await import('@/lib/validations');
    
    const userData = {
      email: 'new@example.com',
      name: 'New User',
      phone: '050-1234567',
      password: 'password123',
      roles: [Role.CENTER_COORDINATOR],
    };

    vi.mocked(getToken, true).mockResolvedValue(mockTokens.admin);
    vi.mocked(CreateUserSchema.parse).mockReturnValue(userData);
    vi.mocked(prisma.user.findUnique, true).mockResolvedValue(null);
    vi.mocked(prisma.user.create, true).mockResolvedValue(mockData.user(userData));

    const request = createMockRequest('http://localhost/api/admin/users', 'POST', userData);
    const response = await createAdminUser(request);

    expect(response.status).toBe(201);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(true);
    expect(data.data.email).toBe('new@example.com');
  });

  it('should reject duplicate email', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    const { CreateUserSchema } = await import('@/lib/validations');
    
    const userData = { 
      email: 'existing@example.com', 
      name: 'User',
      phone: '050-1234567',
      password: 'password123',
      roles: [Role.CENTER_COORDINATOR],
    };

    vi.mocked(getToken, true).mockResolvedValue(mockTokens.admin);
    vi.mocked(CreateUserSchema.parse).mockReturnValue(userData);
    vi.mocked(prisma.user.findUnique, true).mockResolvedValue(mockData.user({ email: userData.email }));

    const request = createMockRequest('http://localhost/api/admin/users', 'POST', userData);
    const response = await createAdminUser(request);

    expect(response.status).toBe(400);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(false);
  });
});

describe('PUT /api/admin/users/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should update user successfully', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    const { UpdateUserSchema } = await import('@/lib/validations');
    
    const updateData = { name: 'Updated Name' };
    const existingUser = mockData.user({ id: 'user-123' });
    const updatedUser = { ...existingUser, ...updateData };

    vi.mocked(getToken, true).mockResolvedValue(mockTokens.admin);
    vi.mocked(UpdateUserSchema.parse).mockReturnValue(updateData);
    vi.mocked(prisma.user.findUnique, true).mockResolvedValue(existingUser);
    vi.mocked(prisma.user.update, true).mockResolvedValue(updatedUser);

    const request = createMockRequest('http://localhost/api/admin/users/user-123', 'PUT', updateData);
    const response = await updateAdminUser(request, { params: { id: 'user-123' } });

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('Updated Name');
  });

  it('should return 404 for non-existent user', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    const { UpdateUserSchema } = await import('@/lib/validations');
    
    vi.mocked(getToken, true).mockResolvedValue(mockTokens.admin);
    vi.mocked(UpdateUserSchema.parse).mockReturnValue({ name: 'New Name' });
    vi.mocked(prisma.user.findUnique, true).mockResolvedValue(null);

    const request = createMockRequest('http://localhost/api/admin/users/nonexistent', 'PUT', { name: 'New Name' });
    const response = await updateAdminUser(request, { params: { id: 'nonexistent' } });

    expect(response.status).toBe(404);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('User not found');
  });
});