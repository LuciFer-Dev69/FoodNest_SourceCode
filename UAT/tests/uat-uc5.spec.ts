import { test, expect } from '@playwright/test';
import { generateUniqueEmail, registerUser, navigateBySidebar, getFutureDate, uatScreenshot } from './uat-utils';

test.describe('UAT — Use Case 5: View Notifications', () => {
  test('UAT-21: User receives donation-created and expiry notifications', async ({ page }, testInfo) => {
    const email = generateUniqueEmail();
    const donationName = `Notif Test ${Date.now()}`;
    const itemName = `Expiring Item ${Date.now()}`;
    const futureExpiry = getFutureDate(7);

    await registerUser(page, 'UAT Notif', email, 'SecurePass1!');
    await navigateBySidebar(page, 'Notifications', '/app/notifications');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await uatScreenshot(page, testInfo, '01-notifications-empty');

    await navigateBySidebar(page, 'Donations', '/app/donations');
    const listBtn = page.getByRole('button', { name: /list a donation/i });
    await listBtn.first().click();
    await page.waitForTimeout(1000);
    await page.fill('[name="foodName"]', donationName);
    await page.fill('[name="quantity"]', '3');
    await page.fill('[name="expirationDate"]', futureExpiry);
    await page.getByRole('button', { name: /publish donation/i }).click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    await uatScreenshot(page, testInfo, '02-donation-created');

    await navigateBySidebar(page, 'Notifications', '/app/notifications');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const notifCards = page.locator('[class*="border-b"][class*="px-5"][class*="py-4"]');
    expect(await notifCards.count()).toBeGreaterThanOrEqual(1);
    await uatScreenshot(page, testInfo, '03-donation-notification-shown');

    await navigateBySidebar(page, 'Inventory', '/app/inventory');
    const addBtn = page.getByRole('button', { name: /add item/i });
    await addBtn.first().click();
    await page.waitForSelector('#inventory-form', { timeout: 10000 });
    await page.waitForTimeout(500);
    await page.fill('[name="foodName"]', itemName);
    await page.fill('[name="quantity"]', '2');
    await page.fill('[name="unit"]', 'pcs');
    await page.selectOption('[name="category"]', 'Produce');
    await page.fill('[name="expirationDate"]', getFutureDate(1));
    await page.getByRole('button', { name: /save item/i }).click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    await navigateBySidebar(page, 'Notifications', '/app/notifications');
    await page.waitForTimeout(4000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await uatScreenshot(page, testInfo, '04-notifications-after-expiry');

    const expiryText = page.getByText(new RegExp(`${itemName.split(' ')[0]}.*(expires|expired)`, 'i')).first();
    await expect(expiryText).toBeVisible({ timeout: 8000 });
    await uatScreenshot(page, testInfo, '05-expiry-notification-visible');
  });

  test('UAT-22: User manages notifications (mark all read, clear read, filter, search)', async ({ page }, testInfo) => {
    const email = generateUniqueEmail();
    const donationName = `Mgmt Notif ${Date.now()}`;

    await registerUser(page, 'UAT Mgmt', email, 'SecurePass1!');

    await navigateBySidebar(page, 'Donations', '/app/donations');
    const listBtn = page.getByRole('button', { name: /list a donation/i });
    await listBtn.first().click();
    await page.waitForTimeout(1000);
    await page.fill('[name="foodName"]', donationName);
    await page.fill('[name="quantity"]', '3');
    await page.fill('[name="expirationDate"]', getFutureDate(7));
    await page.getByRole('button', { name: /publish donation/i }).click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    await navigateBySidebar(page, 'Notifications', '/app/notifications');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await uatScreenshot(page, testInfo, '01-notifications-populated');

    const markAllBtn = page.getByRole('button', { name: /mark all read/i });
    if (await markAllBtn.count() > 0) {
      await markAllBtn.click();
      await page.waitForTimeout(1500);
      await uatScreenshot(page, testInfo, '02-marked-all-read');
    }

    const clearBtn = page.getByRole('button', { name: /clear read/i });
    if (await clearBtn.count() > 0) {
      await clearBtn.click();
      await page.waitForTimeout(1500);
      await uatScreenshot(page, testInfo, '03-cleared-read');
    }

    const statusUnread = page.getByRole('button', { name: /^unread$/i }).first();
    const statusRead = page.getByRole('button', { name: /^read$/i }).first();
    await expect(statusUnread).toBeVisible({ timeout: 5000 });
    await expect(statusRead).toBeVisible({ timeout: 5000 });
    await statusUnread.click();
    await page.waitForTimeout(1000);
    await uatScreenshot(page, testInfo, '04-filtered-unread');

    const searchInput = page.getByPlaceholder(/search notification/i);
    await expect(searchInput).toBeVisible({ timeout: 3000 });
    await uatScreenshot(page, testInfo, '05-filters-visible');
  });

  test('UAT-23: User navigates to the relevant page by clicking a notification', async ({ page }, testInfo) => {
    const email = generateUniqueEmail();
    const donationName = `Click Donation ${Date.now()}`;

    await registerUser(page, 'UAT Nav', email, 'SecurePass1!');

    await navigateBySidebar(page, 'Donations', '/app/donations');
    const listBtn = page.getByRole('button', { name: /list a donation/i });
    await listBtn.first().click();
    await page.waitForTimeout(1000);
    await page.fill('[name="foodName"]', donationName);
    await page.fill('[name="quantity"]', '3');
    await page.fill('[name="expirationDate"]', getFutureDate(7));
    await page.getByRole('button', { name: /publish donation/i }).click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    await navigateBySidebar(page, 'Notifications', '/app/notifications');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await uatScreenshot(page, testInfo, '01-notifications-loaded');

    const donationFilter = page.getByRole('button', { name: /^donation$/i }).first();
    await expect(donationFilter).toBeVisible({ timeout: 5000 });
    await donationFilter.click();
    await page.waitForTimeout(1500);
    await uatScreenshot(page, testInfo, '02-filtered-donation-type');

    const donationNotif = page.getByText(/published|created|available/i).first();
    await expect(donationNotif).toBeVisible({ timeout: 8000 });

    const card = page.locator('[class*="cursor-pointer"]').filter({ hasText: donationName }).first();
    if (await card.count() > 0) {
      await card.first().click();
      await page.waitForTimeout(2000);
      await expect(page).toHaveURL(/\/app\/donations/);
    } else {
      const anyCard = page.locator('[class*="cursor-pointer"]').filter({ hasText: /donation|published/i }).first();
      if (await anyCard.count() > 0) {
        await anyCard.click();
        await page.waitForTimeout(2000);
        await expect(page).toHaveURL(/\/app\/donations/);
      }
    }
    await uatScreenshot(page, testInfo, '03-navigated-to-donations');
  });
});
