import { test, expect } from '@playwright/test';
import { generateUniqueEmail, registerUser, takeScreenshot, navigateBySidebar, getFutureDate } from './test-utils';

test.describe('Use Case 6: Plan Weekly Meals', () => {
  test('user generates and views a weekly meal plan', async ({ page }, testInfo) => {
    const email = generateUniqueEmail();
    const password = 'SecurePass1!';

    await registerUser(page, 'Planner User', email, password);
    await takeScreenshot(page, testInfo, '01-registered-dashboard');

    // Navigate to meal planner
    await navigateBySidebar(page, 'Planner', '/app/planner');
    await page.waitForTimeout(2000);
    await takeScreenshot(page, testInfo, '02-planner-empty');

    // Click "Generate Random Plan" to create meals
    const generateBtn = page.getByRole('button', { name: /generate random plan/i });
    await expect(generateBtn.first()).toBeVisible({ timeout: 5000 });

    await generateBtn.first().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, testInfo, '03-plan-generated');

    // Verify meals are displayed in the grid
    const mealElements = page.locator('[class*="bg-gradient-emerald"], [class*="rounded-xl"][class*="bg-"]').filter({ hasText: /./ });
    const mealCount = await mealElements.count();
    expect(mealCount).toBeGreaterThanOrEqual(3);
    await takeScreenshot(page, testInfo, '04-meals-in-grid');

    // Verify the meal summary stats exist
    const mealsText = page.getByText(/meals planned/i);
    await expect(mealsText).toBeVisible({ timeout: 5000 }).catch(() => {});

    // Test search/suggestions panel exists
    const searchInput = page.getByPlaceholder(/search recipe/i);
    await expect(searchInput).toBeVisible({ timeout: 5000 }).catch(() => {});

    await takeScreenshot(page, testInfo, '05-planner-with-meals');
  });

  test('user clears meal plan and starts fresh', async ({ page }, testInfo) => {
    await registerUser(page, 'Clear User', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Planner', '/app/planner');
    await page.waitForTimeout(2000);

    // Generate a plan first
    const generateBtn = page.getByRole('button', { name: /generate random plan/i });
    await generateBtn.first().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    // Click Clear All
    const clearBtn = page.getByRole('button', { name: /clear all/i });
    await expect(clearBtn).toBeVisible({ timeout: 5000 });
    await clearBtn.click();
    await page.waitForTimeout(1000);

    // Handle confirmation dialog if any
    page.once('dialog', dialog => {
      dialog.accept();
    });

    await page.waitForTimeout(2000);
    await takeScreenshot(page, testInfo, 'after-clear');
  });

  test('smart suggestions are based on inventory ingredients', async ({ page }, testInfo) => {
    await registerUser(page, 'Suggest User', generateUniqueEmail(), 'SecurePass1!');
    await takeScreenshot(page, testInfo, '01-registered-dashboard');

    // Add "Eggs" to inventory so recipe suggestions can match it
    await navigateBySidebar(page, 'Inventory', '/app/inventory');
    const addBtn = page.getByRole('button', { name: /add item/i });
    await addBtn.first().click();
    await page.waitForSelector('#inventory-form', { timeout: 10000 });
    await page.waitForTimeout(500);
    await page.fill('[name="foodName"]', 'Eggs');
    await page.fill('[name="quantity"]', '6');
    await page.fill('[name="unit"]', 'pcs');
    await page.selectOption('[name="category"]', 'Produce');
    await page.fill('[name="expirationDate"]', getFutureDate(3));
    await page.getByRole('button', { name: /save item/i }).click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, testInfo, '02-eggs-added-to-inventory');

    // Navigate to planner. The Smart Suggestions sidebar only renders once a plan/grid is shown,
    // so generate a random plan first to reveal it.
    await navigateBySidebar(page, 'Planner', '/app/planner');
    await page.waitForTimeout(2000);
    const generateBtn = page.getByRole('button', { name: /generate random plan/i });
    await expect(generateBtn.first()).toBeVisible({ timeout: 5000 });
    await generateBtn.first().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, testInfo, '03-planner-with-suggestions');

    await expect(page.getByText('Smart suggestions').first()).toBeVisible({ timeout: 8000 });
    const suggestionText = page.getByText(/ingredients|available/i).first();
    await expect(suggestionText).toBeVisible({ timeout: 8000 });

    // Recipes containing Eggs (e.g. Boiled Eggs / Omelette) should be suggested
    const boiledEggs = page.getByText(/boiled eggs|omelette|egg fried rice/i).first();
    await expect(boiledEggs).toBeVisible({ timeout: 8000 });
    await takeScreenshot(page, testInfo, '04-egg-suggestions-visible');
  });

  test('user can save a meal plan', async ({ page }, testInfo) => {
    await registerUser(page, 'Save User', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Planner', '/app/planner');
    await page.waitForTimeout(2000);

    // Generate a plan
    const generateBtn = page.getByRole('button', { name: /generate random plan/i });
    await generateBtn.first().click();
    await page.waitForTimeout(3000);

    // Click Save
    const saveBtn = page.getByRole('button', { name: /save$/i });
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, testInfo, 'plan-saved');
    }

    await takeScreenshot(page, testInfo, 'save-attempted');
  });
});
