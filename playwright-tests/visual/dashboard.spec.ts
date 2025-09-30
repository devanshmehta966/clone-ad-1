import { test, expect } from '@playwright/test'

test.describe('Dashboard Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('dashboard page layout', async ({ page }) => {
    // Wait for all components to load
    await expect(page.locator('[data-testid="dashboard-metrics"]')).toBeVisible()
    await expect(page.locator('[data-testid="performance-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible()
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('dashboard-full-page.png', {
      fullPage: true,
    })
  })

  test('dashboard metrics cards', async ({ page }) => {
    const metricsContainer = page.locator('[data-testid="dashboard-metrics"]')
    await expect(metricsContainer).toBeVisible()
    
    // Screenshot of metrics section only
    await expect(metricsContainer).toHaveScreenshot('dashboard-metrics.png')
  })

  test('performance chart component', async ({ page }) => {
    const chartContainer = page.locator('[data-testid="performance-chart"]')
    await expect(chartContainer).toBeVisible()
    
    // Wait for chart to render
    await page.waitForTimeout(2000)
    
    await expect(chartContainer).toHaveScreenshot('performance-chart.png')
  })

  test('revenue chart component', async ({ page }) => {
    const chartContainer = page.locator('[data-testid="revenue-chart"]')
    await expect(chartContainer).toBeVisible()
    
    // Wait for chart to render
    await page.waitForTimeout(2000)
    
    await expect(chartContainer).toHaveScreenshot('revenue-chart.png')
  })

  test('top performers section', async ({ page }) => {
    const topPerformersContainer = page.locator('[data-testid="top-performers"]')
    await expect(topPerformersContainer).toBeVisible()
    
    await expect(topPerformersContainer).toHaveScreenshot('top-performers.png')
  })

  test('dashboard responsive mobile view', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Wait for responsive layout
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('dashboard-mobile.png', {
      fullPage: true,
    })
  })

  test('dashboard responsive tablet view', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    
    // Wait for responsive layout
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('dashboard-tablet.png', {
      fullPage: true,
    })
  })

  test('dashboard with date filter applied', async ({ page }) => {
    // Apply date filter
    await page.click('[data-testid="date-filter-button"]')
    await page.click('[data-testid="date-filter-last-7-days"]')
    
    // Wait for data to update
    await page.waitForTimeout(2000)
    
    await expect(page).toHaveScreenshot('dashboard-filtered.png', {
      fullPage: true,
    })
  })

  test('dashboard loading states', async ({ page }) => {
    // Intercept API calls to simulate loading
    await page.route('/api/dashboard/metrics', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.continue()
    })
    
    // Navigate and capture loading state
    await page.goto('/dashboard')
    
    // Screenshot loading state
    await expect(page.locator('[data-testid="dashboard-loading"]')).toBeVisible()
    await expect(page).toHaveScreenshot('dashboard-loading.png')
  })
})