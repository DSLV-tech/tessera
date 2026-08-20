import { defineConfig, devices } from '@playwright/test';

/**
 * I test girano contro la build statica, non contro il dev server: è quello che
 * finisce davvero in produzione, service worker e asset con hash compresi.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: process.env.CI !== undefined,
  retries: process.env.CI !== undefined ? 2 : 0,
  reporter: process.env.CI !== undefined ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    // In CI si usa il Chromium scaricato da Playwright. In ambienti dove il
    // browser è già presente sul sistema, basta esportare CHROMIUM_PATH.
    ...(process.env.CHROMIUM_PATH !== undefined
      ? { launchOptions: { executablePath: process.env.CHROMIUM_PATH } }
      : {}),
  },
  projects: [{ name: 'mobile-chrome', use: { ...devices['Pixel 7'] } }],
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: process.env.CI === undefined,
    timeout: 60_000,
  },
});
