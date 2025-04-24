import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';
import { setDefaultTimeout, setWorldConstructor, World, Before, After, AfterAll } from '@cucumber/cucumber';

setDefaultTimeout(60000); // 60 seconds

let browser: Browser;

class CustomWorld extends World {
  page!: Page;

  async openPage() {
    if (!browser) {
      browser = await chromium.launch({ headless: true });
    }
    this.page = await browser.newPage();
  }

  async closePage() {
    if (this.page) {
      await this.page.close();
    }
  }
}

setWorldConstructor(CustomWorld);

Before(async function () {
  await this.openPage();
});

// Always clear assessment history for destructive scenarios after page is available
Before({ tags: '@deleteAssessment or @clearAssessment' }, async function () {
  if (!this.page) throw new Error('Playwright page not initialized!');
  await this.page.goto('http://localhost:5173/results');
  // Clear assessment history to guarantee a clean state
  await this.page.evaluate(() => localStorage.removeItem('assessmentHistory'));
});

// Always clear assessment history after every scenario for isolation
After(async function () {
  if (this.page) {
    await this.page.evaluate(() => localStorage.removeItem('assessmentHistory'));
  }
});

AfterAll(async function () {
  if (browser) {
    await browser.close();
  }
});
