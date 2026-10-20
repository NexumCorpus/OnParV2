import { defineConfig, devices } from '@playwright/test'

// Traces and the HTML report record typed values (including the sign-in
// password), and CI uploads the report as an artifact. A run that has
// credentials therefore records no traces and writes no HTML report.
const hasCredentials = !!(process.env.E2E_EMAIL && process.env.E2E_PASSWORD)

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // 'list' prints every result (and every skip) to the console.
  reporter: hasCredentials ? [['list']] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: hasCredentials ? 'off' : 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
