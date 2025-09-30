import { test, expect } from '@playwright/test'

test.describe('Clients Page Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to clients page
    await page.goto('/clients')
    await page.waitForLoadState('networkidle')
  })

  test('clients page layout', async ({ page }) => {
    // Verify main elements are visible
    await expect(page.locator('[data-testid="clients-header"]')).toBeVisible()
    await expect(page.locator('[data-testid="clients-table"]')).toBeVisible()
    await expect(page.locator('[data-testid="add-client-button"]')).toBeVisible()
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('clients-page.png', {
      fullPage: true,
    })
  })

  test('clients table with data', async ({ page }) => {
    const table = page.locator('[data-testid="clients-table"]')
    await expect(table).toBeVisible()
    
    // Wait for data to load
    await expect(page.locator('[data-testid="client-row"]').first()).toBeVisible()
    
    // Screenshot table
    await expect(table).toHaveScreenshot('clients-table.png')
  })

  test('add client modal', async ({ page }) => {
    // Open add client modal
    await page.click('[data-testid="add-client-button"]')
    
    // Wait for modal to appear
    await expect(page.locator('[data-testid="add-client-modal"]')).toBeVisible()
    
    // Screenshot modal
    await expect(page.locator('[data-testid="add-client-modal"]')).toHaveScreenshot('add-client-modal.png')
  })

  test('client form validation', async ({ page }) => {
    // Open add client modal
    await page.click('[data-testid="add-client-button"]')
    await expect(page.locator('[data-testid="add-client-modal"]')).toBeVisible()
    
    // Try to submit empty form
    await page.click('[data-testid="submit-client-form"]')
    
    // Wait for validation errors
    await page.waitForTimeout(500)
    
    // Screenshot with validation errors
    await expect(page.locator('[data-testid="add-client-modal"]')).toHaveScreenshot('client-form-validation.png')
  })

  test('client card view', async ({ page }) => {
    // Switch to card view if available
    const cardViewButton = page.locator('[data-testid="card-view-button"]')
    if (await cardViewButton.isVisible()) {
      await cardViewButton.click()
      await page.waitForTimeout(1000)
      
      // Screenshot card view
      await expect(page.locator('[data-testid="clients-grid"]')).toHaveScreenshot('clients-card-view.png')
    }
  })

  test('client search and filters', async ({ page }) => {
    // Use search
    await page.fill('[data-testid="client-search"]', 'test client')
    await page.waitForTimeout(1000)
    
    // Apply status filter
    await page.click('[data-testid="status-filter"]')
    await page.click('[data-testid="status-active"]')
    await page.waitForTimeout(1000)
    
    // Screenshot filtered results
    await expect(page).toHaveScreenshot('clients-filtered.png', {
      fullPage: true,
    })
  })

  test('client details view', async ({ page }) => {
    // Click on first client
    await page.click('[data-testid="client-row"]')
    
    // Wait for details view
    await expect(page.locator('[data-testid="client-details"]')).toBeVisible()
    
    // Screenshot details view
    await expect(page.locator('[data-testid="client-details"]')).toHaveScreenshot('client-details.png')
  })

  test('clients page mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Wait for responsive layout
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('clients-mobile.png', {
      fullPage: true,
    })
  })

  test('pagination controls', async ({ page }) => {
    // Scroll to pagination
    await page.locator('[data-testid="pagination"]').scrollIntoViewIfNeeded()
    
    // Screenshot pagination
    await expect(page.locator('[data-testid="pagination"]')).toHaveScreenshot('clients-pagination.png')
  })

  test('empty state', async ({ page }) => {
    // Mock empty response
    await page.route('/api/clients*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            clients: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
        }),
      })
    })
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Screenshot empty state
    await expect(page.locator('[data-testid="clients-empty-state"]')).toBeVisible()
    await expect(page).toHaveScreenshot('clients-empty-state.png')
  })
})