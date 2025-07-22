// Vitest setup file for global test configuration
import { afterAll, beforeAll, beforeEach, vi } from 'vitest';

// Mock environment variables that tests might need
Object.defineProperty(process.env, 'NODE_ENV', {
  value: 'test',
  configurable: true,
  writable: true,
  enumerable: true,
});
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing';
process.env.NEXTAUTH_URL = 'http://localhost:3000';

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test to prevent test interference
  vi.clearAllMocks();
});

// Silence console warnings during tests unless explicitly testing them
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterAll(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

// Mock Next.js router if needed by tests
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    query: {},
    pathname: '/',
    asPath: '/',
  }),
}));

// Mock Next.js navigation if needed by tests
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));