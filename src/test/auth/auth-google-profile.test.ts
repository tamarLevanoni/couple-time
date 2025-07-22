import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyApiResponseStructure, parseJsonResponse, createMockApiResponse, createMockPrisma } from '../utils';
import { mockData, createMockRequest } from '../test-helpers';

// Import auth Google profile route handler
import { POST as completeGoogleProfile, OPTIONS as completeGoogleProfileOptions } from '@/app/api/auth/complete-google-profile/route';

// Mock dependencies
vi.mock('@/lib/db', () => ({ prisma: createMockPrisma() }));

vi.mock('@/lib/api-response', () => ({
  apiResponse: createMockApiResponse(),
}));

describe('POST /api/auth/complete-google-profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create new Google user successfully', async () => {
    const { prisma } = await import('@/lib/db');
    
    const mockGoogleData = {
      googleId: 'google123',
      email: 'google@example.com',
      name: 'Google User',
      phone: '050-1234567',
    };

    vi.mocked(prisma.user.findUnique, true)
      .mockResolvedValueOnce(null) // No user by email
      .mockResolvedValueOnce(null); // No user by Google ID
    vi.mocked(prisma.user.create, true).mockResolvedValue(mockData.user({
      googleId: mockGoogleData.googleId,
      email: mockGoogleData.email,
      name: mockGoogleData.name,
      phone: mockGoogleData.phone,
    }));

    const request = createMockRequest('http://localhost/api/auth/complete-google-profile', 'POST', mockGoogleData);
    const response = await completeGoogleProfile(request);

    expect(response.status).toBe(201);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(expect.objectContaining({
      email: mockGoogleData.email,
      name: mockGoogleData.name,
    }));
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        googleId: mockGoogleData.googleId,
        email: mockGoogleData.email,
        name: mockGoogleData.name,
        phone: mockGoogleData.phone,
        isActive: true,
      }),
      select: expect.any(Object),
    });
  });

  it('should reject duplicate email for Google profile', async () => {
    const { prisma } = await import('@/lib/db');
    
    const mockGoogleData = {
      googleId: 'google123',
      email: 'existing@example.com',
      name: 'Google User',
      phone: '050-1234567',
    };

    vi.mocked(prisma.user.findUnique, true).mockResolvedValue(mockData.user({ email: mockGoogleData.email }));

    const request = createMockRequest('http://localhost/api/auth/complete-google-profile', 'POST', mockGoogleData);
    const response = await completeGoogleProfile(request);

    expect(response.status).toBe(400);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('משתמש עם כתובת מייל זו כבר קיים במערכת');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('should reject duplicate Google ID', async () => {
    const { prisma } = await import('@/lib/db');
    
    const mockGoogleData = {
      googleId: 'existing-google-id',
      email: 'new@example.com',
      name: 'Google User',
      phone: '050-1234567',
    };

    vi.mocked(prisma.user.findUnique, true)
      .mockResolvedValueOnce(null) // No user by email
      .mockResolvedValueOnce(mockData.user({ googleId: mockGoogleData.googleId })); // User exists by Google ID

    const request = createMockRequest('http://localhost/api/auth/complete-google-profile', 'POST', mockGoogleData);
    const response = await completeGoogleProfile(request);

    expect(response.status).toBe(400);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('חשבון Google זה כבר רשום במערכת');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('should handle validation errors', async () => {
    const invalidData = {
      googleId: '', // Invalid - empty string
      email: 'invalid-email', // Invalid email
      name: 'User',
      phone: '123', // Invalid phone
    };

    const request = createMockRequest('http://localhost/api/auth/complete-google-profile', 'POST', invalidData);
    const response = await completeGoogleProfile(request);

    expect(response.status).toBe(400);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('נתונים לא תקינים');
  });

  it('should handle database errors gracefully', async () => {
    const { prisma } = await import('@/lib/db');
    
    const mockGoogleData = {
      googleId: 'google123',
      email: 'test@example.com',
      name: 'Test User',
      phone: '050-1234567',
    };

    vi.mocked(prisma.user.findUnique, true)
      .mockResolvedValueOnce(null) // No user by email
      .mockResolvedValueOnce(null); // No user by Google ID
    vi.mocked(prisma.user.create, true).mockRejectedValue(new Error('Database error'));

    const request = createMockRequest('http://localhost/api/auth/complete-google-profile', 'POST', mockGoogleData);
    const response = await completeGoogleProfile(request);

    expect(response.status).toBe(500);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('שגיאה בהשלמת הפרופיל. נסה שוב מאוחר יותר');
  });
});

describe('OPTIONS /api/auth/complete-google-profile', () => {
  it('should handle OPTIONS request', async () => {
    const request = new NextRequest('http://localhost/api/auth/complete-google-profile', { method: 'OPTIONS' });
    const response = await completeGoogleProfileOptions();

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
  });
});