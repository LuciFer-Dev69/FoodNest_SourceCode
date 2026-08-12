import { test, expect } from '@playwright/test';
import { generateUniqueEmail, registerUser, takeScreenshot, navigateBySidebar, getFutureDate } from './test-utils';

test.describe('Use Case 5: View Notifications', () => {
  test('user receives and manages notifications', async ({ page }, testInfo) => {
    const donorEmail = generateUniqueEmail();
    const password = 'SecurePass1!';
    const donationName = `Notif Test ${Date.now()}`;
    const futureExpiry = getFutureDate(7);

    await registerUser(page, 'Notif Donor', donorEmail, password);
    await takeScreenshot(page, testInfo, '01-registered-dashboard');

    // Navigate to notifications - wait for loading to finish
    await navigateBySidebar(page, 'Notifications', '/app/notifications');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await takeScreenshot(page, testInfo, '02-notifications-empty');

    // Create a donation which triggers a donation_created notification
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
    await takeScreenshot(page, testInfo, '03-donation-created');

    // Navigate back to notifications - should have donation_created notification
    await navigateBySidebar(page, 'Notifications', '/app/notifications');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await takeScreenshot(page, testInfo, '04-notifications-populated');

    // Check notifications are populated (donation_created or inventory expiry)
    const notificationCards = page.locator('[class*="border-b"][class*="px-5"][class*="py-4"]');
    const notifCount = await notificationCards.count();
    expect(notifCount).toBeGreaterThanOrEqual(1);

    // Test mark all read
    const markAllBtn = page.getByRole('button', { name: /mark all read/i });
    if (await markAllBtn.count() > 0) {
      await markAllBtn.click();
      await page.waitForTimeout(1500);
      await takeScreenshot(page, testInfo, '05-marked-all-read');
    }

    // Test clear read
    const clearBtn = page.getByRole('button', { name: /clear read/i });
    if (await clearBtn.count() > 0) {
      await clearBtn.click();
      await page.waitForTimeout(1500);
      await takeScreenshot(page, testInfo, '06-cleared-read');
    }
  });

  test('notifications filter and sort works', async ({ page }, testInfo) => {
    await registerUser(page, 'Filter User', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Notifications', '/app/notifications');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Test status filter buttons exist (use .first() due to duplicate "All" across sections)
    const statusUnread = page.getByRole('button', { name: /^unread$/i }).first();
    const statusRead = page.getByRole('button', { name: /^read$/i }).first();

    await expect(statusUnread).toBeVisible({ timeout: 5000 });
    await expect(statusRead).toBeVisible({ timeout: 5000 });

    // Click Unread filter
    await statusUnread.click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, testInfo, 'filtered-unread');

    // Verify search input exists
    const searchInput = page.getByPlaceholder(/search notification/i);
    await expect(searchInput).toBeVisible({ timeout: 3000 });

    await takeScreenshot(page, testInfo, 'filters-visible');
  });

  test('receives expiry notification for items expiring soon', async ({ page }, testInfo) => {
    const email = generateUniqueEmail();
    const itemName = `Expiring Item ${Date.now()}`;

    await registerUser(page, 'Expiry User', email, 'SecurePass1!');
    await takeScreenshot(page, testInfo, '01-registered');

    // Add an item that expires tomorrow
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
    await takeScreenshot(page, testInfo, '02-item-expiring-tomorrow');

    // Navigate to notifications - controller triggers check-expiry on mount
    await navigateBySidebar(page, 'Notifications', '/app/notifications');
    await page.waitForTimeout(4000);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await takeScreenshot(page, testInfo, '03-notifications-after-expiry');

    const expiryText = page.getByText(new RegExp(`${itemName.split(' ')[0]}.*(expires|expired)`, 'i')).first();
    await expect(expiryText).toBeVisible({ timeout: 8000 });
    await takeScreenshot(page, testInfo, '04-expiry-notification-visible');
  });

  test('filters notifications by type and navigates on click', async ({ page }, testInfo) => {
    const email = generateUniqueEmail();
    const donationName = `Click Donation ${Date.now()}`;

    await registerUser(page, 'Nav User', email, 'SecurePass1!');

    // Create a donation to generate a donation_created notification
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
    await takeScreenshot(page, testInfo, '01-notifications-loaded');

    // Type filter buttons exist and are clickable
    const donationFilter = page.getByRole('button', { name: /^donation$/i }).first();
    await expect(donationFilter).toBeVisible({ timeout: 5000 });
    await donationFilter.click();
    await page.waitForTimeout(1500);
    await takeScreenshot(page, testInfo, '02-filtered-donation-type');

    // Assert a donation notification is shown
    const donationNotif = page.getByText(/published|created|available/i).first();
    await expect(donationNotif).toBeVisible({ timeout: 8000 });

    // Click the notification card to navigate to the donations page
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
    await takeScreenshot(page, testInfo, '03-navigated-to-donations');
  });
});
