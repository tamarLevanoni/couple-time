import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyApiResponseStructure, parseJsonResponse, createMockApiResponse, createMockPrisma } from '../utils';
import { mockData, createMockRequest } from '../test-helpers';

// Import auth register route handler
import { POST as registerEmail, OPTIONS as registerEmailOptions } from '@/app/api/auth/register/email/route';

// Mock dependencies
vi.mock('@/lib/db', () => ({ prisma: createMockPrisma() }));

vi.mock('@/lib/api-response', () => ({
  apiResponse: createMockApiResponse(),
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
  },
}));

vi.mock('@/lib/validations', () => ({
  RegisterWithEmailSchema: {
    parse: vi.fn(),
  },
}));

describe('POST /api/auth/register/email', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create new user successfully', async () => {
    const { RegisterWithEmailSchema } = await import('@/lib/validations');
    const { prisma } = await import('@/lib/db');
    
    const mockUserData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      phone: '050-1234567',
    };

    vi.mocked(RegisterWithEmailSchema.parse).mockReturnValue(mockUserData);
    vi.mocked(prisma.user.findUnique, true).mockResolvedValue(null); // User doesn't exist
    vi.mocked(prisma.user.create, true).mockResolvedValue(mockData.user({
      email: mockUserData.email,
      name: mockUserData.name,
      phone: mockUserData.phone,
    }));

    const request = createMockRequest('http://localhost/api/auth/register/email', 'POST', mockUserData);
    const response = await registerEmail(request);

    expect(response.status).toBe(201);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(expect.objectContaining({
      email: mockUserData.email,
      name: mockUserData.name,
    }));
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: mockUserData.email,
        password: 'hashed-password',
        name: mockUserData.name,
        phone: mockUserData.phone,
        isActive: true,
      }),
      select: expect.any(Object),
    });
  });

  it('should reject duplicate email', async () => {
    const { RegisterWithEmailSchema } = await import('@/lib/validations');
    const { prisma } = await import('@/lib/db');
    
    const mockUserData = {
      email: 'existing@example.com',
      password: 'password123',
      name: 'Test User',
      phone: '050-1234567',
    };

    vi.mocked(RegisterWithEmailSchema.parse).mockReturnValue(mockUserData);
    vi.mocked(prisma.user.findUnique, true).mockResolvedValue(mockData.user({ email: mockUserData.email }));

    const request = createMockRequest('http://localhost/api/auth/register/email', 'POST', mockUserData);
    const response = await registerEmail(request);

    expect(response.status).toBe(400);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('משתמש עם כתובת מייל זו כבר קיים במערכת');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('should handle validation errors', async () => {
    const { RegisterWithEmailSchema } = await import('@/lib/validations');
    
    const validationError = {
      name: 'ZodError',
      errors: [{ path: ['email'], message: 'Invalid email' }],
    };
    vi.mocked(RegisterWithEmailSchema.parse).mockImplementation(() => {
      throw validationError;
    });

    const request = createMockRequest('http://localhost/api/auth/register/email', 'POST', {
      email: 'invalid-email',
      password: 'pass',
    });
    const response = await registerEmail(request);

    expect(response.status).toBe(400);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('נתונים לא תקינים');
  });

  it('should handle database errors gracefully', async () => {
    const { RegisterWithEmailSchema } = await import('@/lib/validations');
    const { prisma } = await import('@/lib/db');
    
    const mockUserData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      phone: '050-1234567',
    };

    vi.mocked(RegisterWithEmailSchema.parse).mockReturnValue(mockUserData);
    vi.mocked(prisma.user.findUnique, true).mockResolvedValue(null);
    vi.mocked(prisma.user.create, true).mockRejectedValue(new Error('Database error'));

    const request = createMockRequest('http://localhost/api/auth/register/email', 'POST', mockUserData);
    const response = await registerEmail(request);

    expect(response.status).toBe(500);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('שגיאה בהרשמה. נסה שוב מאוחר יותר');
  });
});

describe('OPTIONS /api/auth/register/email', () => {
  it('should handle OPTIONS request', async () => {
    const request = new NextRequest('http://localhost/api/auth/register/email', { method: 'OPTIONS' });
    const response = await registerEmailOptions();

    expect(response.status).toBe(200);
    const data = await parseJsonResponse(response);
    verifyApiResponseStructure(data);
    expect(data.success).toBe(true);
  });
});