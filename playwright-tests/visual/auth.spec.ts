import { test, expect } from '@playwright/test'

test.describe('Authentication Pages Visual Regression', () => {
  test('signin page layout', async ({ page }) => {
    await page.goto('/signin')
    await page.waitForLoadState('networkidle')
    
    // Verify form elements are visible
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    
    // Take screenshot
    await expect(page).toHaveScreenshot('signin-page.png', {
      fullPage: true,
    })
  })

  test('signup page layout', async ({ page }) => {
    await page.goto('/signup')
    await page.waitForLoadState('networkidle')
    
    // Verify form elements are visible
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    
    // Take screenshot
    await expect(page).toHaveScreenshot('signup-page.png', {
      fullPage: true,
    })
  })

  test('signin form validation states', async ({ page }) => {
    await page.goto('/signin')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Wait for validation errors
    await page.waitForTimeout(500)
    
    // Screenshot with validation errors
    await expect(page).toHaveScreenshot('signin-validation-errors.png')
  })

  test('signup form validation states', async ({ page }) => {
    await page.goto('/signup')
    
    // Fill invalid data
    await page.fill('input[name="email"]', 'invalid-email')
    await page.fill('input[name="password"]', '123') // Too short
    await page.click('button[type="submit"]')
    
    // Wait for validation errors
    await page.waitForTimeout(500)
    
    // Screenshot with validation errors
    await expect(page).toHaveScreenshot('signup-validation-errors.png')
  })

  test('oauth buttons layout', async ({ page }) => {
    await page.goto('/signin')
    
    // Verify OAuth buttons are visible
    await expect(page.locator('[data-testid="google-signin"]')).toBeVisible()
    await expect(page.locator('[data-testid="facebook-signin"]')).toBeVisible()
    await expect(page.locator('[data-testid="linkedin-signin"]')).toBeVisible()
    
    // Screenshot OAuth section
    const oauthSection = page.locator('[data-testid="oauth-buttons"]')
    await expect(oauthSection).toHaveScreenshot('oauth-buttons.png')
  })

  test('auth pages mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Test signin mobile
    await page.goto('/signin')
    await page.waitForTimeout(1000)
    await expect(page).toHaveScreenshot('signin-mobile.png', {
      fullPage: true,
    })
    
    // Test signup mobile
    await page.goto('/signup')
    await page.waitForTimeout(1000)
    await expect(page).toHaveScreenshot('signup-mobile.png', {
      fullPage: true,
    })
  })

  test('loading states during authentication', async ({ page }) => {
    await page.goto('/signin')
    
    // Intercept auth request to simulate loading
    await page.route('/api/auth/signin', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.continue()
    })
    
    // Fill form and submit
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Screenshot loading state
    await expect(page.locator('[data-testid="signin-loading"]')).toBeVisible()
    await expect(page).toHaveScreenshot('signin-loading.png')
  })
})