// jest.setup.js
require('@testing-library/jest-dom');
const { TextEncoder, TextDecoder } = require('util');

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Suppress punycode deprecation warning in tests
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && 
      warning.message && 
      warning.message.includes('punycode')) {
    // Ignore punycode deprecation warning
    return;
  }
  // Still log other warnings that aren't silenced
  if (warning.name !== 'DeprecationWarning') {
    console.warn(warning.name, warning.message);
  }
});

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
global.fetch = jest.fn(() => 
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
    headers: new Map(),
  })
);

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Setup window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Silence console warnings during tests
const originalConsole = { ...console };
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

// Restore console after all tests
afterAll(() => {
  global.console = originalConsole;
});