import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const baseURL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      // Sengaja Desktop Chrome dengan viewport ponsel, bukan devices['Pixel 5']:
      // yang diuji di sini layout breakpoint, dan emulasi sentuh menghilangkan
      // event keyboard yang justru jadi inti tes chrome.spec.ts.
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
