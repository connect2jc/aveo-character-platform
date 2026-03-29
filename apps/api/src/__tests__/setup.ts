// Mock environment variables for all tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.STRIPE_SECRET_KEY = 'sk_test_fake_stripe_key';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_fake_webhook_secret';
process.env.ANTHROPIC_API_KEY = 'sk-ant-test-fake-key';
process.env.FAL_KEY = 'fal-test-fake-key';
process.env.ELEVENLABS_API_KEY = 'el-test-fake-key';
process.env.HEYGEN_API_KEY = 'hg-test-fake-key';
process.env.OPENAI_API_KEY = 'sk-test-fake-openai-key';
process.env.ENCRYPTION_KEY = 'a'.repeat(64); // 32-byte hex key for testing
process.env.AWS_S3_BUCKET = 'test-bucket';
process.env.AWS_REGION = 'us-east-1';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Reset all mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});
