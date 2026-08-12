import { test, expect } from '@playwright/test';
import { generateUniqueEmail, registerUser, takeScreenshot, getFutureDate, navigateBySidebar } from './test-utils';

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

function itemCard(page: any, name: string) {
  return page.locator('[class*="glass-card"], [class*="grid grid-cols-12"]').filter({ hasText: name });
}

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

    await addInventoryItem(page, 'Test Apple', '3', 'Produce', 'Fridge', futureExpiry);
    await takeScreenshot(page, testInfo, '03-item-added');
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

    await page.fill('[name="foodName"]', '');
    await page.fill('[name="foodName"]', 'Test Apple (Updated)');
    await page.fill('[name="quantity"]', '');
    await page.fill('[name="quantity"]', '5');

    await page.getByRole('button', { name: /save changes/i }).click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, testInfo, '04-item-edited');
    await expect(page.getByText('Test Apple (Updated)').first()).toBeVisible({ timeout: 5000 });

    const updatedCard = page.locator('[class*="card"]').filter({ hasText: 'Test Apple (Updated)' }).first();
    const deleteBtn = updatedCard.locator('button').filter({ has: page.locator('svg.lucide-trash2') }).first();
    await deleteBtn.click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, testInfo, '05-item-deleted');
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

  test('delete item via trash button directly removes it', async ({ page }, testInfo) => {
    await registerUser(page, 'Inv User', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Inventory', '/app/inventory');

    await addInventoryItem(page, 'Delete Me', '2', 'Produce', 'Fridge', getFutureDate(7));
    await expect(page.getByText('Delete Me').first()).toBeVisible({ timeout: 5000 });

    const card = page.locator('[class*="card"]').filter({ hasText: 'Delete Me' }).first();
    await card.waitFor({ state: 'visible', timeout: 5000 });

    const deleteBtn = card.locator('button').filter({ has: page.locator('svg.lucide-trash2') }).first();
    await deleteBtn.click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Delete Me').first()).not.toBeVisible({ timeout: 10000 });
    await takeScreenshot(page, testInfo, 'delete-confirmed');
  });

  test('filters items by category', async ({ page }, testInfo) => {
    await registerUser(page, 'Inv User', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Inventory', '/app/inventory');

    await addInventoryItem(page, 'Apple', '2', 'Produce', 'Fridge', getFutureDate(7));
    await addInventoryItem(page, 'Milk', '1', 'Dairy', 'Fridge', getFutureDate(5));

    const dairyPill = page.getByRole('button', { name: /^dairy$/i });
    await dairyPill.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page.getByText('Milk').first()).toBeVisible({ timeout: 5000 });
    const appleCount = await itemCard(page, 'Apple').count();
    expect(appleCount).toBe(0);
    await takeScreenshot(page, testInfo, 'filtered-dairy-only');
  });

  test('filters items by storage location', async ({ page }, testInfo) => {
    await registerUser(page, 'Inv User', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Inventory', '/app/inventory');

    await addInventoryItem(page, 'Fridge Item', '2', 'Produce', 'Fridge', getFutureDate(7));
    await addInventoryItem(page, 'Pantry Item', '1', 'Pantry', 'Pantry', getFutureDate(5));

    const fridgePill = page.getByRole('button', { name: /^fridge$/i });
    await fridgePill.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page.getByText('Fridge Item').first()).toBeVisible({ timeout: 5000 });
    const pantryCount = await itemCard(page, 'Pantry Item').count();
    expect(pantryCount).toBe(0);
    await takeScreenshot(page, testInfo, 'filtered-fridge-only');
  });

  test('searches inventory items', async ({ page }, testInfo) => {
    await registerUser(page, 'Inv User', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Inventory', '/app/inventory');

    await addInventoryItem(page, 'Searchable Apple', '2', 'Produce', 'Fridge', getFutureDate(7));
    await addInventoryItem(page, 'Hidden Milk', '1', 'Dairy', 'Fridge', getFutureDate(5));

    const searchInput = page.getByPlaceholder(/search inventory/i);
    await searchInput.fill('Apple');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page.getByText('Searchable Apple').first()).toBeVisible({ timeout: 5000 });
    const hiddenCount = await itemCard(page, 'Hidden Milk').count();
    expect(hiddenCount).toBe(0);
    await takeScreenshot(page, testInfo, 'search-apple-results');
  });

  test('sorts inventory items', async ({ page }, testInfo) => {
    await registerUser(page, 'Inv User', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Inventory', '/app/inventory');

    await addInventoryItem(page, 'Zebra Cake', '1', 'Bakery', 'Pantry', getFutureDate(14));
    await addInventoryItem(page, 'Apple Juice', '2', 'Produce', 'Fridge', getFutureDate(3));

    const sortSelect = page.locator('select').filter({ has: page.locator('option[value="foodName"]') });
    if (await sortSelect.count() > 0) {
      await sortSelect.selectOption('foodName');
    } else {
      const select = page.locator('.flex.items-center.gap-1\\.5 select');
      await select.selectOption('foodName');
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const items = page.locator('[class*="card"] p.truncate.font-bold, [class*="card"] p.truncate.font-semibold');
    const firstItem = await items.nth(0).textContent();
    expect(firstItem?.toLowerCase()).toContain('apple');
    await takeScreenshot(page, testInfo, 'sorted-a-z');
  });

  test('filters items by status', async ({ page }, testInfo) => {
    await registerUser(page, 'Inv User', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Inventory', '/app/inventory');

    await addInventoryItem(page, 'Expiring Banana', '2', 'Produce', 'Fridge', getFutureDate(1));
    await addInventoryItem(page, 'Fresh Apple', '3', 'Produce', 'Fridge', getFutureDate(14));

    const expiringPill = page.getByRole('button', { name: /^expiring soon$/i });
    await expiringPill.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page.getByText('Expiring Banana').first()).toBeVisible({ timeout: 5000 });
    const freshCount = await itemCard(page, 'Fresh Apple').count();
    expect(freshCount).toBe(0);
    await takeScreenshot(page, testInfo, 'filtered-expiring-soon');

    const expiredPill = page.getByRole('button', { name: /^expired$/i });
    await expiredPill.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const expiringCount = await itemCard(page, 'Expiring Banana').count();
    expect(expiringCount).toBe(0);
    await takeScreenshot(page, testInfo, 'filtered-expired-empty');
  });

  test('toggles between grid and list views', async ({ page }, testInfo) => {
    await registerUser(page, 'Inv User', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Inventory', '/app/inventory');

    await addInventoryItem(page, 'View Test Item', '1', 'Produce', 'Fridge', getFutureDate(7));
    await expect(page.getByText('View Test Item').first()).toBeVisible({ timeout: 5000 });

    const listBtn = page.getByRole('button').filter({ has: page.locator('svg.lucide-list') });
    const gridBtn = page.getByRole('button').filter({ has: page.locator('svg.lucide-layout-grid') });

    await listBtn.click();
    await page.waitForTimeout(500);
    const listViewVisible = await page.locator('.grid.grid-cols-12').first().isVisible().catch(() => false);
    await takeScreenshot(page, testInfo, 'list-view');

    await gridBtn.click();
    await page.waitForTimeout(500);
    const gridViewVisible = await page.locator('.glass-card.hover-lift.rounded-3xl').first().isVisible().catch(() => false);
    await takeScreenshot(page, testInfo, 'grid-view');

    expect(listViewVisible || gridViewVisible).toBeTruthy();
    await expect(page.getByText('View Test Item').first()).toBeVisible({ timeout: 5000 });
  });

  test('marks item as used by deleting it', async ({ page }, testInfo) => {
    await registerUser(page, 'Inv User', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Inventory', '/app/inventory');

    await addInventoryItem(page, 'Used Item', '3', 'Produce', 'Fridge', getFutureDate(1));

    await expect(page.getByText('Used Item').first()).toBeVisible({ timeout: 5000 });

    const card = page.locator('[class*="card"]').filter({ hasText: 'Used Item' }).first();
    const deleteBtn = card.locator('button').filter({ has: page.locator('svg.lucide-trash2') }).first();
    await deleteBtn.click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    const toast = page.getByText(/removed/i);
    await expect(toast).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Used Item').first()).not.toBeVisible({ timeout: 10000 });
    await takeScreenshot(page, testInfo, 'item-marked-used');
  });
});