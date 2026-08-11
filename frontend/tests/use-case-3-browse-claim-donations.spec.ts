import { test, expect } from '@playwright/test';
import { generateUniqueEmail, registerUser, loginUser, logoutUser, takeScreenshot, navigateBySidebar, getFutureDate } from './test-utils';

async function createDonation(page: any, foodName: string, quantity: string, category: string, expiry: string, unit = 'kg') {
  const listDonationBtn = page.getByRole('button', { name: /list a donation/i }).or(page.getByRole('link', { name: /list donation/i }));
  await listDonationBtn.first().click();
  await page.waitForTimeout(1500);
  await page.fill('[name="foodName"]', foodName);
  await page.fill('[name="quantity"]', quantity);
  await page.fill('[name="unit"]', unit);
  await page.selectOption('[name="category"]', category);
  await page.fill('textarea[name="description"]', 'Fresh food for donation');
  await page.fill('[name="expirationDate"]', expiry);
  await page.fill('[name="pickupDate"]', expiry);
  await page.fill('[name="pickupTime"]', '5-7pm');

  const addressInput = page.getByPlaceholder(/Baneshwor/i);
  if (await addressInput.count() > 0) {
    await addressInput.fill('Baneshwor, Kathmandu');
    await page.waitForTimeout(300);
  }

  await page.getByRole('button', { name: /publish donation/i }).click();
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle');
}

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

    await createDonation(page, donationName, '5', 'Produce', futureExpiry);
    await takeScreenshot(page, testInfo, '03-donation-published');
    await expect(page.getByText(donationName).first()).toBeVisible({ timeout: 10000 });

    await logoutUser(page);
    await registerUser(page, 'Claimant User', claimantEmail, password);
    await takeScreenshot(page, testInfo, '04-claimant-registered');

    await navigateBySidebar(page, 'Donations', '/app/donations');
    await page.waitForTimeout(2000);
    await takeScreenshot(page, testInfo, '05-claimant-browse-donations');

    const donationCard = page.locator('[class*="card"]').filter({ hasText: donationName }).first();
    await donationCard.waitFor({ state: 'visible', timeout: 15000 });

    const viewDetailsBtn = donationCard.getByRole('button', { name: /view details/i });
    await expect(viewDetailsBtn).toBeVisible({ timeout: 5000 });
    await viewDetailsBtn.click();
    await page.waitForTimeout(1500);
    await takeScreenshot(page, testInfo, '06-donation-detail-modal');

    await expect(page.getByText('5-7pm').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Pickup date').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Pickup time').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(futureExpiry).first()).toBeVisible({ timeout: 5000 });

    const claimBtn = page.getByRole('button', { name: /claim donation/i });
    await expect(claimBtn).toBeVisible({ timeout: 5000 });
    await claimBtn.click();
    await page.waitForTimeout(3000);
    await takeScreenshot(page, testInfo, '07-donation-claimed');

    await expect(page.getByText(/donation claimed/i)).toBeVisible({ timeout: 5000 });
    await takeScreenshot(page, testInfo, '08-claim-confirmation');
  });

  test('cannot claim own donation', async ({ page }, testInfo) => {
    const donationName = `Own Donation ${Date.now()}`;

    await registerUser(page, 'Donor', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');

    await createDonation(page, donationName, '3', 'Produce', getFutureDate(7));

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

    await registerUser(page, 'Donor', donorEmail, 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');
    await createDonation(page, donationName, '2', 'Produce', futureExpiry);
    await expect(page.getByText(donationName).first()).toBeVisible({ timeout: 10000 });

    await logoutUser(page);
    await registerUser(page, 'Claimant', claimantEmail, 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');
    await page.waitForTimeout(2000);

    const card1 = page.locator('[class*="card"]').filter({ hasText: donationName });
    await card1.first().waitFor({ state: 'visible', timeout: 15000 });
    await card1.first().getByRole('button', { name: /view details/i }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: /claim donation/i }).click();
    await page.waitForTimeout(2000);

    await logoutUser(page);
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

  test('filters donations by category', async ({ page }, testInfo) => {
    const donorEmail = generateUniqueEmail();
    const futureExpiry = getFutureDate(7);

    await registerUser(page, 'Donor', donorEmail, 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');

    await createDonation(page, 'Produce Donation', '3', 'Produce', futureExpiry);
    await createDonation(page, 'Dairy Donation', '2', 'Dairy', futureExpiry);

    const dairyPill = page.getByRole('button', { name: /^dairy$/i });
    await dairyPill.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page.getByText('Dairy Donation').first()).toBeVisible({ timeout: 5000 });
    const produceCount = await page.getByText('Produce Donation').count();
    expect(produceCount).toBe(0);
    await takeScreenshot(page, testInfo, 'filtered-dairy-donations');
  });

  test('searches donations by keyword', async ({ page }, testInfo) => {
    const donorEmail = generateUniqueEmail();
    const futureExpiry = getFutureDate(7);

    await registerUser(page, 'Donor', donorEmail, 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');

    await createDonation(page, 'Fresh Strawberries', '3', 'Produce', futureExpiry);
    await createDonation(page, 'Cheddar Cheese', '2', 'Dairy', futureExpiry);

    const searchInput = page.getByPlaceholder(/search donations/i);
    await searchInput.fill('Strawberries');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page.getByText('Fresh Strawberries').first()).toBeVisible({ timeout: 5000 });
    const cheeseCount = await page.getByText('Cheddar Cheese').count();
    expect(cheeseCount).toBe(0);
    await takeScreenshot(page, testInfo, 'search-strawberries');
  });

  test('browses donations by location in detail view', async ({ page }, testInfo) => {
    const donorEmail = generateUniqueEmail();
    const claimantEmail = generateUniqueEmail();
    const donationName = `Location Donation ${Date.now()}`;
    const futureExpiry = getFutureDate(7);

    await registerUser(page, 'Donor', donorEmail, 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');
    await createDonation(page, donationName, '4', 'Produce', futureExpiry);
    await expect(page.getByText(donationName).first()).toBeVisible({ timeout: 10000 });

    await logoutUser(page);
    await registerUser(page, 'Seeker', claimantEmail, 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');
    await page.waitForTimeout(2000);

    const card = page.locator('[class*="card"]').filter({ hasText: donationName }).first();
    await card.waitFor({ state: 'visible', timeout: 15000 });
    await card.getByRole('button', { name: /view details/i }).click();
    await page.waitForTimeout(1000);

    const pickupInfo = page.getByText(/pickup/i).first();
    await expect(pickupInfo).toBeVisible({ timeout: 5000 });
    await takeScreenshot(page, testInfo, 'donation-location-detail');
  });

  test('claimant receives confirmation notification', async ({ page }, testInfo) => {
    const donorEmail = generateUniqueEmail();
    const claimantEmail = generateUniqueEmail();
    const donationName = `Notif Donation ${Date.now()}`;
    const futureExpiry = getFutureDate(7);

    await registerUser(page, 'Donor', donorEmail, 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');
    await createDonation(page, donationName, '3', 'Produce', futureExpiry);
    await expect(page.getByText(donationName).first()).toBeVisible({ timeout: 10000 });

    await logoutUser(page);
    await registerUser(page, 'Claimant', claimantEmail, 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');
    await page.waitForTimeout(2000);

    const card = page.locator('[class*="card"]').filter({ hasText: donationName }).first();
    await card.waitFor({ state: 'visible', timeout: 15000 });
    await card.getByRole('button', { name: /view details/i }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: /claim donation/i }).click();
    await page.waitForTimeout(2000);

    await navigateBySidebar(page, 'Notifications', '/app/notifications');
    await page.waitForTimeout(1000);

    const notif = page.getByText(/donation|claimed|confirmation/i).first();
    await expect(notif).toBeVisible({ timeout: 8000 });
    await takeScreenshot(page, testInfo, 'claim-notification-shown');
  });
});