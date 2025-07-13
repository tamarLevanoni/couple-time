import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createMockPrisma } from './utils';
import { Role } from '@prisma/client';

// Import registration endpoint handlers
import { POST as registerGoogle } from '@/app/api/auth/register/google/route';
import { POST as registerEmail } from '@/app/api/auth/register/email/route';

// Mock prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const mockPrisma = createMockPrisma();
Object.assign(vi.mocked(prisma).user, mockPrisma.user);

// Mock bcrypt
vi.mock('bcryptjs');

const mockUser = {
  id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  phone: '+972501234567',
  roles: [Role.USER],
  managedCenterId: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function createMockRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/test', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('Auth Registration Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword123' as never);
  });

  describe('POST /api/auth/register/google', () => {
    const validGoogleRequest = {
      googleId: 'google123',
      name: 'Test User',
      email: 'test@example.com',
      phone: '+972501234567',
    };

    it('should register user with Google OAuth successfully', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null) // Email check
        .mockResolvedValueOnce(null); // Google ID check
      
      mockPrisma.user.create.mockResolvedValue({
        ...mockUser,
        googleId: 'google123',
      });

      const request = createMockRequest(validGoogleRequest);
      const response = await registerGoogle(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe('test@example.com');
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          googleId: 'google123',
          email: 'test@example.com',
          name: 'Test User',
          phone: '+972501234567',
          roles: [Role.USER],
          managedCenterId: null,
          isActive: true,
        },
        select: expect.any(Object),
      });
    });

    it('should reject registration if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);

      const request = createMockRequest(validGoogleRequest);
      const response = await registerGoogle(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('משתמש עם כתובת מייל זו כבר קיים');
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should reject registration if Google ID already exists', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null) // Email check
        .mockResolvedValueOnce({ ...mockUser, googleId: 'google123' }); // Google ID check

      const request = createMockRequest(validGoogleRequest);
      const response = await registerGoogle(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('חשבון Google זה כבר רשום');
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should reject invalid input - missing googleId', async () => {
      const request = createMockRequest({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+972501234567',
        // Missing googleId
      });

      const response = await registerGoogle(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('נתונים לא תקינים');
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should reject invalid input - invalid email', async () => {
      const request = createMockRequest({
        googleId: 'google123',
        name: 'Test User',
        email: 'invalid-email',
        phone: '+972501234567',
      });

      const response = await registerGoogle(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('נתונים לא תקינים');
    });

    it('should reject invalid input - empty name', async () => {
      const request = createMockRequest({
        googleId: 'google123',
        name: '',
        email: 'test@example.com',
        phone: '+972501234567',
      });

      const response = await registerGoogle(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('נתונים לא תקינים');
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest(validGoogleRequest);
      const response = await registerGoogle(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('שגיאה בהרשמה עם Google');
    });
  });

  describe('POST /api/auth/register/email', () => {
    const validEmailRequest = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+972501234567',
      password: 'password123',
    };

    it('should register user with email and password successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValue({
        ...mockUser,
        password: 'hashedPassword123',
      });

      const request = createMockRequest(validEmailRequest);
      const response = await registerEmail(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe('test@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'hashedPassword123',
          name: 'Test User',
          phone: '+972501234567',
          roles: [Role.USER],
          managedCenterId: null,
          isActive: true,
        },
        select: expect.any(Object),
      });
    });

    it('should reject registration if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);

      const request = createMockRequest(validEmailRequest);
      const response = await registerEmail(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('משתמש עם כתובת מייל זו כבר קיים');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should reject weak password', async () => {
      const request = createMockRequest({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+972501234567',
        password: '123', // Too short
      });

      const response = await registerEmail(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('נתונים לא תקינים');
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should reject missing required fields', async () => {
      const request = createMockRequest({
        name: 'Test User',
        // Missing email, phone, password
      });

      const response = await registerEmail(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('נתונים לא תקינים');
    });

    it('should reject invalid email format', async () => {
      const request = createMockRequest({
        name: 'Test User',
        email: 'invalid-email-format',
        phone: '+972501234567',
        password: 'password123',
      });

      const response = await registerEmail(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('נתונים לא תקינים');
    });

    it('should reject password that is too long', async () => {
      const request = createMockRequest({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+972501234567',
        password: 'a'.repeat(101), // Too long
      });

      const response = await registerEmail(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('נתונים לא תקינים');
    });

    it('should handle bcrypt hashing errors', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      vi.mocked(bcrypt.hash).mockRejectedValue(new Error('Hashing error'));

      const request = createMockRequest(validEmailRequest);
      const response = await registerEmail(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('שגיאה בהרשמה');
    });

    it('should handle database creation errors', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest(validEmailRequest);
      const response = await registerEmail(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('שגיאה בהרשמה');
    });
  });
});