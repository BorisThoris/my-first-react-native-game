import { defineConfig, devices } from '@playwright/test';

/** REF-079: fresh browser context per test is Playwright default; block SWs to avoid cross-test cache bleed. */
export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    reporter: 'list',
    use: {
        baseURL: 'http://127.0.0.1:5173',
        serviceWorkers: 'block',
        /** Keeps CI artifacts smaller than `trace: 'on'` while preserving traces for flaky retries. */
        trace: 'retain-on-failure',
        video: 'retain-on-failure'
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: {
        command: 'yarn vite --host 127.0.0.1 --port 5173 --strictPort',
        url: 'http://127.0.0.1:5173',
        reuseExistingServer: !process.env.CI,
        /** Cold caches / busy agents: avoid false failures while Vite prebundles (default 60s is tight). */
        timeout: 180_000
    }
});
