import { test, expect } from '@playwright/test';
import { generateUniqueEmail, registerUser, takeScreenshot, getFutureDate, navigateBySidebar } from './test-utils';

test.describe('Use Case 2: Manage Food Inventory', () => {
  test('user adds, edits, and deletes inventory items', async ({ page }, testInfo) => {
    const email = generateUniqueEmail();
    const password = 'SecurePass1!';
    const name = 'Inventory User';
    const futureExpiry = getFutureDate(7);

    await registerUser(page, name, email, password);
    await takeScreenshot(page, testInfo, '01-registered-dashboard');

    // Use sidebar navigation (client-side) for protected routes
    await navigateBySidebar(page, 'Inventory', '/app/inventory');
    await takeScreenshot(page, testInfo, '02-inventory-view');

    // Click "Add item" or "Add Inventory" button
    const addButton = page.getByRole('button', { name: /add item/i }).or(page.getByRole('link', { name: /add inventory/i }));
    await addButton.first().click();
    await page.waitForSelector('#inventory-form', { timeout: 10000 });
    await page.waitForTimeout(500);
    await takeScreenshot(page, testInfo, '03-add-item-form');

    await page.fill('[name="foodName"]', 'Test Apple');
    await page.fill('[name="quantity"]', '3');
    await page.fill('[name="unit"]', 'pcs');
    await page.selectOption('[name="category"]', 'Produce');
    await page.selectOption('[name="storageLocation"]', 'Fridge');
    await page.fill('[name="expirationDate"]', futureExpiry);

    await page.getByRole('button', { name: /save item|save changes/i }).click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, testInfo, '04-item-added');

    await expect(page.getByText('Test Apple').first()).toBeVisible({ timeout: 5000 });

    // Edit the item
    const itemCard = page.locator('[class*="card"]').filter({ hasText: 'Test Apple' }).first();
    await itemCard.waitFor({ state: 'visible', timeout: 5000 });

    const cardButtons = itemCard.locator('button');
    await cardButtons.first().click();

    await page.waitForSelector('#inventory-form', { timeout: 10000 });
    await page.waitForTimeout(500);

    await page.fill('[name="foodName"]', '');
    await page.fill('[name="foodName"]', 'Test Apple (Updated)');
    await page.fill('[name="quantity"]', '');
    await page.fill('[name="quantity"]', '5');

    await page.getByRole('button', { name: /save changes/i }).click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, testInfo, '05-item-edited');

    await expect(page.getByText('Test Apple (Updated)').first()).toBeVisible({ timeout: 5000 });

    // Delete the item
    const updatedCard = page.locator('[class*="card"]').filter({ hasText: 'Test Apple (Updated)' }).first();
    await updatedCard.waitFor({ state: 'visible', timeout: 5000 });

    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('delete');
      dialog.accept();
    });

    await updatedCard.locator('button').last().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, testInfo, '06-item-deleted');

    await expect(page.getByText('Test Apple (Updated)').first()).not.toBeVisible({ timeout: 10000 });
  });
});
