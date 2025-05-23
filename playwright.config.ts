import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'http://localhost:5173',
  },
  testDir: './tests/bdd',
  timeout: 30000,
});
