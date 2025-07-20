import { NextRequest } from 'next/server';
import { Role, RentalStatus, GameInstanceStatus, Area, GameCategory, TargetAudience } from '@/types/schema';

// Common mock data factories
export const mockData = {
  center: (overrides = {}) => ({
    id: 'center-1',
    name: 'Test Center',
    city: 'Test City',
    area: Area.NORTH,
    isActive: true,
    coordinatorId: 'coordinator-1',
    superCoordinatorId: 'super-1',
    location: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }),

  centerWithRelations: (overrides = {}) => ({
    ...mockData.center(),
    coordinator: {
      id: 'coordinator-1',
      name: 'Test Coordinator',
      email: 'coordinator@test.com',
      phone: '1234567890',
    },
    superCoordinator: {
      id: 'super-1',
      name: 'Test Super',
      email: 'super@test.com',
      phone: '0987654321',
    },
    _count: { gameInstances: 5 },
    gameInstances: [],
    rentals: [],
    ...overrides,
  }),

  user: (overrides = {}) => ({
    id: 'user-1',
    name: 'Test User',
    email: 'user@test.com',
    phone: '1234567890',
    roles: [],
    isActive: true,
    managedCenterId: null,
    supervisedCenterIds: [],
    googleId: null,
    password: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }),

  game: (overrides = {}) => ({
    id: 'game-1',
    name: 'Test Game',
    description: 'A test game',
    categories: [GameCategory.THERAPY],
    targetAudiences: [TargetAudience.MARRIED],
    imageUrl: 'https://example.com/image.jpg',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }),

  gameInstance: (overrides = {}) => ({
    id: 'gi-1',
    gameId: 'game-1',
    centerId: 'center-1',
    status: GameInstanceStatus.AVAILABLE,
    notes: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    expectedReturnDate: new Date('2024-01-15'),
    game: mockData.game(),
    center: mockData.center(),
    ...overrides,
  }),

  rental: (overrides = {}) => ({
    id: 'rental-1',
    userId: 'user-1',
    centerId: 'center-1',
    status: RentalStatus.PENDING,
    requestDate: new Date('2024-01-01'),
    borrowDate: null,
    expectedReturnDate: new Date('2024-01-15'),
    returnDate: null,
    notes: 'Test rental',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    user: mockData.user(),
    gameInstances: [mockData.gameInstance()],
    ...overrides,
  }),
};

// Mock tokens for different roles - using mockData.user() as base
export const mockTokens = {
  coordinator: {
    id: 'coordinator-1',
    roles: [Role.CENTER_COORDINATOR],
    email: 'coordinator@test.com',
    name: 'Test Coordinator',
  },
  superCoordinator: {
    id: 'super-1',
    roles: [Role.SUPER_COORDINATOR],
    email: 'super@test.com',
    name: 'Test Super Coordinator',
  },
  admin: {
    id: 'admin-1',
    roles: [Role.ADMIN],
    email: 'admin@test.com',
    name: 'Test Admin',
  },
  user: mockData.user(),
};

// Helper function to create mock requests
export function createMockRequest(url: string, method: string = 'GET', body?: any): NextRequest {
  const request = new NextRequest(url, {
    method,
    ...(body && { body: JSON.stringify(body) }),
    headers: { 'Content-Type': 'application/json' },
  });
  return request;
}


// Common test scenarios
export const testScenarios = {
  unauthenticated: {
    description: 'should return 401 for unauthenticated request',
    token: null,
    expectedStatus: 401,
  },
  
  wrongRole: (role: keyof typeof mockTokens) => ({
    description: `should return 403 for ${role} role`,
    token: mockTokens[role],
    expectedStatus: 403,
  }),

  databaseError: {
    description: 'should handle database errors gracefully',
    mockError: new Error('Database connection failed'),
    expectedStatus: 500,
  },

  resourceNotFound: {
    description: 'should return 404 for missing resource',
    mockData: null,
    expectedStatus: 404,
  },
};
