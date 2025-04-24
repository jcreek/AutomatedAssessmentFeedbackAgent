import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I am on the homepage', async function () {
  await this.page.goto('http://localhost:5173/');
});

When('I fill in the assessment form and submit', async function () {
  await this.page.fill('textarea[name="assessment"]', 'Sample student submission');
  await this.page.click('button[type="submit"]');
});

Then('I should see my feedback displayed', async function () {
  await this.page.waitForSelector('.feedback');
  const feedback = await this.page.textContent('.feedback');
  expect(feedback).toBeTruthy();
});
