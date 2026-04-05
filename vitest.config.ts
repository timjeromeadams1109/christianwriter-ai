import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/__tests__/**/*.test.ts'],
    // Load .env.test so env vars are available at module import time
    env: {
      DATABASE_URL: 'postgresql://test:test@localhost:5432/testdb',
      NEXTAUTH_SECRET: 'test-secret-min-32-chars-long-for-hmac',
      MFA_ENCRYPTION_KEY: 'test-mfa-key-32-chars-long-exactly!!',
      ANTHROPIC_API_KEY: 'sk-ant-test-key',
      STRIPE_SECRET_KEY: 'sk_test_stripe_key',
      STRIPE_WEBHOOK_SECRET: 'whsec_test_webhook_secret',
      STRIPE_PRICE_PRO: 'price_pro_test',
      STRIPE_PRICE_MINISTRY: 'price_ministry_test',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/app/api/**/*.ts', 'src/lib/**/*.ts'],
      exclude: ['src/lib/db/schema.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
