import { test, expect } from '@playwright/test';
import { generateUniqueEmail, registerUser, takeScreenshot, navigateBySidebar, logoutAndClear } from './test-utils';

async function toggleSetting(page: any, label: string) {
  const row = page.locator('.flex.items-center.gap-3.rounded-2xl').filter({ has: page.locator('p.text-sm.font-semibold', { hasText: label }) });
  const toggle = row.locator('button.h-7.w-12');
  const wasOn = await toggle.evaluate((el: Element) => el.classList.contains('bg-gradient-primary'));
  await toggle.click();
  await page.waitForTimeout(300);
  return wasOn;
}

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

    await navigateBySidebar(page, 'Settings', '/app/settings');
    await takeScreenshot(page, testInfo, '04-settings-page');

    const wasDonationsPublic = await toggleSetting(page, 'Show donations publicly');
    await takeScreenshot(page, testInfo, '05-show-donations-toggled');

    const wasPublicProfile = await toggleSetting(page, 'Public profile');
    await takeScreenshot(page, testInfo, '06-public-profile-toggled');

    const wasInventoryReminders = await toggleSetting(page, 'Inventory reminders');
    await takeScreenshot(page, testInfo, '07-inventory-reminders-toggled');

    const heading = page.getByRole('heading', { name: /settings/i }).first();
    await expect(heading).toBeVisible({ timeout: 5000 });
    await takeScreenshot(page, testInfo, '08-settings-heading-visible');

    await navigateBySidebar(page, 'Dashboard', '/app/dashboard');
    await takeScreenshot(page, testInfo, '09-back-to-dashboard');

    await navigateBySidebar(page, 'Settings', '/app/settings');
    await takeScreenshot(page, testInfo, '10-settings-returned');

    const donationToggle = page.locator('.flex.items-center.gap-3.rounded-2xl')
      .filter({ has: page.locator('p.text-sm.font-semibold', { hasText: 'Show donations publicly' }) })
      .locator('button.h-7.w-12');
    const stillOn = await donationToggle.evaluate((el: Element) => el.classList.contains('bg-gradient-primary'));
    expect(stillOn).toBe(!wasDonationsPublic);
    await takeScreenshot(page, testInfo, '11-settings-persisted');
  });

  test('rejects invalid email format on register', async ({ page }, testInfo) => {
    await page.goto('/login?mode=register');
    await page.waitForLoadState('networkidle');

    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'notanemail');
    await page.fill('[name="password"]', 'SecurePass1!');
    await page.getByRole('button', { name: /create account/i }).click();
    await page.waitForTimeout(1500);

    const errorText = page.getByText(/valid email/i);
    await expect(errorText).toBeVisible({ timeout: 3000 });
    await takeScreenshot(page, testInfo, 'invalid-email-error');
  });

  test('rejects empty required fields on register', async ({ page }, testInfo) => {
    await page.goto('/login?mode=register');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /create account/i }).click();
    await page.waitForTimeout(1500);

    const errors = page.locator('p.text-red-500');
    const count = await errors.count();
    expect(count).toBeGreaterThanOrEqual(1);
    await takeScreenshot(page, testInfo, 'empty-fields-errors');
  });

  test('rejects duplicate email', async ({ page }, testInfo) => {
    const email = generateUniqueEmail();
    await registerUser(page, 'User A', email, 'SecurePass1!');
    await logoutAndClear(page);

    await page.goto('/login?mode=register');
    await page.waitForLoadState('networkidle');
    await page.fill('[name="name"]', 'User B');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', 'SecurePass1!');
    await page.getByRole('button', { name: /create account/i }).click();
    await page.waitForTimeout(2000);

    const err = page.getByText(/already exists/i);
    await expect(err).toBeVisible({ timeout: 5000 });
    await takeScreenshot(page, testInfo, 'duplicate-email-error');
  });

  test('redirects unauthenticated users to login', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await logoutAndClear(page);
    await page.goto('/app/dashboard');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/login/);
    await takeScreenshot(page, testInfo, 'redirected-to-login');
  });
});
