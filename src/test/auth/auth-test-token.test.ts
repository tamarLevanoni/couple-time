import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyApiResponseStructure, parseJsonResponse, createMockPrisma } from '../utils';
import { mockData, createMockRequest } from '../test-helpers';
import { Role } from '@/types/schema';

// Import auth test token route handler
import { POST as testToken } from '@/app/api/auth/test-token/route';

// Mock dependencies
vi.mock('@/lib/db', () => ({ prisma: createMockPrisma() }));

vi.mock('next-auth/jwt', () => ({
  encode: vi.fn().mockResolvedValue('test-jwt-token'),
}));

describe('POST /api/auth/test-token', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset NEXTAUTH_SECRET (NODE_ENV is already set to 'test' in setup.ts)
    process.env.NEXTAUTH_SECRET = 'test-secret';
  });

  it('should generate test token successfully in test environment', async () => {
    // Temporarily set NODE_ENV to development for this test since the route only allows development
    const originalNodeEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true });
    
    const { prisma } = await import('@/lib/db');
    const { encode } = await import('next-auth/jwt');
    
    const mockUser = mockData.user({
      email: 'test@example.com',
      roles: [Role.ADMIN],
    });

    vi.mocked(prisma.user.findUnique, true).mockResolvedValue(mockUser);
    vi.mocked(encode, true).mockResolvedValue('test-jwt-token');

    const request = createMockRequest('http://localhost/api/auth/test-token', 'POST', {
      email: 'test@example.com',
    });
    const response = await testToken(request);

    // Restore original NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', { value: originalNodeEnv, configurable: true });

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    expect(data.token).toBe('test-jwt-token');
    expect(data.usage).toContain('Bearer');
    expect(data.user).toEqual(expect.objectContaining({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      roles: mockUser.roles,
    }));
    expect(encode).toHaveBeenCalledWith({
      token: expect.objectContaining({
        sub: mockUser.id,
        id: mockUser.id,
        email: mockUser.email,
        roles: mockUser.roles,
      }),
      secret: 'test-secret',
    });
  });

  it('should return 401 for non-existent user', async () => {
    const { prisma } = await import('@/lib/db');
    
    vi.mocked(prisma.user.findUnique, true).mockResolvedValue(null);

    const request = createMockRequest('http://localhost/api/auth/test-token', 'POST', {
      email: 'nonexistent@example.com',
    });
    const response = await testToken(request);

    expect(response.status).toBe(401);
    const data = await parseJsonResponse(response);
    expect(data.error).toBe('Invalid email or password');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'nonexistent@example.com' },
    });
  });

  it('should return 403 in production environment', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', configurable: true });

    const request = createMockRequest('http://localhost/api/auth/test-token', 'POST', {
      email: 'test@example.com',
    });
    const response = await testToken(request);

    // Restore original NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', { value: originalNodeEnv, configurable: true });

    expect(response.status).toBe(403);
    const responseText = await response.text();
    expect(responseText).toBe('Not allowed in production');
  });

  it('should handle missing NEXTAUTH_SECRET', async () => {
    const { prisma } = await import('@/lib/db');
    
    delete process.env.NEXTAUTH_SECRET;
    
    const mockUser = mockData.user({ email: 'test@example.com' });
    vi.mocked(prisma.user.findUnique, true).mockResolvedValue(mockUser);

    const request = createMockRequest('http://localhost/api/auth/test-token', 'POST', {
      email: 'test@example.com',
    });
    const response = await testToken(request);

    expect(response.status).toBe(500);
    const data = await parseJsonResponse(response);
    expect(data.error).toBe('Failed to generate token');
  });

  it('should handle JWT encoding errors', async () => {
    const { prisma } = await import('@/lib/db');
    const { encode } = await import('next-auth/jwt');
    
    const mockUser = mockData.user({ email: 'test@example.com' });
    vi.mocked(prisma.user.findUnique, true).mockResolvedValue(mockUser);
    vi.mocked(encode, true).mockRejectedValue(new Error('JWT encoding failed'));

    const request = createMockRequest('http://localhost/api/auth/test-token', 'POST', {
      email: 'test@example.com',
    });
    const response = await testToken(request);

    expect(response.status).toBe(500);
    const data = await parseJsonResponse(response);
    expect(data.error).toBe('Failed to generate token');
  });

  it('should handle database errors gracefully', async () => {
    const { prisma } = await import('@/lib/db');
    
    vi.mocked(prisma.user.findUnique, true).mockRejectedValue(new Error('Database connection failed'));

    const request = createMockRequest('http://localhost/api/auth/test-token', 'POST', {
      email: 'test@example.com',
    });
    const response = await testToken(request);

    expect(response.status).toBe(500);
    const data = await parseJsonResponse(response);
    expect(data.error).toBe('Failed to generate token');
  });
});