import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/public/centers/route';
import { createMockCenterWithRelations } from './factories';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: { center: { findMany: vi.fn() } }
}));

vi.mock('@/lib/api-response', () => ({
  apiResponse: vi.fn((success, data) => 
    Response.json(success ? { success: true, data } : { success: false, error: { message: 'שגיאה בטעינת המרכזים' } })
  )
}));

import { prisma } from '@/lib/db';

describe('/api/public/centers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns active centers', async () => {
    const centers = [createMockCenterWithRelations()];
    (prisma.center.findMany as any).mockResolvedValue(centers);

    const response = await GET(new NextRequest('http://localhost:3000/api/public/centers'));
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toEqual(centers);
  });

  it('handles errors', async () => {
    (prisma.center.findMany as any).mockRejectedValue(new Error());

    const response = await GET(new NextRequest('http://localhost:3000/api/public/centers'));
    const data = await response.json();

    expect(data.success).toBe(false);
  });
});