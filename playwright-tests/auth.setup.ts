import { test as setup, expect } from '@playwright/test'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/signin')
  
  // Fill in login form
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  
  // Click login button
  await page.click('button[type="submit"]')
  
  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard')
  
  // Verify we're logged in
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  
  // Save authentication state
  await page.context().storageState({ path: authFile })
})