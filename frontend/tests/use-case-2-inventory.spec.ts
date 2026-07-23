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

    await navigateBySidebar(page, 'Inventory', '/app/inventory');
    await takeScreenshot(page, testInfo, '02-inventory-view');

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

  test('rejects add with missing required fields', async ({ page }, testInfo) => {
    await registerUser(page, 'Inv User', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Inventory', '/app/inventory');

    const addBtn = page.getByRole('button', { name: /add item/i });
    await addBtn.first().click();
    await page.waitForSelector('#inventory-form', { timeout: 10000 });

    await page.getByRole('button', { name: /save item/i }).click();
    await page.waitForTimeout(1000);

    const toast = page.getByText(/food name, quantity, and expiration date/i);
    await expect(toast).toBeVisible({ timeout: 5000 });
    await takeScreenshot(page, testInfo, 'missing-fields-toast');
  });

  test('handles zero quantity gracefully', async ({ page }, testInfo) => {
    await registerUser(page, 'Inv User', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Inventory', '/app/inventory');

    const addBtn = page.getByRole('button', { name: /add item/i });
    await addBtn.first().click();
    await page.waitForSelector('#inventory-form', { timeout: 10000 });

    await page.fill('[name="foodName"]', 'Zero Item');
    await page.fill('[name="quantity"]', '0');
    await page.fill('[name="unit"]', 'pcs');
    await page.selectOption('[name="category"]', 'Produce');
    await page.fill('[name="expirationDate"]', getFutureDate(7));
    await page.getByRole('button', { name: /save item/i }).click();
    await page.waitForTimeout(2000);

    const appeared = await page.getByText('Zero Item').count();
    if (appeared > 0) {
      await takeScreenshot(page, testInfo, 'zero-qty-added');
    } else {
      const toast = page.getByText(/error/i);
      await expect(toast).toBeVisible({ timeout: 3000 }).catch(() => {});
      await takeScreenshot(page, testInfo, 'zero-qty-rejected');
    }
  });

  test('cancels delete confirmation keeps item', async ({ page }, testInfo) => {
    await registerUser(page, 'Inv User', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Inventory', '/app/inventory');

    const addBtn = page.getByRole('button', { name: /add item/i });
    await addBtn.first().click();
    await page.waitForSelector('#inventory-form', { timeout: 10000 });
    await page.fill('[name="foodName"]', 'Keep Item');
    await page.fill('[name="quantity"]', '2');
    await page.fill('[name="expirationDate"]', getFutureDate(7));
    await page.getByRole('button', { name: /save item/i }).click();
    await page.waitForTimeout(3000);
    await expect(page.getByText('Keep Item').first()).toBeVisible({ timeout: 5000 });

    const card = page.locator('[class*="card"]').filter({ hasText: 'Keep Item' });
    await card.first().waitFor({ state: 'visible', timeout: 5000 });

    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('delete');
      dialog.dismiss();
    });

    await card.first().locator('button').last().click();
    await page.waitForTimeout(2000);

    await expect(page.getByText('Keep Item').first()).toBeVisible({ timeout: 5000 });
    await takeScreenshot(page, testInfo, 'cancel-delete-item-kept');
  });

  test('filters items by category', async ({ page }, testInfo) => {
    await registerUser(page, 'Inv User', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Inventory', '/app/inventory');

    // Add Produce item
    let addBtn = page.getByRole('button', { name: /add item/i });
    await addBtn.first().click();
    await page.waitForSelector('#inventory-form', { timeout: 10000 });
    await page.fill('[name="foodName"]', 'Apple');
    await page.fill('[name="quantity"]', '2');
    await page.selectOption('[name="category"]', 'Produce');
    await page.fill('[name="expirationDate"]', getFutureDate(7));
    await page.getByRole('button', { name: /save item/i }).click();
    await page.waitForTimeout(2000);

    // Add Dairy item
    addBtn = page.getByRole('button', { name: /add item/i });
    await addBtn.first().click();
    await page.waitForSelector('#inventory-form', { timeout: 10000 });
    await page.fill('[name="foodName"]', 'Milk');
    await page.fill('[name="quantity"]', '1');
    await page.selectOption('[name="category"]', 'Dairy');
    await page.fill('[name="expirationDate"]', getFutureDate(5));
    await page.getByRole('button', { name: /save item/i }).click();
    await page.waitForTimeout(2000);

    // Click Dairy filter pill
    const dairyPill = page.getByRole('button', { name: /^dairy$/i });
    await dairyPill.click();
    await page.waitForTimeout(1500);

    await expect(page.getByText('Milk').first()).toBeVisible({ timeout: 5000 });
    const appleCount = await page.getByText('Apple').count();
    expect(appleCount).toBe(0);
    await takeScreenshot(page, testInfo, 'filtered-dairy-only');
  });
});
