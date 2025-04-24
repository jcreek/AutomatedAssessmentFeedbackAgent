import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I am viewing the assessment history', async function () {
  await this.page.goto('http://localhost:5173/results');
  await this.page.waitForSelector('table[aria-label="Assessment history table"]');
});

Given('I have previously submitted assessments', async function () {
  // Create two assessments using the UI
  for (const assessment of [
    {
      task: 'Name a dog',
      submission: 'Fido',
    },
    {
      task: 'Name a fish',
      submission: 'Dog',
    }
  ]) {
    await this.page.goto('http://localhost:5173/upload');
    await this.page.fill('[data-testid="task-input"]', assessment.task);
    await this.page.fill('[data-testid="submission-input"]', assessment.submission);
    await Promise.all([
      this.page.waitForNavigation({ url: '**/results' }),
      this.page.click('[data-testid="submit-button"]')
    ]);
  }
});

When('I visit the "Assessment Results" page', async function () {
  await this.page.goto('http://localhost:5173/results');
});

Then('I should see a table of past assessments with date, task, and grade', async function () {
  await this.page.waitForSelector('table[aria-label="Assessment history table"]');
  const table = await this.page.$('table[aria-label="Assessment history table"]');
  expect(table).not.toBeNull();
  const text = await this.page.textContent('table[aria-label="Assessment history table"]');
  expect(text).toMatch(/Name a dog/);
  expect(text).toMatch(/Name a fish/);
});

Then('I should be able to expand an entry to see detailed feedback', async function () {
  await this.page.click('summary[aria-label^="View details for assessment"]');
  const expanded = await this.page.textContent('div.bg-gray-50');
  expect(expanded).toMatch(/Strengths:/);
  expect(expanded).toMatch(/Areas for Improvement:/);
  expect(expanded).toMatch(/Individualized Activity:/);
});

When('I delete an assessment from history', async function () {
  await Promise.all([
    this.page.waitForEvent('dialog').then(dialog => dialog.accept()),
    this.page.click('button[aria-label^="Delete assessment from"]')
  ]);
});

Then('that assessment should be removed from the history', async function () {
  await this.page.waitForSelector('table[aria-label="Assessment history table"]');
  const tableText = await this.page.textContent('table[aria-label="Assessment history table"]');
  expect(tableText).toMatch(/Name a dog/);
  expect(tableText).not.toMatch(/Name a fish/);
});

When('I clear all assessment history', async function () {
  await Promise.all([
    this.page.waitForEvent('dialog').then(dialog => dialog.accept()),
    this.page.click('button[aria-label="Clear all assessment history"]')
  ]);
});

Then('all assessments should be removed from the history', async function () {
  // Wait for the table to become empty or show an empty state
  await this.page.waitForFunction(() => {
    const rows = document.querySelectorAll('table[aria-label="Assessment history table"] tbody tr');
    return rows.length === 0;
  }, { timeout: 20000 });
  const rows = await this.page.$$('table[aria-label="Assessment history table"] tbody tr');
  expect(rows.length).toBe(0);
});
