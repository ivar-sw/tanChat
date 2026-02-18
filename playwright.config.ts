import { defineConfig } from '@playwright/test'

export default defineConfig({
  globalTeardown: './e2e/global-teardown.ts',
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  workers: 1,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: true,
    timeout: 30_000,
  },
})
