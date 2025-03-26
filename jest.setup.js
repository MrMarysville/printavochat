// jest.setup.js
require('@testing-library/jest-dom');

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '',
    query: {},
    asPath: '',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
  }),
}));

// Mock environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_PRINTAVO_API_URL: 'https://test-api.example.com',
  NEXT_PUBLIC_PRINTAVO_EMAIL: 'test@example.com',
  NEXT_PUBLIC_PRINTAVO_TOKEN: 'test-token',
};

// Mock fetch for API tests
global.fetch = jest.fn();

// Silence console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Clean up timers after each test
afterEach(() => {
  jest.useRealTimers();
});