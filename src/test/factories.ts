import { User, Center, Game, GameInstance, Rental, Role, RentalStatus, GameCategory, TargetAudience, Area, GameInstanceStatus } from '@prisma/client';

// Test data factories for consistent test data creation

export function userFactory(overrides: Partial<User> = {}): User {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    roles: [Role.USER],
    phone: '+1234567890',
    isActive: true,
    managedCenterIds: [],
    supervisedCenterIds: [],
    googleId: null,
    password: 'hashed-password',
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function adminUserFactory(overrides: Partial<User> = {}): User {
  return userFactory({
    id: 'admin-user-id',
    email: 'admin@example.com',
    name: 'Admin User',
    roles: [Role.ADMIN],
    ...overrides,
  });
}

export function coordinatorUserFactory(overrides: Partial<User> = {}): User {
  return userFactory({
    id: 'coordinator-user-id',
    email: 'coordinator@example.com',
    name: 'Coordinator User',
    roles: [Role.CENTER_COORDINATOR],
    managedCenterIds: ['center-1'],
    ...overrides,
  });
}

export function superCoordinatorUserFactory(overrides: Partial<User> = {}): User {
  return userFactory({
    id: 'super-coordinator-user-id',
    email: 'super@example.com',
    name: 'Super Coordinator User',
    roles: [Role.SUPER_COORDINATOR],
    supervisedCenterIds: ['center-1'],
    ...overrides,
  });
}

export function centerFactory(overrides: Partial<Center> = {}): Center {
  return {
    id: 'center-1',
    name: 'Test Center',
    city: 'Center City',
    area: Area.CENTER,
    coordinatorId: 'coordinator-user-id',
    superCoordinatorId: 'super-coordinator-user-id',
    location: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function gameFactory(overrides: Partial<Game> = {}): Game {
  return {
    id: 'game-1',
    name: 'Test Game',
    description: 'A test game for couples',
    category: GameCategory.COMMUNICATION,
    targetAudience: TargetAudience.GENERAL,
    imageUrl: 'https://example.com/game.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function gameInstanceFactory(overrides: Partial<GameInstance> = {}): GameInstance {
  return {
    id: 'instance-1',
    gameId: 'game-1',
    centerId: 'center-1',
    status: GameInstanceStatus.AVAILABLE,
    expectedReturnDate: null,
    notes: 'Test instance',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function rentalFactory(overrides: Partial<Rental> = {}): Rental {
  return {
    id: 'rental-1',
    userId: 'test-user-id',
    gameInstanceId: 'instance-1',
    status: RentalStatus.PENDING,
    requestDate: new Date(),
    approvedDate: null,
    borrowDate: null,
    returnDate: null,
    expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    notes: 'Test rental',
    rejectionReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// JWT Token factories for authentication
export function jwtFactory(overrides: any = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    roles: ['USER'],
    ...overrides,
  };
}

export function adminJwtFactory(overrides: any = {}) {
  return jwtFactory({
    id: 'admin-user-id',
    email: 'admin@example.com',
    name: 'Admin User',
    roles: ['ADMIN'],
    ...overrides,
  });
}

export function coordinatorJwtFactory(overrides: any = {}) {
  return jwtFactory({
    id: 'coordinator-user-id',
    email: 'coordinator@example.com',
    name: 'Coordinator User',
    roles: ['CENTER_COORDINATOR'],
    ...overrides,
  });
}

export function superCoordinatorJwtFactory(overrides: any = {}) {
  return jwtFactory({
    id: 'super-coordinator-user-id',
    email: 'super@example.com',
    name: 'Super Coordinator User',
    roles: ['SUPER_COORDINATOR'],
    ...overrides,
  });
}