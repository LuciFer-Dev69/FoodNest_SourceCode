import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

describe("FoodNest E2E Test Suite via Selenium", () => {
  let driver;

  beforeAll(async () => {
    const options = new chrome.Options();
    options.addArguments("--headless");
    options.addArguments("--no-sandbox");
    options.addArguments("--disable-dev-shm-usage");

    try {
      // Race the builder build with a 4-second timeout to prevent hangs when ChromeDriver is missing/blocked
      const buildPromise = new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout building Selenium driver (4s limit)")), 4000)
      );

      driver = await Promise.race([buildPromise, timeoutPromise]);
    } catch (err) {
      console.warn("⚠️ Selenium E2E tests require Google Chrome and ChromeDriver installed on your system.");
      console.warn("Details:", err.message);
    }
  }, 6000); // 6s hook timeout

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  it("should navigate to landing and access login screen", async () => {
    if (!driver) {
      console.warn("Skipping Selenium E2E test (browser driver not found)");
      return;
    }

    await driver.get("http://localhost:8080/");
    
    const title = await driver.getTitle();
    expect(title).toContain("FoodNest");

    const registerBtn = await driver.wait(
      until.elementLocated(By.xpath("//a[contains(text(),'Get started') or contains(text(),'Create account')]")),
      10000
    );
    await registerBtn.click();

    await driver.wait(until.urlContains("/register"), 5000);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain("/register");
  }, 30000);
});
