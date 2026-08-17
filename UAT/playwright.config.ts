import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testMatch: 'uat-*.spec.ts',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 90000,
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 20000,
  },
  projects: [
    { name: 'uat-uc1', testMatch: 'uat-uc1.spec.ts' },
    { name: 'uat-uc2', testMatch: 'uat-uc2.spec.ts' },
    { name: 'uat-uc3', testMatch: 'uat-uc3.spec.ts' },
    { name: 'uat-uc4', testMatch: 'uat-uc4.spec.ts' },
    { name: 'uat-uc5', testMatch: 'uat-uc5.spec.ts' },
    { name: 'uat-uc6', testMatch: 'uat-uc6.spec.ts' },
  ],
  outputDir: 'test-results',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
});
