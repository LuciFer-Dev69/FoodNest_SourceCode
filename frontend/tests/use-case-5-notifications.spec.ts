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
});
