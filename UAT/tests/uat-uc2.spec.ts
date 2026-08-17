import { test, expect } from '@playwright/test';
import { generateUniqueEmail, registerUser, getFutureDate, navigateBySidebar, uatScreenshot } from './uat-utils';

async function addInventoryItem(page: any, name: string, quantity: string, category: string, location: string, expiry: string, unit = 'pcs') {
  const addBtn = page.getByRole('button', { name: /add item/i });
  await addBtn.first().click();
  await page.waitForSelector('#inventory-form', { timeout: 10000 });
  await page.waitForTimeout(500);
  await page.fill('[name="foodName"]', name);
  await page.fill('[name="quantity"]', quantity);
  await page.fill('[name="unit"]', unit);
  await page.selectOption('[name="category"]', category);
  await page.selectOption('[name="storageLocation"]', location);
  await page.fill('[name="expirationDate"]', expiry);
  await page.getByRole('button', { name: /save item/i }).click();
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle');
}

test.describe('UAT — Use Case 2: Manage Food Inventory', () => {
  test('UAT-08: User adds, edits, and deletes pantry items', async ({ page }, testInfo) => {
    const email = generateUniqueEmail();
    const futureExpiry = getFutureDate(7);

    await registerUser(page, 'UAT Pantry', email, 'SecurePass1!');
    await navigateBySidebar(page, 'Inventory', '/app/inventory');
    await uatScreenshot(page, testInfo, '01-inventory-view');

    await addInventoryItem(page, 'Test Apple', '3', 'Produce', 'Fridge', futureExpiry);
    await uatScreenshot(page, testInfo, '02-item-added');
    await expect(page.getByText('Test Apple').first()).toBeVisible({ timeout: 5000 });

    const itemRow = page.locator('[class*="card"]').filter({ hasText: 'Test Apple' }).first();
    await itemRow.waitFor({ state: 'visible', timeout: 5000 });

    const editBtn = itemRow.locator('button').filter({ has: page.locator('svg.lucide-edit2') }).first();
    if (await editBtn.count() > 0) {
      await editBtn.click();
    } else {
      await itemRow.locator('button').first().click();
    }

    await page.waitForSelector('#inventory-form', { timeout: 10000 });
    await page.waitForTimeout(500);
    await page.fill('[name="foodName"]', 'Test Apple (Updated)');
    await page.fill('[name="quantity"]', '5');
    await page.getByRole('button', { name: /save changes/i }).click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    await uatScreenshot(page, testInfo, '03-item-edited');
    await expect(page.getByText('Test Apple (Updated)').first()).toBeVisible({ timeout: 5000 });

    const updatedCard = page.locator('[class*="card"]').filter({ hasText: 'Test Apple (Updated)' }).first();
    const deleteBtn = updatedCard.locator('button').filter({ has: page.locator('svg.lucide-trash2') }).first();
    await deleteBtn.click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    await uatScreenshot(page, testInfo, '04-item-deleted');
    await expect(page.getByText('Test Apple (Updated)').first()).not.toBeVisible({ timeout: 10000 });
  });

  test('UAT-09: User finds items quickly using search, filters, and sort', async ({ page }, testInfo) => {
    const futureExpiry = getFutureDate(7);
    await registerUser(page, 'UAT Search', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Inventory', '/app/inventory');

    await addInventoryItem(page, 'Apple', '2', 'Produce', 'Fridge', getFutureDate(14));
    await addInventoryItem(page, 'Apple Juice', '1', 'Produce', 'Fridge', futureExpiry);
    await addInventoryItem(page, 'Milk', '1', 'Dairy', 'Fridge', getFutureDate(5));

    const searchInput = page.getByPlaceholder(/search inventory/i);
    await searchInput.fill('Apple');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await expect(page.getByText('Apple').first()).toBeVisible({ timeout: 5000 });
    const milkCount = page.locator('[class*="glass-card"], [class*="grid grid-cols-12"]').filter({ hasText: 'Milk' });
    expect(await milkCount.count()).toBe(0);
    await uatScreenshot(page, testInfo, '01-search-apple-results');

    await searchInput.fill('');
    await page.waitForTimeout(500);
    const dairyPill = page.getByRole('button', { name: /^dairy$/i });
    await dairyPill.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await expect(page.getByText('Milk').first()).toBeVisible({ timeout: 5000 });
    const appleAfterDairy = page.locator('[class*="glass-card"], [class*="grid grid-cols-12"]').filter({ hasText: 'Apple' });
    expect(await appleAfterDairy.count()).toBe(0);
    await uatScreenshot(page, testInfo, '02-filtered-dairy-only');

    const expiringPill = page.getByRole('button', { name: /^expiring soon$/i });
    await expiringPill.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await uatScreenshot(page, testInfo, '03-status-filter');

    const sortSelect = page.locator('select').filter({ has: page.locator('option[value="foodName"]') });
    if (await sortSelect.count() > 0) {
      await sortSelect.selectOption('foodName');
    } else {
      const select = page.locator('.flex.items-center.gap-1\\.5 select');
      await select.selectOption('foodName');
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await uatScreenshot(page, testInfo, '04-sorted-a-z');
  });

  test('UAT-10: Saving an item with missing required fields is rejected', async ({ page }, testInfo) => {
    await registerUser(page, 'UAT Inv', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Inventory', '/app/inventory');

    const addBtn = page.getByRole('button', { name: /add item/i });
    await addBtn.first().click();
    await page.waitForSelector('#inventory-form', { timeout: 10000 });

    await page.getByRole('button', { name: /save item/i }).click();
    await page.waitForTimeout(1000);

    await expect(page.getByText(/food name, quantity, and expiration date/i)).toBeVisible({ timeout: 5000 });
    await uatScreenshot(page, testInfo, '01-missing-fields-toast');
  });

  test('UAT-11: User tracks used and expiring-soon items', async ({ page }, testInfo) => {
    await registerUser(page, 'UAT Track', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Inventory', '/app/inventory');

    await addInventoryItem(page, 'Used Item', '3', 'Produce', 'Fridge', getFutureDate(7));
    await addInventoryItem(page, 'Expiring Banana', '2', 'Produce', 'Fridge', getFutureDate(1));

    const card = page.locator('[class*="card"]').filter({ hasText: 'Used Item' }).first();
    await card.waitFor({ state: 'visible', timeout: 5000 });
    const deleteBtn = card.locator('button').filter({ has: page.locator('svg.lucide-trash2') }).first();
    await deleteBtn.click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/removed/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Used Item').first()).not.toBeVisible({ timeout: 10000 });
    await uatScreenshot(page, testInfo, '01-item-marked-used');

    const expiringPill = page.getByRole('button', { name: /^expiring soon$/i });
    await expiringPill.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await expect(page.getByText('Expiring Banana').first()).toBeVisible({ timeout: 5000 });
    await uatScreenshot(page, testInfo, '02-expiring-soon-shown');
  });
});
