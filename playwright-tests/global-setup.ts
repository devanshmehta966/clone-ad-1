import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use
  
  // Launch browser for setup
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Wait for the application to be ready
    await page.goto(baseURL!)
    await page.waitForLoadState('networkidle')
    
    // You can add any global setup here, such as:
    // - Database seeding
    // - Authentication setup
    // - Environment preparation
    
    console.log('Global setup completed')
  } catch (error) {
    console.error('Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup