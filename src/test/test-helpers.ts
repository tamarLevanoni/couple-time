import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { beforeEach, vi } from 'vitest';
import type { JWT } from 'next-auth/jwt';

// Mock Prisma for consistent testing
export const mockPrisma = {
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  center: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  game: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  gameInstance: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  rental: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
};

// Create mock request with authentication
export function createMockRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  body?: any,
  token?: JWT | null
): NextRequest {
  const request = new NextRequest(url, {
    method,
    headers: {
      'content-type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Mock getToken to return the provided token
  vi.mocked(getToken).mockResolvedValue(token || null);

  return request;
}

// Setup test mocks
export function setupMocks() {
  // Mock the database
  vi.doMock('@/lib/db', () => ({
    prisma: mockPrisma,
  }));

  // Mock next-auth JWT
  vi.doMock('next-auth/jwt', () => ({
    getToken: vi.fn(),
  }));

  // Clear all mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });
}

// Authentication test helpers
export function mockAuthRequired(token?: JWT | null) {
  vi.mocked(getToken).mockResolvedValue(token || null);
}

export function mockAuthSuccess(token: JWT) {
  vi.mocked(getToken).mockResolvedValue(token);
}

export function mockAuthFailure() {
  vi.mocked(getToken).mockResolvedValue(null);
}

// Database mock helpers
export function mockDatabaseSuccess(model: keyof typeof mockPrisma, method: string, returnValue: any) {
  (mockPrisma[model] as any)[method].mockResolvedValue(returnValue);
}

export function mockDatabaseError(model: keyof typeof mockPrisma, method: string, error: Error) {
  (mockPrisma[model] as any)[method].mockRejectedValue(error);
}

export function mockDatabaseEmpty(model: keyof typeof mockPrisma, method: string) {
  (mockPrisma[model] as any)[method].mockResolvedValue(null);
}