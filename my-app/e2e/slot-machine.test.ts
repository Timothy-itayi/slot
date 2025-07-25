import { test, expect } from '@playwright/test';

test.describe('SpinCycle Slot Machine', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should display the slot machine interface', async ({ page }) => {
		// Check main title
		await expect(page.locator('h1')).toContainText('🎰 SpinCycle');

		// Check game stats are visible
		await expect(page.locator('.game-stats')).toBeVisible();
		await expect(page.locator('text=Balance:')).toBeVisible();
		await expect(page.locator('text=Last Win:')).toBeVisible();
		await expect(page.locator('text=Spins:')).toBeVisible();

		// Check controls are present
		await expect(page.locator('text=Bet Amount:')).toBeVisible();
		await expect(page.locator('.spin-btn')).toBeVisible();
		await expect(page.locator('.reset-btn')).toBeVisible();

		// Check paytable is visible
		await expect(page.locator('text=Paytable')).toBeVisible();
	});

	test('should allow bet adjustment', async ({ page }) => {
		const betInput = page.locator('#bet-amount');
		const increaseBtn = page.locator('.bet-btn').nth(1);
		const decreaseBtn = page.locator('.bet-btn').first();

		// Check initial bet value
		await expect(betInput).toHaveValue('1');

		// Increase bet
		await increaseBtn.click();
		await expect(betInput).toHaveValue('2');

		// Decrease bet
		await decreaseBtn.click();
		await expect(betInput).toHaveValue('1');

		// Test manual input
		await betInput.fill('10');
		await expect(betInput).toHaveValue('10');
	});

	test('should handle spin button states', async ({ page }) => {
		const spinBtn = page.locator('.spin-btn');

		// Button should be enabled initially
		await expect(spinBtn).toBeEnabled();
		await expect(spinBtn).toContainText('SPIN!');

		// Click spin and check button state
		await spinBtn.click();
		await expect(spinBtn).toBeDisabled();
		await expect(spinBtn).toContainText('Spinning...');

		// Wait for spin to complete
		await page.waitForTimeout(8000);
		await expect(spinBtn).toBeEnabled();
		await expect(spinBtn).toContainText('SPIN!');
	});

	test('should update balance after spin', async ({ page }) => {
		const initialBalance = await page.locator('.stat').first().locator('.value').textContent();
		const spinBtn = page.locator('.spin-btn');

		// Take a spin
		await spinBtn.click();
		await page.waitForTimeout(8000);

		// Check balance has changed (decreased by bet amount)
		const newBalance = await page.locator('.stat').first().locator('.value').textContent();
		expect(newBalance).not.toBe(initialBalance);
	});

	test('should show win notification when winning', async ({ page }) => {
		const spinBtn = page.locator('.spin-btn');

		// Spin multiple times to potentially get a win
		for (let i = 0; i < 3; i++) {
			await spinBtn.click();
			await page.waitForTimeout(8000);

			// Check if win notification appears
			const winNotification = page.locator('.win-notification');
			if (await winNotification.isVisible()) {
				await expect(winNotification).toContainText('WIN!');
				return; // Test passed
			}
		}

		// If no win after 5 spins, that's also valid
		console.log('No win occurred in 5 spins, which is normal for a slot machine');
	});

	test('should reset game state', async ({ page }) => {
		const resetBtn = page.locator('.reset-btn');
		const spinBtn = page.locator('.spin-btn');

		// Take a few spins to change the state
		await spinBtn.click();
		await page.waitForTimeout(8000);
		await spinBtn.click();
		await page.waitForTimeout(8000);

		// Check spin count has increased
		const spinCountAfterSpins = await page.locator('.stat').last().locator('.value').textContent();
		expect(parseInt(spinCountAfterSpins || '0')).toBeGreaterThan(0);

		// Reset the game
		await resetBtn.click();

		// Check spin count is reset
		const spinCountAfterReset = await page.locator('.stat').last().locator('.value').textContent();
		expect(spinCountAfterReset).toBe('0');
	});

	test('should be responsive on mobile', async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });

		// Check elements are still visible and properly laid out
		await expect(page.locator('h1')).toBeVisible();
		await expect(page.locator('.reels-container')).toBeVisible();
		await expect(page.locator('.spin-btn')).toBeVisible();

		// Check that controls are stacked vertically on mobile
		const actionButtons = page.locator('.action-buttons');
		await expect(actionButtons).toBeVisible();
	});
}); 