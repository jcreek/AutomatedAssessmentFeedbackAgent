import type { Page } from '@playwright/test';

export class ResultsPage {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  headingSelector = '[data-testid="results-heading"]';
  feedbackSelector = '[data-testid="feedback"]';
  gradeSelector = '[data-testid="feedback"] div:has(span:has-text("Grade:"))';
  strengthsSelector = '[data-testid="feedback"] div:has(span:has-text("Strengths:"))';
  areasForImprovementSelector = '[data-testid="feedback"] div:has(span:has-text("Areas for Improvement:"))';
  individualizedActivitySelector = '[data-testid="feedback"] div:has(span:has-text("Individualized Activity:"))';
  reflectionQuestionSelector = '[data-testid="feedback"] div:has(span:has-text("Reflection Question:"))';
  teacherSuggestionSelector = '[data-testid="feedback"] div:has(span:has-text("Teacher Suggestion:"))';
  spellingAndGrammarSelector = '[data-testid="feedback"] div:has(span:has-text("Spelling and Grammar:"))';
  reasoningSummarySelector = '[data-testid="feedback"] details > summary';
  reasoningTextSelector = '[data-testid="feedback"] details > div';
  backToUploadSelector = 'a[aria-label="Back to upload page"]';
  noResultsSelector = 'div[aria-live="polite"][role="status"]';
  clearHistorySelector = 'button[aria-label="Clear all assessment history"]';

  async navigateTo() {
    await this.page.goto('http://localhost:5173/results');
  }

  async getHeadingText() {
    return this.page.textContent(this.headingSelector);
  }

  async waitForHeadingVisible(timeout = 60000) {
    await this.page.waitForSelector(this.headingSelector, { state: 'visible', timeout });
  }

  async isFeedbackVisible() {
    return this.page.isVisible(this.feedbackSelector);
  }

  async waitForFeedbackVisible(timeout = 60000) {
    await this.page.waitForSelector(this.feedbackSelector, { state: 'visible', timeout });
  }

  async getGrade() {
    return this.page.textContent(this.gradeSelector);
  }

  async getStrengths() {
    return this.page.textContent(this.strengthsSelector);
  }

  async getAreasForImprovement() {
    return this.page.textContent(this.areasForImprovementSelector);
  }

  async getIndividualizedActivity() {
    return this.page.textContent(this.individualizedActivitySelector);
  }

  async getReflectionQuestion() {
    return this.page.textContent(this.reflectionQuestionSelector);
  }

  async getTeacherSuggestion() {
    return this.page.textContent(this.teacherSuggestionSelector);
  }

  async getSpellingAndGrammar() {
    return this.page.textContent(this.spellingAndGrammarSelector);
  }

  async expandReasoning() {
    await this.page.click(this.reasoningSummarySelector);
  }

  async getReasoning() {
    return this.page.textContent(this.reasoningTextSelector);
  }

  async clickBackToUpload() {
    await this.page.click(this.backToUploadSelector);
  }

  async isNoResultsMessageVisible() {
    return this.page.isVisible(this.noResultsSelector);
  }

  async clearHistory() {
    await this.page.click(this.clearHistorySelector);
  }
}
