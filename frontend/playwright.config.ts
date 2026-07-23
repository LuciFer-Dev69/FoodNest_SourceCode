import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testMatch: 'use-case-*.spec.ts',
  fullyParallel: false,
  retries: 1,
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
    { name: 'use-case-1-register-settings', testMatch: 'use-case-1-register-settings.spec.ts' },
    { name: 'use-case-2-inventory', testMatch: 'use-case-2-inventory.spec.ts' },
    { name: 'use-case-3-browse-claim-donations', testMatch: 'use-case-3-browse-claim-donations.spec.ts' },
    { name: 'use-case-4-analytics', testMatch: 'use-case-4-analytics.spec.ts' },
    { name: 'use-case-5-notifications', testMatch: 'use-case-5-notifications.spec.ts' },
    { name: 'use-case-6-meal-planner', testMatch: 'use-case-6-meal-planner.spec.ts' },
  ],
  outputDir: 'test-results',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
});
