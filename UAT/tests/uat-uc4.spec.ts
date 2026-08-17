import { test, expect } from '@playwright/test';
import { generateUniqueEmail, registerUser, navigateBySidebar, getFutureDate, uatScreenshot } from './uat-utils';

test.describe('UAT — Use Case 4: Food Analytics', () => {
  test('UAT-19: User views the analytics dashboard with stats, charts, and period filters', async ({ page }, testInfo) => {
    const email = generateUniqueEmail();
    const futureExpiry = getFutureDate(7);

    await registerUser(page, 'UAT Analytics', email, 'SecurePass1!');

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
    await page.waitForLoadState('networkidle');

    await navigateBySidebar(page, 'Analytics', '/app/analytics');
    await page.waitForTimeout(2000);
    await uatScreenshot(page, testInfo, '01-analytics-page');

    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible({ timeout: 5000 });
    const statCardTexts = ['Inventory Items', 'Active Donations', 'Meals Planned', 'Community Posts'];
    for (const text of statCardTexts) {
      await expect(page.getByText(text).first()).toBeAttached({ timeout: 3000 });
    }
    await uatScreenshot(page, testInfo, '02-stat-cards');

    await expect(page.getByText('Weekly Activity').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Inventory Categories').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Monthly Donations').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Food Status').first()).toBeVisible({ timeout: 5000 });
    await uatScreenshot(page, testInfo, '03-charts-visible');

    for (const period of ['7d', '30d', '90d']) {
      const periodBtn = page.getByRole('button', { name: period });
      if (await periodBtn.count() > 0) {
        await periodBtn.click();
        await page.waitForTimeout(1500);
      }
    }
    await uatScreenshot(page, testInfo, '04-period-filters');
  });

  test('UAT-20: User sees food-saved, waste, performance score, and sustainability insights', async ({ page }, testInfo) => {
    const email = generateUniqueEmail();
    const futureExpiry = getFutureDate(7);

    await registerUser(page, 'UAT Insights', email, 'SecurePass1!');

    await navigateBySidebar(page, 'Inventory', '/app/inventory');
    const addBtn = page.getByRole('button', { name: /add item/i });
    await addBtn.first().click();
    await page.waitForSelector('#inventory-form', { timeout: 10000 });
    await page.fill('[name="foodName"]', 'Progress Banana');
    await page.fill('[name="quantity"]', '2');
    await page.selectOption('[name="category"]', 'Produce');
    await page.fill('[name="expirationDate"]', futureExpiry);
    await page.getByRole('button', { name: /save item/i }).click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    await navigateBySidebar(page, 'Donations', '/app/donations');
    const listBtn = page.getByRole('button', { name: /list a donation/i });
    await listBtn.first().click();
    await page.waitForTimeout(1000);
    await page.fill('[name="foodName"]', 'Progress Donation');
    await page.fill('[name="quantity"]', '5');
    await page.selectOption('[name="category"]', 'Produce');
    await page.fill('[name="expirationDate"]', futureExpiry);
    await page.getByRole('button', { name: /publish donation/i }).click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    await navigateBySidebar(page, 'Analytics', '/app/analytics');
    await page.waitForTimeout(2000);
    await uatScreenshot(page, testInfo, '01-analytics-loaded');

    await expect(page.getByText('Waste %').first()).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('Donation Success').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('CO₂ Saved').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Items Saved').first()).toBeVisible({ timeout: 5000 });
    await uatScreenshot(page, testInfo, '02-sustainability-metrics');

    await expect(page.getByText('FoodNest Score').first()).toBeVisible({ timeout: 5000 });
    const circle = page.locator('svg circle[stroke-linecap="round"]');
    await expect(circle.first()).toBeVisible({ timeout: 5000 });
    await uatScreenshot(page, testInfo, '03-performance-score');

    const pageText = await page.locator('body').textContent();
    const hasInsight = (pageText || '').includes('Recommendation') || (pageText || '').includes('insight');
    expect(hasInsight).toBeTruthy();
    await uatScreenshot(page, testInfo, '04-insights');
  });
});
