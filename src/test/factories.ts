// Test factories for creating mock data following CLAUDE.md standards
import { Area, GameCategory, TargetAudience, GameInstanceStatus } from '@/types/schema';

export const createMockGame = (overrides = {}) => ({
  id: 'game-' + Math.random().toString(36).substr(2, 9),
  name: 'Test Game',
  description: 'A test game description',
  categories: [GameCategory.COMMUNICATION],
  targetAudiences: [TargetAudience.GENERAL],
  imageUrl: 'https://example.com/game.jpg',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockCenter = (overrides = {}) => ({
  id: 'center-' + Math.random().toString(36).substr(2, 9),
  name: 'Test Center',
  city: 'Test City',
  area: Area.CENTER,
  location: { lat: 32.0853, lng: 34.7818 },
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockCoordinator = (overrides = {}) => ({
  id: 'user-' + Math.random().toString(36).substr(2, 9),
  name: 'Test Coordinator',
  email: 'coordinator@example.com',
  phone: '050-1234567',
  ...overrides,
});

export const createMockGameInstance = (overrides = {}) => ({
  id: 'instance-' + Math.random().toString(36).substr(2, 9),
  gameId: 'game-' + Math.random().toString(36).substr(2, 9),
  status: GameInstanceStatus.AVAILABLE,
  ...overrides,
});

export const createMockCenterWithRelations = (overrides = {}) => {
  const coordinator = createMockCoordinator();
  const gameInstances = [
    createMockGameInstance({ status: GameInstanceStatus.AVAILABLE }),
    createMockGameInstance({ status: GameInstanceStatus.BORROWED }),
  ];

  return {
    ...createMockCenter(),
    coordinator,
    gameInstances,
    ...overrides,
  };
};