import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  try {
    // Add any global cleanup here, such as:
    // - Database cleanup
    // - File cleanup
    // - Service shutdown
    
    console.log('Global teardown completed')
  } catch (error) {
    console.error('Global teardown failed:', error)
  }
}

export default globalTeardown