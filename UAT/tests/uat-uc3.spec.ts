import { test, expect } from '@playwright/test';
import { generateUniqueEmail, registerUser, logoutUser, navigateBySidebar, getFutureDate, uatScreenshot } from './uat-utils';

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

test.describe('UAT — Use Case 3: Browse Food Items and Claim Donations', () => {
  test('UAT-12: Donor publishes a donation and a second user claims it end to end', async ({ page }, testInfo) => {
    const donorEmail = generateUniqueEmail();
    const claimantEmail = generateUniqueEmail();
    const donationName = `Donation Test ${Date.now()}`;
    const futureExpiry = getFutureDate(7);

    await registerUser(page, 'UAT Donor', donorEmail, 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');
    await createDonation(page, donationName, '5', 'Produce', futureExpiry);
    await expect(page.getByText(donationName).first()).toBeVisible({ timeout: 10000 });
    await uatScreenshot(page, testInfo, '01-donation-published');

    await logoutUser(page);
    await registerUser(page, 'UAT Claimant', claimantEmail, 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');
    await page.waitForTimeout(2000);
    await uatScreenshot(page, testInfo, '02-claimant-browse-donations');

    const donationCard = page.locator('[class*="card"]').filter({ hasText: donationName }).first();
    await donationCard.waitFor({ state: 'visible', timeout: 15000 });
    const viewDetailsBtn = donationCard.getByRole('button', { name: /view details/i });
    await expect(viewDetailsBtn).toBeVisible({ timeout: 5000 });
    await viewDetailsBtn.click();
    await page.waitForTimeout(1500);
    await uatScreenshot(page, testInfo, '03-donation-detail-modal');

    await expect(page.getByText('5-7pm').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Pickup date').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Pickup time').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(futureExpiry).first()).toBeVisible({ timeout: 5000 });

    const claimBtn = page.getByRole('button', { name: /claim donation/i });
    await expect(claimBtn).toBeVisible({ timeout: 5000 });
    await claimBtn.click();
    await expect(page.getByText(/donation claimed/i)).toBeVisible({ timeout: 5000 });
    await uatScreenshot(page, testInfo, '04-donation-claimed');
  });

  test('UAT-13: A donor cannot claim their own donation', async ({ page }, testInfo) => {
    const donationName = `Own Donation ${Date.now()}`;

    await registerUser(page, 'UAT Donor', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');
    await createDonation(page, donationName, '3', 'Produce', getFutureDate(7));

    const card = page.locator('[class*="card"]').filter({ hasText: donationName });
    await card.first().waitFor({ state: 'visible', timeout: 10000 });

    const viewBtn = card.first().getByRole('button', { name: /view details/i });
    expect(await viewBtn.count()).toBe(0);
    await expect(card.first().locator('button').first()).toBeVisible({ timeout: 3000 });
    await uatScreenshot(page, testInfo, '01-own-donation-no-claim');
  });

  test('UAT-14: An already-claimed donation cannot be claimed again', async ({ page }, testInfo) => {
    const donorEmail = generateUniqueEmail();
    const claimantEmail = generateUniqueEmail();
    const thirdEmail = generateUniqueEmail();
    const donationName = `Already Claimed ${Date.now()}`;
    const futureExpiry = getFutureDate(7);

    await registerUser(page, 'UAT Donor', donorEmail, 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');
    await createDonation(page, donationName, '2', 'Produce', futureExpiry);
    await expect(page.getByText(donationName).first()).toBeVisible({ timeout: 10000 });

    await logoutUser(page);
    await registerUser(page, 'UAT Claimant', claimantEmail, 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');
    await page.waitForTimeout(2000);
    const card1 = page.locator('[class*="card"]').filter({ hasText: donationName });
    await card1.first().waitFor({ state: 'visible', timeout: 15000 });
    await card1.first().getByRole('button', { name: /view details/i }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: /claim donation/i }).click();
    await page.waitForTimeout(2000);

    await logoutUser(page);
    await registerUser(page, 'UAT Third', thirdEmail, 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');
    await page.waitForTimeout(2000);

    const card2 = page.locator('[class*="card"]').filter({ hasText: donationName });
    await expect(card2.first()).not.toBeVisible({ timeout: 15000 });
    await uatScreenshot(page, testInfo, '01-already-claimed-not-visible');
  });

  test('UAT-15: Publishing a donation with missing fields is rejected', async ({ page }, testInfo) => {
    await registerUser(page, 'UAT Donor', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');

    const listBtn = page.getByRole('button', { name: /list a donation/i });
    await listBtn.first().click();
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /publish donation/i }).click();
    await page.waitForTimeout(1500);

    await expect(page.getByText(/food name and quantity are required/i)).toBeVisible({ timeout: 5000 });
    await uatScreenshot(page, testInfo, '01-create-donation-missing-fields');
  });

  test('UAT-16: User filters/searches donations and views pickup & location details', async ({ page }, testInfo) => {
    const donorEmail = generateUniqueEmail();
    const claimantEmail = generateUniqueEmail();
    const donationName = `Location Donation ${Date.now()}`;
    const futureExpiry = getFutureDate(7);

    await registerUser(page, 'UAT Donor', donorEmail, 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');
    await createDonation(page, 'Produce Donation', '3', 'Produce', futureExpiry);
    await createDonation(page, 'Dairy Donation', '2', 'Dairy', futureExpiry);
    await createDonation(page, donationName, '4', 'Produce', futureExpiry);

    const dairyPill = page.getByRole('button', { name: /^dairy$/i });
    await dairyPill.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await expect(page.getByText('Dairy Donation').first()).toBeVisible({ timeout: 5000 });
    const produceHidden = page.locator('[class*="glass-card"]').filter({ hasText: 'Produce Donation' });
    expect(await produceHidden.count()).toBe(0);
    await uatScreenshot(page, testInfo, '01-filtered-dairy-donations');

    const searchInput = page.getByPlaceholder(/search donations/i);
    await searchInput.fill('Location');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await expect(page.getByText(donationName).first()).toBeVisible({ timeout: 5000 });
    await uatScreenshot(page, testInfo, '02-search-location');

    await logoutUser(page);
    await registerUser(page, 'UAT Seeker', claimantEmail, 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');
    await page.waitForTimeout(2000);

    const card = page.locator('[class*="card"]').filter({ hasText: donationName }).first();
    await card.waitFor({ state: 'visible', timeout: 15000 });
    await card.getByRole('button', { name: /view details/i }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByText(/pickup/i).first()).toBeVisible({ timeout: 5000 });
    await uatScreenshot(page, testInfo, '03-donation-location-detail');
  });

  test('UAT-17: Donor edits and deletes a donation listing', async ({ page }, testInfo) => {
    const editName = `Editable Donation ${Date.now()}`;
    const updatedName = `${editName} (Updated)`;
    const deleteName = `Deletable Donation ${Date.now()}`;

    await registerUser(page, 'UAT Donor', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');

    await createDonation(page, editName, '3', 'Produce', getFutureDate(7));
    await expect(page.getByText(editName).first()).toBeVisible({ timeout: 10000 });
    const card = page.locator('[class*="card"]').filter({ hasText: editName }).first();
    await card.waitFor({ state: 'visible', timeout: 10000 });
    const editBtn = card.locator('button').filter({ has: page.locator('svg.lucide-pen, svg.lucide-edit-2') }).first();
    await expect(editBtn).toBeVisible({ timeout: 5000 });
    await editBtn.click();
    await page.waitForTimeout(1000);
    await page.fill('[name="foodName"]', updatedName);
    await page.getByRole('button', { name: /save changes/i }).click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(updatedName).first()).toBeVisible({ timeout: 10000 });
    await uatScreenshot(page, testInfo, '01-donation-edited');

    await createDonation(page, deleteName, '2', 'Dairy', getFutureDate(7));
    await expect(page.getByText(deleteName).first()).toBeVisible({ timeout: 10000 });
    const deleteCard = page.locator('[class*="card"]').filter({ hasText: deleteName }).first();
    await deleteCard.waitFor({ state: 'visible', timeout: 10000 });
    const deleteBtn = deleteCard.locator('button').filter({ has: page.locator('svg.lucide-trash-2') }).first();
    await expect(deleteBtn).toBeVisible({ timeout: 5000 });
    await deleteBtn.click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(deleteName).first()).not.toBeVisible({ timeout: 10000 });
    await uatScreenshot(page, testInfo, '02-donation-deleted');
  });

  test('UAT-18: Donor shares a donation to the community feed', async ({ page }, testInfo) => {
    const donationName = `Community Donation ${Date.now()}`;

    await registerUser(page, 'UAT Donor', generateUniqueEmail(), 'SecurePass1!');
    await navigateBySidebar(page, 'Donations', '/app/donations');

    const listBtn = page.getByRole('button', { name: /list a donation/i }).or(page.getByRole('link', { name: /list donation/i }));
    await listBtn.first().click();
    await page.waitForTimeout(1500);
    await page.fill('[name="foodName"]', donationName);
    await page.fill('[name="quantity"]', '4');
    await page.fill('[name="unit"]', 'kg');
    await page.selectOption('[name="category"]', 'Produce');
    await page.fill('[name="expirationDate"]', getFutureDate(7));
    await page.fill('[name="pickupDate"]', getFutureDate(7));
    await page.fill('[name="pickupTime"]', '4-6pm');

    const shareCheckbox = page.locator('[name="shareToCommunity"]');
    await expect(shareCheckbox).toBeVisible({ timeout: 5000 });
    await shareCheckbox.check();
    await page.getByRole('button', { name: /publish donation/i }).click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    await uatScreenshot(page, testInfo, '01-donation-shared');

    await navigateBySidebar(page, 'Community', '/app/community');
    await page.waitForTimeout(2000);
    await expect(page.getByText(donationName).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/food donation/i).first()).toBeVisible({ timeout: 5000 });
    await uatScreenshot(page, testInfo, '02-donation-post-in-community');
  });
});
