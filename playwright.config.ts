import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	outputDir: './e2e/.results',
	timeout: 30_000,
	expect: { timeout: 8_000 },
	fullyParallel: false,
	workers: 1,
	forbidOnly: Boolean(process.env.CI),
	retries: 0,
	reporter: 'list',
	use: {
		baseURL: 'http://127.0.0.1:4322',
		headless: true,
		reducedMotion: 'reduce',
		serviceWorkers: 'block',
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
	},
	projects: [
		{
			name: 'desktop-chromium',
			testMatch: /desktop\.spec\.ts/,
			use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } },
		},
		{
			name: 'mobile-chromium',
			testMatch: /mobile\.spec\.ts/,
			use: { ...devices['Pixel 7'] },
		},
	],
	webServer: {
		command: 'npm run preview -- --host 127.0.0.1 --port 4322',
		url: 'http://127.0.0.1:4322',
		reuseExistingServer: false,
		timeout: 30_000,
	},
});
