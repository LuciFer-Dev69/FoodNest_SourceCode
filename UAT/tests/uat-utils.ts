import { Page, TestInfo } from '@playwright/test';
import path from 'path';

export {
  generateUniqueEmail,
  registerUser,
  loginUser,
  logoutUser,
  getFutureDate,
  navigateBySidebar,
  logoutAndClear,
} from '../../frontend/tests/test-utils';

const uatRoot = path.resolve(__dirname, '..');

export async function uatScreenshot(page: Page, testInfo: TestInfo, stepName: string): Promise<void> {
  const parsed = path.parse(testInfo.file);
  const baseName = parsed.name.replace('.spec', '');
  const screenshotDir = path.join(uatRoot, 'test-results', 'screenshots', baseName);
  const filePath = path.join(screenshotDir, `${stepName}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  await testInfo.attach(stepName, { path: filePath, contentType: 'image/png' });
}
