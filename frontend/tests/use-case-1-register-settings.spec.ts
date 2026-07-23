import { test, expect } from '@playwright/test';
import { generateUniqueEmail, registerUser, takeScreenshot, navigateBySidebar } from './test-utils';

test.describe('Use Case 1: Register Users and Privacy Settings', () => {
  test('user registers and configures privacy/security preferences', async ({ page }, testInfo) => {
    const email = generateUniqueEmail();
    const password = 'SecurePass1!';
    const name = 'Test User';

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, testInfo, '01-landing-page');

    await page.goto('/login?mode=register');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, testInfo, '02-register-form');

    await registerUser(page, name, email, password);
    await takeScreenshot(page, testInfo, '03-dashboard-after-register');

    // Use sidebar navigation (client-side) for protected routes
    await navigateBySidebar(page, 'Settings', '/app/settings');
    await takeScreenshot(page, testInfo, '04-settings-page');

    // Toggle all switches in the settings
    const toggleButtons = page.locator('button[role="switch"], button.h-7.w-12');
    const toggleCount = await toggleButtons.count();
    for (let i = 0; i < toggleCount; i++) {
      await toggleButtons.nth(i).click();
      await page.waitForTimeout(200);
    }
    await takeScreenshot(page, testInfo, '05-toggles-changed');

    // Verify the page has content loaded
    const heading = page.getByRole('heading', { name: /settings|language|security|privacy/i }).first();
    await expect(heading).toBeVisible({ timeout: 5000 });
    await takeScreenshot(page, testInfo, '06-settings-loaded');
  });
});
