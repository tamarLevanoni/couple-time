import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createMockPrisma } from './utils';
import { Role } from '@prisma/client';

// Import login endpoint handlers
import { POST as loginGoogle } from '@/app/api/auth/login/google/route';
import { POST as loginEmail } from '@/app/api/auth/login/email/route';

// Mock prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
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
  rentals: [],
};

const mockUserWithPassword = {
  ...mockUser,
  password: 'hashedPassword123',
  googleId: null,
};

const mockGoogleUser = {
  ...mockUser,
  googleId: 'google123',
  password: null,
};

function createMockRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/test', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('Auth Login Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
  });

  describe('POST /api/auth/login/google', () => {
    const validGoogleLogin = {
      googleId: 'google123',
    };

    it('should login with Google successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockGoogleUser);

      const request = createMockRequest(validGoogleLogin);
      const response = await loginGoogle(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe('test@example.com');
      expect(data.data.googleId).toBe('google123');
      expect(data.data.rentals).toBeDefined();
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { googleId: 'google123' },
        include: expect.any(Object),
      });
    });

    it('should reject login for non-existent Google account', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const request = createMockRequest(validGoogleLogin);
      const response = await loginGoogle(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('חשבון Google זה לא רשום במערכת');
    });

    it('should reject login for inactive user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockGoogleUser,
        isActive: false,
      });

      const request = createMockRequest(validGoogleLogin);
      const response = await loginGoogle(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('חשבון המשתמש אינו פעיל');
    });

    it('should reject invalid input - missing googleId', async () => {
      const request = createMockRequest({
        // Missing googleId
      });

      const response = await loginGoogle(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('נתונים לא תקינים');
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should reject empty googleId', async () => {
      const request = createMockRequest({
        googleId: '',
      });

      const response = await loginGoogle(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('נתונים לא תקינים');
    });

    it('should handle database query errors', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest(validGoogleLogin);
      const response = await loginGoogle(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('שגיאה בכניסה עם Google');
    });

    it('should include user rentals in response', async () => {
      const userWithRentals = {
        ...mockGoogleUser,
        rentals: [
          {
            id: 'rental123',
            status: 'ACTIVE',
            gameInstances: [{ id: 'game1', centerId: 'center1', gameId: 'game1' }],
          },
        ],
      };
      mockPrisma.user.findUnique.mockResolvedValue(userWithRentals);

      const request = createMockRequest(validGoogleLogin);
      const response = await loginGoogle(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.rentals).toHaveLength(1);
      expect(data.data.rentals[0].status).toBe('ACTIVE');
    });
  });

  describe('POST /api/auth/login/email', () => {
    const validEmailLogin = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login with email and password successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUserWithPassword);

      const request = createMockRequest(validEmailLogin);
      const response = await loginEmail(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe('test@example.com');
      expect(data.data.password).toBeUndefined(); // Password should be removed from response
      expect(data.data.rentals).toBeDefined();
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword123');
    });

    it('should reject login for non-existent email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const request = createMockRequest(validEmailLogin);
      const response = await loginEmail(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('כתובת מייל או סיסמה שגויים');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should reject login for inactive user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUserWithPassword,
        isActive: false,
      });

      const request = createMockRequest(validEmailLogin);
      const response = await loginEmail(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('חשבון המשתמש אינו פעיל');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should reject login for Google-only account', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockGoogleUser,
        password: null,
      });

      const request = createMockRequest(validEmailLogin);
      const response = await loginEmail(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('חשבון זה לא נוצר עם סיסמה');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should reject incorrect password', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
      mockPrisma.user.findUnique.mockResolvedValue(mockUserWithPassword);

      const request = createMockRequest(validEmailLogin);
      const response = await loginEmail(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('כתובת מייל או סיסמה שגויים');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword123');
    });

    it('should reject invalid input - missing email', async () => {
      const request = createMockRequest({
        password: 'password123',
        // Missing email
      });

      const response = await loginEmail(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('נתונים לא תקינים');
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should reject invalid input - missing password', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        // Missing password
      });

      const response = await loginEmail(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('נתונים לא תקינים');
    });

    it('should reject invalid email format', async () => {
      const request = createMockRequest({
        email: 'invalid-email',
        password: 'password123',
      });

      const response = await loginEmail(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('נתונים לא תקינים');
    });

    it('should reject empty password', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        password: '',
      });

      const response = await loginEmail(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('נתונים לא תקינים');
    });

    it('should handle database query errors', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest(validEmailLogin);
      const response = await loginEmail(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('שגיאה בכניסה');
    });

    it('should handle bcrypt comparison errors', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUserWithPassword);
      vi.mocked(bcrypt.compare).mockRejectedValue(new Error('Bcrypt error'));

      const request = createMockRequest(validEmailLogin);
      const response = await loginEmail(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('שגיאה בכניסה');
    });

    it('should include user rentals in response', async () => {
      const userWithRentals = {
        ...mockUserWithPassword,
        rentals: [
          {
            id: 'rental123',
            status: 'PENDING',
            gameInstances: [{ id: 'game1', centerId: 'center1', gameId: 'game1' }],
          },
        ],
      };
      mockPrisma.user.findUnique.mockResolvedValue(userWithRentals);

      const request = createMockRequest(validEmailLogin);
      const response = await loginEmail(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.rentals).toHaveLength(1);
      expect(data.data.rentals[0].status).toBe('PENDING');
      expect(data.data.password).toBeUndefined();
    });
  });
});