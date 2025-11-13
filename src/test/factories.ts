// Test factories for creating mock data following CLAUDE.md standards
import { Role, RentalStatus, GameInstanceStatus, Area, GameCategory, TargetAudience } from '@/types/schema';

// Factory functions with randomized IDs for isolated unit tests
export const createMockUser = (overrides = {}) => ({
  id: 'user-' + Math.random().toString(36).substr(2, 9),
  name: 'Test User',
  email: 'user@example.com',
  phone: '050-1234567',
  roles: [],
  isActive: true,
  supervisedCenterIds: [],
  googleId: null,
  password: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockGame = (overrides = {}) => ({
  id: 'game-' + Math.random().toString(36).substr(2, 9),
  name: 'Test Game',
  description: 'A test game description',
  categories: [GameCategory.COMMUNICATION],
  targetAudiences: [TargetAudience.GENERAL],
  imageUrl: 'https://example.com/game.jpg',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockCenter = (overrides = {}) => ({
  id: 'center-' + Math.random().toString(36).substr(2, 9),
  name: 'Test Center',
  area: Area.CENTER,
  isActive: true,
  coordinatorId: null,
  superCoordinatorId: null,
  location: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockGameInstance = (overrides = {}) => ({
  id: 'instance-' + Math.random().toString(36).substr(2, 9),
  gameId: 'game-' + Math.random().toString(36).substr(2, 9),
  centerId: 'center-' + Math.random().toString(36).substr(2, 9),
  status: GameInstanceStatus.AVAILABLE,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockRental = (overrides = {}) => ({
  id: 'rental-' + Math.random().toString(36).substr(2, 9),
  userId: 'user-' + Math.random().toString(36).substr(2, 9),
  centerId: 'center-' + Math.random().toString(36).substr(2, 9),
  status: RentalStatus.PENDING,
  requestDate: new Date(),
  borrowDate: null,
  expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  returnDate: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Complex factory with relations
export const createMockCenterWithRelations = (overrides = {}) => {
  const coordinator = createMockUser({ 
    roles: [Role.CENTER_COORDINATOR],
    name: 'Test Coordinator',
    email: 'coordinator@example.com'
  });
  
  const superCoordinator = createMockUser({ 
    roles: [Role.SUPER_COORDINATOR],
    name: 'Test Super Coordinator',
    email: 'super@example.com'
  });

  const center = createMockCenter({
    coordinatorId: coordinator.id,
    superCoordinatorId: superCoordinator.id,
  });

  const gameInstances = [
    createMockGameInstance({ centerId: center.id, status: GameInstanceStatus.AVAILABLE }),
    createMockGameInstance({ centerId: center.id, status: GameInstanceStatus.BORROWED }),
  ];

  return {
    ...center,
    coordinator,
    superCoordinator,
    gameInstances,
    _count: { gameInstances: gameInstances.length },
    rentals: [],
    ...overrides,
  };
};