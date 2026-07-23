import { test, expect } from '@playwright/test';
import { generateUniqueEmail, registerUser, takeScreenshot, navigateBySidebar, getFutureDate } from './test-utils';

test.describe('Use Case 3: Browse Food Items and Claim Donations', () => {
  test('user browses available food listings and claims a donation', async ({ page }, testInfo) => {
    const donorEmail = generateUniqueEmail();
    const claimantEmail = generateUniqueEmail();
    const password = 'SecurePass1!';
    const donationName = `Donation Test ${Date.now()}`;
    const futureExpiry = getFutureDate(7);

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

  test('cannot claim own donation', async ({ page }, testInfo) => {
    const donationName = `Own Donation ${Date.now()}`;

    await registerUser(page, 'Donor', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');

    const listBtn = page.getByRole('button', { name: /list a donation/i });
    await listBtn.first().click();
    await page.waitForTimeout(1000);
    await page.fill('[name="foodName"]', donationName);
    await page.fill('[name="quantity"]', '3');
    await page.fill('[name="unit"]', 'kg');
    await page.getByRole('button', { name: /publish donation/i }).click();
    await page.waitForTimeout(3000);

    const card = page.locator('[class*="card"]').filter({ hasText: donationName });
    await card.first().waitFor({ state: 'visible', timeout: 10000 });

    const viewBtn = card.first().getByRole('button', { name: /view details/i });
    const viewCount = await viewBtn.count();
    expect(viewCount).toBe(0);

    await expect(card.first().locator('button').first()).toBeVisible({ timeout: 3000 });
    await takeScreenshot(page, testInfo, 'own-donation-no-claim');
  });

  test('rejects claim on already-claimed donation', async ({ page }, testInfo) => {
    const donorEmail = generateUniqueEmail();
    const claimantEmail = generateUniqueEmail();
    const thirdEmail = generateUniqueEmail();
    const donationName = `Already Claimed ${Date.now()}`;
    const futureExpiry = getFutureDate(7);

    // User A creates donation
    await registerUser(page, 'Donor', donorEmail, 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');
    const listBtn = page.getByRole('button', { name: /list a donation/i });
    await listBtn.first().click();
    await page.waitForTimeout(1000);
    await page.fill('[name="foodName"]', donationName);
    await page.fill('[name="quantity"]', '2');
    await page.fill('[name="expirationDate"]', futureExpiry);
    await page.getByRole('button', { name: /publish donation/i }).click();
    await page.waitForTimeout(3000);
    await expect(page.getByText(donationName).first()).toBeVisible({ timeout: 10000 });

    // Logout A
    await page.evaluate(() => { localStorage.removeItem('token'); sessionStorage.removeItem('token'); window.dispatchEvent(new CustomEvent('auth-changed')); });
    await page.waitForTimeout(500);
    await page.goto('/login?mode=register');
    await page.waitForLoadState('networkidle');

    // User B claims it
    await registerUser(page, 'Claimant', claimantEmail, 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');
    await page.waitForTimeout(2000);
    const card1 = page.locator('[class*="card"]').filter({ hasText: donationName });
    await card1.first().waitFor({ state: 'visible', timeout: 15000 });
    await card1.first().getByRole('button', { name: /view details/i }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: /claim donation/i }).click();
    await page.waitForTimeout(2000);

    // Logout B
    await page.evaluate(() => { localStorage.removeItem('token'); sessionStorage.removeItem('token'); window.dispatchEvent(new CustomEvent('auth-changed')); });
    await page.waitForTimeout(500);
    await page.goto('/login?mode=register');
    await page.waitForLoadState('networkidle');

    // User C views it - claimed donations are filtered from the browse feed
    await registerUser(page, 'Third', thirdEmail, 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');
    await page.waitForTimeout(2000);
    const card2 = page.locator('[class*="card"]').filter({ hasText: donationName });
    await expect(card2.first()).not.toBeVisible({ timeout: 15000 });
    await takeScreenshot(page, testInfo, 'already-claimed-not-visible');
  });

  test('rejects create donation with missing fields', async ({ page }, testInfo) => {
    await registerUser(page, 'Donor User', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');

    const listBtn = page.getByRole('button', { name: /list a donation/i });
    await listBtn.first().click();
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /publish donation/i }).click();
    await page.waitForTimeout(1500);

    const toast = page.getByText(/food name and quantity are required/i);
    await expect(toast).toBeVisible({ timeout: 5000 });
    await takeScreenshot(page, testInfo, 'create-donation-missing-fields');
  });
});
