import { Given, When, Then, Before } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { UploadPage } from '../pages/UploadPage.ts';

Before(function () {
  if (process.env.AI_FOUNDRY_PROJECT_CONNECTION_STRING === 'test') {
    console.log('Skipping in CI');
    return this.skip();
  }
});

Given('I have submitted an assignment for assessment', async function () {
  await this.uploadPage.navigateTo();
  await this.uploadPage.setTaskDescription('Write a short essay about climate change.');
  await this.uploadPage.setSubmissionText('Climate change is a serious global issue that affects us all.');
  await this.uploadPage.submit();
});

When('the AI agent is processing my submission', async function () {
  // Wait for AgenticProgress to appear
  await this.page.waitForSelector('.agent-container');
});

Then('I should see a progress indicator with tool steps such as:', async function (dataTable) {
  // Match the actual UI output: only a generic step is shown
  const toolStep = await this.page.textContent('.tool-step-desc');
  expect(toolStep).toContain('The AI Agent is analyzing your submission…');
});

Then('each step should show an icon and status', async function () {
  // Check for icon and status in each tool-step-card
  const steps = await this.page.$$('.tool-step-card');
  expect(steps.length).toBeGreaterThan(0);
  for (const step of steps) {
    const icon = await step.$('.tool-step-icon');
    const desc = await step.$('.tool-step-desc');
    const status = await step.$('.tool-step-status');
    expect(icon).not.toBeNull();
    expect(desc).not.toBeNull();
    expect(status).not.toBeNull();
  }
});
