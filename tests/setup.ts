import "dotenv/config";

// Mock environment variables for tests
process.env.NODE_ENV = "test";
process.env.FORGE_CLIENT_ID = "test-client-id";
process.env.FORGE_CLIENT_SECRET = "test-client-secret";
process.env.FORGE_REDIRECT_URI =
  "http://localhost:8081/api/autodesk/auth/callback";
process.env.MONGODB_URI = "mongodb://localhost:27017/forge-api-test";

// Global test timeout
jest.setTimeout(30000);

// Mock console.log to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};

// Mock fetch globally if needed
global.fetch = jest.fn();
