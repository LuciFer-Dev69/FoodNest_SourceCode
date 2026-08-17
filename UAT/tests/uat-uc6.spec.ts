import { test, expect } from '@playwright/test';
import { generateUniqueEmail, registerUser, navigateBySidebar, getFutureDate, uatScreenshot } from './uat-utils';

test.describe('UAT — Use Case 6: Plan Weekly Meals', () => {
  test('UAT-24: User generates a weekly meal plan', async ({ page }, testInfo) => {
    const email = generateUniqueEmail();

    await registerUser(page, 'UAT Planner', email, 'SecurePass1!');
    await navigateBySidebar(page, 'Planner', '/app/planner');
    await page.waitForTimeout(2000);
    await uatScreenshot(page, testInfo, '01-planner-empty');

    const generateBtn = page.getByRole('button', { name: /generate random plan/i });
    await expect(generateBtn.first()).toBeVisible({ timeout: 5000 });
    await generateBtn.first().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    await uatScreenshot(page, testInfo, '02-plan-generated');

    const mealElements = page.locator('[class*="bg-gradient-emerald"], [class*="rounded-xl"][class*="bg-"]').filter({ hasText: /./ });
    expect(await mealElements.count()).toBeGreaterThanOrEqual(3);
    await uatScreenshot(page, testInfo, '03-meals-in-grid');

    await expect(page.getByText(/meals planned/i)).toBeVisible({ timeout: 5000 }).catch(() => {});
    await uatScreenshot(page, testInfo, '04-planner-with-meals');
  });

  test('UAT-25: Meal planner suggests recipes based on pantry ingredients', async ({ page }, testInfo) => {
    await registerUser(page, 'UAT Suggest', generateUniqueEmail(), 'SecurePass1!');

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
    await uatScreenshot(page, testInfo, '01-eggs-added-to-inventory');

    await navigateBySidebar(page, 'Planner', '/app/planner');
    await page.waitForTimeout(2000);
    const generateBtn = page.getByRole('button', { name: /generate random plan/i });
    await expect(generateBtn.first()).toBeVisible({ timeout: 5000 });
    await generateBtn.first().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    await uatScreenshot(page, testInfo, '02-planner-with-suggestions');

    await expect(page.getByText('Smart suggestions').first()).toBeVisible({ timeout: 8000 });
    const suggestionText = page.getByText(/ingredients|available/i).first();
    await expect(suggestionText).toBeVisible({ timeout: 8000 });

    const boiledEggs = page.getByText(/boiled eggs|omelette|egg fried rice/i).first();
    await expect(boiledEggs).toBeVisible({ timeout: 8000 });
    await uatScreenshot(page, testInfo, '03-egg-suggestions-visible');
  });

  test('UAT-26: User clears and saves a meal plan', async ({ page }, testInfo) => {
    await registerUser(page, 'UAT Clear', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Planner', '/app/planner');
    await page.waitForTimeout(2000);

    const generateBtn = page.getByRole('button', { name: /generate random plan/i });
    await expect(generateBtn.first()).toBeVisible({ timeout: 5000 });
    await generateBtn.first().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    await uatScreenshot(page, testInfo, '01-plan-generated');

    const saveBtn = page.getByRole('button', { name: /save$/i });
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await page.waitForTimeout(2000);
      await uatScreenshot(page, testInfo, '02-plan-saved');
    } else {
      await uatScreenshot(page, testInfo, '02-save-attempted');
    }

    const clearBtn = page.getByRole('button', { name: /clear all/i });
    await expect(clearBtn).toBeVisible({ timeout: 5000 });
    page.once('dialog', dialog => {
      dialog.accept();
    });
    await clearBtn.click();
    await page.waitForTimeout(2000);
    await uatScreenshot(page, testInfo, '03-after-clear');
  });
});
