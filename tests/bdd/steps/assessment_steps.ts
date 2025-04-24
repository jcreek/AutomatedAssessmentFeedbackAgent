import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ResultsPage } from '../pages/ResultsPage.ts';

When('I fill in the assessment form and submit', async function () {
  await this.page.fill('textarea[name="assessment"]', 'Sample student submission');
  await this.page.click('button[type="submit"]');
});

Then('I should see my feedback displayed', async function () {
  await this.resultsPage.waitForFeedbackVisible();
  const feedback = await this.resultsPage.getGrade();
  expect(feedback).toBeTruthy();
});
