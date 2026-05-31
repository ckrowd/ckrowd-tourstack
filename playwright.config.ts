import { defineConfig, devices } from "@playwright/test";

// Smoke E2E. Requires the backend running on :3001 (see ckrowd-prisma
// docker-compose.local.yml + .env.local.example). Playwright starts the
// frontend itself and points it at the local backend.
const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const API_URL = process.env.E2E_API_URL ?? "http://localhost:3001";

export default defineConfig({
	testDir: "./e2e",
	// Generous timeouts: the Next dev server compiles each route on first visit.
	timeout: 90_000,
	expect: { timeout: 15_000 },
	// Serial so routes compile one at a time (later visits are then fast).
	fullyParallel: false,
	workers: 1,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? "github" : "list",
	use: {
		baseURL: BASE_URL,
		trace: "on-first-retry",
		navigationTimeout: 60_000,
		actionTimeout: 15_000,
	},
	projects: [
		{ name: "chromium", use: { ...devices["Desktop Chrome"] } },
	],
	webServer: {
		command: "bun run dev",
		url: BASE_URL,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
		env: { API_URL, NEXT_PUBLIC_API_URL: API_URL },
	},
});
