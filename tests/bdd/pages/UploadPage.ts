import type { Page } from '@playwright/test';

export class UploadPage {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  taskInputSelector = '[data-testid="task-input"]';
  fileInputSelector = 'input[type="file"]';
  submissionInputSelector = '[data-testid="submission-input"]';
  submitButtonSelector = '[data-testid="submit-button"]';

  async navigateTo() {
    await this.page.goto('http://localhost:5173/upload');
  }

  async setTaskDescription(text: string) {
    await this.page.fill(this.taskInputSelector, text);
  }

  async uploadFile(filePath: string) {
    await this.page.setInputFiles(this.fileInputSelector, filePath);
  }

  async setSubmissionText(text: string) {
    await this.page.fill(this.submissionInputSelector, text);
  }

  async submit() {
    await this.page.click(this.submitButtonSelector);
  }

  async isSubmitButtonEnabled() {
    return this.page.isEnabled(this.submitButtonSelector);
  }
}
