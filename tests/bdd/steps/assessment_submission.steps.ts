import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { UploadPage } from '../pages/UploadPage.ts';
import { ResultsPage } from '../pages/ResultsPage.ts';

Given('I am on the "Upload Student Submissions" page', async function () {
  await this.uploadPage.navigateTo();
});

When('I enter a task description', async function () {
  await this.uploadPage.setTaskDescription('Write a short essay about climate change.');
});

When('I enter a student submission', async function () {
  await this.uploadPage.setSubmissionText('Climate change is a serious global issue that affects us all.');
});

When('I submit the assessment form', async function () {
  await this.uploadPage.submit();
});

When('I leave the submission field empty', async function () {
  await this.uploadPage.setSubmissionText('');
});

Then('I should be redirected to the "Assessment Results" page', async function () {
  // Increase timeout for slow AI assessment
  await this.page.waitForSelector(this.resultsPage.headingSelector, { timeout: 60000 });
  const heading = await this.resultsPage.getHeadingText();
  expect(heading).toMatch(/Assessment Results/);
});

Then('I should see the AI-generated grade', async function () {
  await this.resultsPage.waitForFeedbackVisible();
  const gradeText = await this.resultsPage.getGrade();
  expect(gradeText).toMatch(/Grade:/i);
});

Then('I should see strengths, areas for improvement, and individualized activity', async function () {
  await this.resultsPage.waitForFeedbackVisible();
  const strengths = await this.resultsPage.getStrengths();
  const areas = await this.resultsPage.getAreasForImprovement();
  const activity = await this.resultsPage.getIndividualizedActivity();
  expect(strengths).toBeTruthy();
  expect(areas).toBeTruthy();
  expect(activity).toBeTruthy();
});

Then('I should see a reflection question and teacher suggestion', async function () {
  this.resultsPage = new ResultsPage(this.page);
  await this.resultsPage.waitForFeedbackVisible();
  const reflection = await this.resultsPage.getReflectionQuestion();
  const suggestion = await this.resultsPage.getTeacherSuggestion();
  expect(reflection).toBeTruthy();
  expect(suggestion).toBeTruthy();
});

Then('I should see spelling and grammar feedback', async function () {
  this.resultsPage = new ResultsPage(this.page);
  await this.resultsPage.waitForFeedbackVisible();
  const spelling = await this.resultsPage.getSpellingAndGrammar();
  expect(spelling).toBeTruthy();
});

Then('I should be able to expand to view AI reasoning', async function () {
  this.resultsPage = new ResultsPage(this.page);
  await this.resultsPage.expandReasoning();
  const reasoning = await this.resultsPage.getReasoning();
  expect(reasoning).toBeTruthy();
});

Then('the submit button should be disabled', async function () {
  const isDisabled = await this.page.isDisabled('[data-testid="submit-button"]');
  expect(isDisabled).toBe(true);
});
