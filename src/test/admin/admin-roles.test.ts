import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyApiResponseStructure, parseJsonResponse, createMockApiResponse, createMockPrisma } from '../utils';
import { mockData, mockTokens, createMockRequest } from '../test-helpers';
import { Role } from '@/types/schema';

// Import admin roles route handler
import { PUT as assignRoles } from '@/app/api/admin/roles/route';

// Mock dependencies
vi.mock('@/lib/db', () => ({ prisma: createMockPrisma() }));
vi.mock('next-auth/jwt', () => ({ getToken: vi.fn() }));
vi.mock('@/lib/api-response', () => ({ apiResponse: createMockApiResponse() }));
vi.mock('@/lib/permissions', () => ({ assertAdminRole: vi.fn() }));
vi.mock('@/lib/validations', () => ({
  AssignRoleSchema: { parse: vi.fn() },
}));

describe('PUT /api/admin/roles', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should assign role successfully', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    const { AssignRoleSchema } = await import('@/lib/validations');
    
    const roleData = {
      userId: 'user-123',
      roles: [Role.CENTER_COORDINATOR],
      managedCenterId: 'center-1',
    };

    vi.mocked(getToken, true).mockResolvedValue(mockTokens.admin);
    vi.mocked(AssignRoleSchema.parse).mockReturnValue(roleData);
    vi.mocked(prisma.user.findUnique, true).mockResolvedValue(mockData.user());
    vi.mocked(prisma.center.findFirst, true).mockResolvedValue(mockData.center());
    vi.mocked(prisma.user.update, true).mockResolvedValue(mockData.user({
      roles: [Role.CENTER_COORDINATOR],
    }));

    const request = createMockRequest('http://localhost/api/admin/roles', 'PUT', roleData);
    const response = await assignRoles(request);

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
  });

  it('should return 404 for non-existent user', async () => {
    const { getToken } = await import('next-auth/jwt');
    const { prisma } = await import('@/lib/db');
    const { AssignRoleSchema } = await import('@/lib/validations');
    
    const roleData = { userId: 'nonexistent', roles: [Role.ADMIN] };

    vi.mocked(getToken, true).mockResolvedValue(mockTokens.admin);
    vi.mocked(AssignRoleSchema.parse).mockReturnValue(roleData);
    vi.mocked(prisma.user.findUnique, true).mockResolvedValue(null);

    const request = createMockRequest('http://localhost/api/admin/roles', 'PUT', roleData);
    const response = await assignRoles(request);

    expect(response.status).toBe(404);
    const data = await parseJsonResponse(response);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('User not found');
  });
});