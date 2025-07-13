// Test utilities for shared testing logic following CLAUDE.md standards
import { expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * Creates a mock NextRequest for testing API routes
 */
export const createMockRequest = (url: string) => {
  return new NextRequest(url);
};

/**
 * Creates a mock apiResponse function for testing
 */
export const createMockApiResponse = () => {
  return vi.fn((success, data, error, status) => {
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
  });
};

/**
 * Creates mock Prisma client methods
 */
export const createMockPrisma = () => ({
  game: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  center: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  rental: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  gameInstance: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
});

/**
 * Parses JSON response from API tests
 */
export const parseJsonResponse = async (response: Response) => {
  return await response.json();
};

/**
 * Verifies API response structure matches expected format
 */
export const verifyApiResponseStructure = (data: any) => {
  expect(data).toHaveProperty('success');
  expect(typeof data.success).toBe('boolean');
  
  if (data.success) {
    expect(data).toHaveProperty('data');
  } else {
    expect(data).toHaveProperty('error');
    expect(data.error).toHaveProperty('message');
  }
};