import { test, expect } from '@playwright/test';
import { generateUniqueEmail, registerUser, takeScreenshot, navigateBySidebar, getFutureDate } from './test-utils';

test.describe('Use Case 4: Food Analytics', () => {
  test('user views analytics dashboard with stats and charts', async ({ page }, testInfo) => {
    const email = generateUniqueEmail();
    const password = 'SecurePass1!';
    const futureExpiry = getFutureDate(7);

    await registerUser(page, 'Analytics User', email, password);
    await takeScreenshot(page, testInfo, '01-registered-dashboard');

    // Add an inventory item so analytics has data
    await navigateBySidebar(page, 'Inventory', '/app/inventory');
    const addBtn = page.getByRole('button', { name: /add item/i });
    await addBtn.first().click();
    await page.waitForSelector('#inventory-form', { timeout: 10000 });
    await page.waitForTimeout(500);
    await page.fill('[name="foodName"]', 'Analytics Apple');
    await page.fill('[name="quantity"]', '5');
    await page.selectOption('[name="category"]', 'Produce');
    await page.fill('[name="expirationDate"]', futureExpiry);
    await page.getByRole('button', { name: /save item/i }).click();
    await page.waitForTimeout(3000);
    await takeScreenshot(page, testInfo, '02-inventory-added');

    // Navigate to analytics
    await navigateBySidebar(page, 'Analytics', '/app/analytics');
    await page.waitForTimeout(2000);
    await takeScreenshot(page, testInfo, '03-analytics-page');

    // Verify the analytics page loaded (page heading and stat card values exist)
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Inventory Items').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Active Donations').first()).toBeVisible({ timeout: 5000 });
    const statCardTexts = ['Inventory Items', 'Active Donations', 'Meals Planned', 'Community Posts'];
    for (const text of statCardTexts) {
      await expect(page.getByText(text).first()).toBeAttached({ timeout: 3000 });
    }
    await takeScreenshot(page, testInfo, '04-stat-cards');

    // Verify chart sections are rendered
    await expect(page.getByText('Weekly Activity').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Inventory Categories').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Monthly Donations').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Food Status').first()).toBeVisible({ timeout: 5000 });
    await takeScreenshot(page, testInfo, '05-charts-visible');

    // Test period filter switching
    for (const period of ['7d', '30d', '90d']) {
      const periodBtn = page.getByRole('button', { name: period });
      if (await periodBtn.count() > 0) {
        await periodBtn.click();
        await page.waitForTimeout(1500);
      }
    }
    await takeScreenshot(page, testInfo, '06-period-filters');
  });

  test('shows sustainability stats and progress indicators', async ({ page }, testInfo) => {
    const email = generateUniqueEmail();
    await registerUser(page, 'Sustain User', email, 'SecurePass1!');
    await navigateBySidebar(page, 'Analytics', '/app/analytics');
    await page.waitForTimeout(2000);

    // Look for sustainability or progress indicators
    const pageText = page.locator('body');
    const content = await pageText.textContent();

    const hasProgressIndicator = content.includes('Waste') || content.includes('Score') || content.includes('Sustainability');
    expect(hasProgressIndicator).toBeTruthy();

    await takeScreenshot(page, testInfo, 'sustainability-section');
  });
});
