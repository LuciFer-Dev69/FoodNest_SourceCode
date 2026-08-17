import { test, expect } from '@playwright/test';
import { generateUniqueEmail, registerUser, loginUser, logoutAndClear, navigateBySidebar, uatScreenshot } from './uat-utils';

async function toggleSetting(page: any, label: string) {
  const row = page.locator('.flex.items-center.gap-3.rounded-2xl').filter({ has: page.locator('p.text-sm.font-semibold', { hasText: label }) });
  const toggle = row.locator('button.h-7.w-12');
  const wasOn = await toggle.evaluate((el: Element) => el.classList.contains('bg-gradient-primary'));
  await toggle.click();
  await page.waitForTimeout(300);
  return wasOn;
}

test.describe('UAT — Use Case 1: Register Users and Privacy Settings', () => {
  test('UAT-01: New community member registers, completes 2FA, and reaches their dashboard', async ({ page }, testInfo) => {
    const email = generateUniqueEmail();
    const password = 'SecurePass1!';

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await uatScreenshot(page, testInfo, '01-landing-page');

    await page.goto('/login?mode=register');
    await page.waitForLoadState('networkidle');
    await uatScreenshot(page, testInfo, '02-register-form');

    await registerUser(page, 'UAT Member', email, password);
    await uatScreenshot(page, testInfo, '03-dashboard-after-register');

    await expect(page).toHaveURL(/\/app\/dashboard/);
    const heading = page.getByRole('heading', { name: /good (morning|afternoon|evening)/i }).first();
    await expect(heading).toBeVisible({ timeout: 5000 });
    await uatScreenshot(page, testInfo, '04-greeting-visible');
  });

  test('UAT-02: Registered user logs in and accesses the functionality required for their role', async ({ page }, testInfo) => {
    const email = generateUniqueEmail();
    const password = 'SecurePass1!';

    await registerUser(page, 'UAT Member', email, password);
    await logoutAndClear(page);

    await loginUser(page, email, password);
    await uatScreenshot(page, testInfo, '01-logged-in-dashboard');
    await expect(page).toHaveURL(/\/app\/dashboard/);

    const areas = ['Dashboard', 'Inventory', 'Donations', 'Analytics', 'Planner', 'Notifications', 'Settings'];
    for (const area of areas) {
      await expect(page.getByRole('link', { name: new RegExp(area, 'i') }).first()).toBeVisible({ timeout: 5000 });
    }
    await uatScreenshot(page, testInfo, '02-sidebar-areas-visible');
  });

  test('UAT-03: Registration with an already-registered email is rejected', async ({ page }, testInfo) => {
    const email = generateUniqueEmail();
    await registerUser(page, 'UAT User A', email, 'SecurePass1!');
    await logoutAndClear(page);

    await page.goto('/login?mode=register');
    await page.waitForLoadState('networkidle');
    await page.fill('[name="name"]', 'UAT User B');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', 'SecurePass1!');
    await page.getByRole('button', { name: /create account/i }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByText(/already exists/i)).toBeVisible({ timeout: 5000 });
    await uatScreenshot(page, testInfo, '01-duplicate-email-error');
  });

  test('UAT-04: Invalid email format and empty required fields are rejected', async ({ page }, testInfo) => {
    await page.goto('/login?mode=register');
    await page.waitForLoadState('networkidle');

    await page.fill('[name="name"]', 'UAT Member');
    await page.fill('[name="email"]', 'notanemail');
    await page.fill('[name="password"]', 'SecurePass1!');
    await page.getByRole('button', { name: /create account/i }).click();
    await page.waitForTimeout(1500);
    await expect(page.getByText(/valid email/i)).toBeVisible({ timeout: 3000 });
    await uatScreenshot(page, testInfo, '01-invalid-email-error');

    await page.goto('/login?mode=register');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /create account/i }).click();
    await page.waitForTimeout(1500);
    const errors = page.locator('p.text-red-500');
    expect(await errors.count()).toBeGreaterThanOrEqual(1);
    await uatScreenshot(page, testInfo, '02-empty-fields-errors');
  });

  test('UAT-05: Privacy and notification preferences persist after re-login', async ({ page }, testInfo) => {
    const email = generateUniqueEmail();
    await registerUser(page, 'Pref UAT', email, 'SecurePass1!');

    await navigateBySidebar(page, 'Settings', '/app/settings');
    await uatScreenshot(page, testInfo, '01-settings-page');

    const settingLabels = [
      'Public profile',
      'Show donations publicly',
      'Allow community messages',
      'Show online status',
      'Inventory reminders',
      'Donation updates',
      'Community activity',
      'Meal reminders',
      'Weekly reports',
      'Email notifications',
      'Push notifications',
    ];

    const before = new Map<string, boolean>();
    for (const label of settingLabels) {
      const wasOn = await toggleSetting(page, label);
      before.set(label, wasOn);
      await expect(page.getByText(/settings saved/i).first()).toBeVisible({ timeout: 3000 });
      await page.waitForTimeout(300);
    }
    await uatScreenshot(page, testInfo, '02-all-settings-toggled');

    await logoutAndClear(page);
    await loginUser(page, email, 'SecurePass1!');
    await navigateBySidebar(page, 'Settings', '/app/settings');

    for (const label of settingLabels) {
      const expectedOn = !before.get(label);
      const row = page.locator('.flex.items-center.gap-3.rounded-2xl')
        .filter({ has: page.locator('p.text-sm.font-semibold', { hasText: label }) });
      const toggle = row.locator('button.h-7.w-12');
      await expect(toggle).toBeVisible({ timeout: 3000 });
      const isOn = await toggle.evaluate((el: Element) => el.classList.contains('bg-gradient-primary'));
      expect(isOn, `expected "${label}" to persist as ${expectedOn}`).toBe(expectedOn);
    }
    await uatScreenshot(page, testInfo, '03-settings-persisted');
  });

  test('UAT-06: User changes password and logs in with the new password', async ({ page }, testInfo) => {
    const email = generateUniqueEmail();
    const password = 'SecurePass1!';

    await registerUser(page, 'PW UAT', email, password);
    await navigateBySidebar(page, 'Settings', '/app/settings');

    const updateBtn = page.getByRole('button', { name: /update/i }).first();
    await updateBtn.click();
    await page.waitForTimeout(500);

    const inputs = page.locator('.fixed.inset-0.z-50 input[type="password"]');
    await inputs.nth(0).fill(password);
    await inputs.nth(1).fill('NewSecure1!');
    await inputs.nth(2).fill('NewSecure1!');

    await page.getByRole('button', { name: /update/i }).last().click();
    await page.waitForTimeout(1500);
    await uatScreenshot(page, testInfo, '01-password-updated');

    await logoutAndClear(page);
    await loginUser(page, email, 'NewSecure1!');
    await expect(page).toHaveURL(/\/app\/dashboard/);
    await uatScreenshot(page, testInfo, '02-logged-in-with-new-password');
  });

  test('UAT-07: Unauthenticated access to protected areas is redirected to login', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await logoutAndClear(page);

    await page.goto('/app/dashboard');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/login/);
    await uatScreenshot(page, testInfo, '01-dashboard-redirected');

    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/login\?mode=register/);
    await uatScreenshot(page, testInfo, '02-register-redirected');
  });
});
