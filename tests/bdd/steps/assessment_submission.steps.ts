import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

async function getFeedbackText(page: any) {
  await page.waitForSelector('[data-testid="feedback"]', { state: 'visible' });
  return page.textContent('[data-testid="feedback"]');
}

Given('I am on the "Upload Student Submissions" page', async function () {
  await this.page.goto('http://localhost:5173/upload');
});

When('I enter a task description', async function () {
  await this.page.waitForSelector('[data-testid="task-input"]', { state: 'visible' });
  await this.page.fill('[data-testid="task-input"]', 'Write a short essay about climate change.');
});

When('I enter a student submission', async function () {
  await this.page.waitForSelector('[data-testid="submission-input"]', { state: 'visible' });
  await this.page.fill('[data-testid="submission-input"]', 'Climate change is a serious global issue that affects us all.');
});

When('I submit the assessment form', async function () {
  await this.page.waitForSelector('[data-testid="submit-button"]', { state: 'visible' });
  await this.page.click('[data-testid="submit-button"]');
});

When('I leave the submission field empty', async function () {
  await this.page.waitForSelector('[data-testid="submission-input"]', { state: 'visible' });
  await this.page.fill('[data-testid="submission-input"]', '');
});

Then('I should be redirected to the "Assessment Results" page', async function () {
  // Wait for a unique selector on the results page, increase timeout for slow AI assessment
  await this.page.waitForSelector('[data-testid="results-heading"]', { timeout: 60000 });
  const heading = await this.page.textContent('[data-testid="results-heading"]');
  expect(heading).toMatch(/Assessment Results/);
});

Then('I should see the AI-generated grade', async function () {
  const text = await getFeedbackText(this.page);
  expect(text).toMatch(/Grade:/i);
});

Then('I should see strengths, areas for improvement, and individualized activity', async function () {
  const text = await getFeedbackText(this.page);
  expect(text).toMatch(/Strengths:/i);
  expect(text).toMatch(/Areas for Improvement:/i);
  expect(text).toMatch(/Individualized Activity:/i);
});

Then('I should see a reflection question and teacher suggestion', async function () {
  const text = await getFeedbackText(this.page);
  expect(text).toMatch(/Reflection Question:/i);
  expect(text).toMatch(/Teacher Suggestion:/i);
});

Then('I should see spelling and grammar feedback', async function () {
  const text = await getFeedbackText(this.page);
  expect(text).toMatch(/Spelling and Grammar:/i);
});

Then('I should be able to expand to view AI reasoning', async function () {
  await this.page.click('summary:has-text("Show AI Reasoning")');
  const text = await getFeedbackText(this.page);
  expect(text).toMatch(/reasoning/i);
});

Then('the submit button should be disabled', async function () {
  const isDisabled = await this.page.isDisabled('[data-testid="submit-button"]');
  expect(isDisabled).toBe(true);
});
