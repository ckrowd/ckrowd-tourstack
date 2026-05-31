import { expect, test } from "@playwright/test";

const PROMOTER = { email: "demo.promoter@ctaas.com", password: "Promoter1234!" };

test.describe("public pages", () => {
	test("landing renders", async ({ page }) => {
		await page.goto("/en");
		await expect(page).toHaveTitle(/Tourstack|Ckrowd/i);
		await expect(page.locator("body")).toBeVisible();
	});

	test("join landing shows the three onboarding paths", async ({ page }) => {
		await page.goto("/en/join");
		// Self-serve CTAs link to /onboard/<category> for each role.
		await expect(
			page.locator('a[href$="/onboard/service"]').first(),
		).toBeVisible();
		await expect(
			page.locator('a[href$="/onboard/workforce"]').first(),
		).toBeVisible();
		await expect(
			page.locator('a[href$="/onboard/artmgmt"]').first(),
		).toBeVisible();
	});

	test("self-serve onboarding form renders", async ({ page }) => {
		await page.goto("/en/onboard/service");
		await expect(page.locator("form")).toBeVisible();
		await expect(page.locator('input[type="email"]')).toBeVisible();
	});
});

test.describe("auth gating", () => {
	test("dashboard redirects unauthenticated users to login", async ({
		page,
	}) => {
		await page.goto("/en/dashboard");
		await expect(page).toHaveURL(/\/en\/login/);
	});

	test("admin redirects unauthenticated users to admin login", async ({
		page,
	}) => {
		await page.goto("/en/admin");
		await expect(page).toHaveURL(/\/en\/admin\/login/);
	});
});

test.describe("login flow", () => {
	test("promoter can sign in and reach the dashboard", async ({ page }) => {
		await page.goto("/en/login");
		await page.locator('input[type="email"]').fill(PROMOTER.email);
		await page.locator('input[type="password"]').fill(PROMOTER.password);
		await page.locator('button[type="submit"]').click();
		await expect(page).toHaveURL(/\/en\/(dashboard|onboarding)/, {
			timeout: 20_000,
		});
	});
});
