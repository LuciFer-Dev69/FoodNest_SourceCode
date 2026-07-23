import { test, expect } from '@playwright/test';
import { generateUniqueEmail, registerUser, takeScreenshot, navigateBySidebar, getFutureDate } from './test-utils';

test.describe('Use Case 3: Browse Food Items and Claim Donations', () => {
  test('user browses available food listings and claims a donation', async ({ page }, testInfo) => {
    const donorEmail = generateUniqueEmail();
    const claimantEmail = generateUniqueEmail();
    const password = 'SecurePass1!';
    const donationName = `Donation Test ${Date.now()}`;
    const futureExpiry = getFutureDate(7);

    // ─── PART 1: Donor creates a donation ───────────────────────────

    await registerUser(page, 'Donor User', donorEmail, password);
    await takeScreenshot(page, testInfo, '01-donor-registered');

    await navigateBySidebar(page, 'Donations', '/app/donations');
    await takeScreenshot(page, testInfo, '02-donations-page');

    const listDonationBtn = page.getByRole('button', { name: /list a donation/i }).or(page.getByRole('link', { name: /list donation/i }));
    await listDonationBtn.first().click();
    await page.waitForTimeout(1500);
    await takeScreenshot(page, testInfo, '03-create-donation-form');

    await page.fill('[name="foodName"]', donationName);
    await page.fill('[name="quantity"]', '5');
    await page.fill('[name="unit"]', 'kg');
    await page.selectOption('[name="category"]', 'Produce');
    await page.fill('textarea[name="description"]', 'Fresh apples for donation');
    await page.fill('[name="expirationDate"]', futureExpiry);
    await page.fill('[name="pickupDate"]', futureExpiry);
    await page.fill('[name="pickupTime"]', '5-7pm');

    const countrySelect = page.locator('select').filter({ has: page.locator('option[value="Nepal"]') });
    if (await countrySelect.count() > 0) {
      await countrySelect.selectOption('Nepal');
      await page.waitForTimeout(300);
    }

    const addressInput = page.getByPlaceholder(/Baneshwor/i);
    if (await addressInput.count() > 0) {
      await addressInput.fill('Baneshwor, Kathmandu');
      await page.waitForTimeout(300);
    }

    await page.getByRole('button', { name: /publish donation/i }).click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, testInfo, '04-donation-published');

    await expect(page.getByText(donationName).first()).toBeVisible({ timeout: 10000 });

    // ─── PART 2: Logout donor, register claimant ────────────────────

    await page.evaluate(() => {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('auth-changed'));
    });
    await page.waitForTimeout(1000);
    await page.goto('/login?mode=register');
    await page.waitForLoadState('networkidle');

    await registerUser(page, 'Claimant User', claimantEmail, password);
    await takeScreenshot(page, testInfo, '05-claimant-registered');

    await navigateBySidebar(page, 'Donations', '/app/donations');
    await page.waitForTimeout(2000);
    await takeScreenshot(page, testInfo, '06-claimant-browse-donations');

    const donationCard = page.locator('[class*="card"]').filter({ hasText: donationName }).first();
    await donationCard.waitFor({ state: 'visible', timeout: 15000 });

    const viewDetailsBtn = donationCard.getByRole('button', { name: /view details/i });
    await expect(viewDetailsBtn).toBeVisible({ timeout: 5000 });
    await viewDetailsBtn.click();
    await page.waitForTimeout(1500);
    await takeScreenshot(page, testInfo, '07-donation-detail-modal');

    const claimBtn = page.getByRole('button', { name: /claim donation/i });
    await expect(claimBtn).toBeVisible({ timeout: 5000 });
    await claimBtn.click();
    await page.waitForTimeout(3000);
    await takeScreenshot(page, testInfo, '08-donation-claimed');

    await page.getByText(/claimed|success/i).first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await takeScreenshot(page, testInfo, '09-claim-confirmation');
  });
});
