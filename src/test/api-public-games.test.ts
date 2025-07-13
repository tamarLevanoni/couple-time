import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/public/games/route';
import { createMockGame } from './factories';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: { game: { findMany: vi.fn() } }
}));

vi.mock('@/lib/api-response', () => ({
  apiResponse: vi.fn((success, data) => 
    Response.json(success ? { success: true, data } : { success: false, error: { message: 'שגיאה בטעינת המשחקים' } })
  )
}));

import { prisma } from '@/lib/db';

describe('/api/public/games', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns active games', async () => {
    const games = [createMockGame(), createMockGame()];
    (prisma.game.findMany as any).mockResolvedValue(games);

    const response = await GET(new NextRequest('http://localhost:3000/api/public/games'));
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toEqual(games);
  });

  it('handles errors', async () => {
    (prisma.game.findMany as any).mockRejectedValue(new Error());

    const response = await GET(new NextRequest('http://localhost:3000/api/public/games'));
    const data = await response.json();

    expect(data.success).toBe(false);
  });
});