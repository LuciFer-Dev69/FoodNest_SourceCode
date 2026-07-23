import { Page, TestInfo } from '@playwright/test';
import path from 'path';

export function generateUniqueEmail(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}@foodnest.test`;
}

export async function takeScreenshot(page: Page, testInfo: TestInfo, stepName: string): Promise<void> {
  const sanitized = testInfo.title.replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, '-');
  const screenshotDir = path.join('test-results', 'screenshots', sanitized);
  const filePath = path.join(screenshotDir, `${stepName}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
}

export async function waitForSPA(page: Page, urlSubstring: string, timeout = 20000): Promise<void> {
  await page.waitForFunction(
    (substring: string) => window.location.href.includes(substring),
    urlSubstring,
    { timeout },
  );
}

export async function registerUser(
  page: Page,
  name: string,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/login?mode=register');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  await page.fill('[name="name"]', name);
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);

  await page.getByRole('button', { name: /create account/i }).click();

  await page.waitForSelector('[data-testid="2fa-code"]', { timeout: 15000 });
  await page.waitForTimeout(300);

  let code = await page.locator('[data-testid="2fa-code"] p:last-child').textContent();
  code = code!.trim();

  await page.fill('[name="code"]', code);
  await page.getByRole('button', { name: /verify & complete/i }).click();

  await waitForSPA(page, '/app/dashboard', 20000);
  await page.waitForTimeout(1500);
}

export function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

export async function navigateBySidebar(page: Page, linkName: string, expectedUrl: string): Promise<void> {
  await page.getByRole('link', { name: new RegExp(linkName, 'i') }).first().click();
  await waitForSPA(page, expectedUrl, 15000);
  await page.waitForTimeout(1000);
}
