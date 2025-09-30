import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { SessionProvider } from 'next-auth/react'
import { createMockSession } from './test-factories'

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: any
}

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { session = createMockSession(), ...renderOptions } = options

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock fetch responses
export const mockFetch = (response: any, ok = true) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      status: ok ? 200 : 400,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    })
  ) as jest.Mock
}

// Wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock console methods
export const mockConsole = () => {
  const originalConsole = { ...console }
  
  beforeEach(() => {
    console.log = jest.fn()
    console.error = jest.fn()
    console.warn = jest.fn()
    console.info = jest.fn()
  })

  afterEach(() => {
    Object.assign(console, originalConsole)
  })

  return {
    log: () => console.log as jest.Mock,
    error: () => console.error as jest.Mock,
    warn: () => console.warn as jest.Mock,
    info: () => console.info as jest.Mock,
  }
}

// Database test helpers
export const clearDatabase = async () => {
  // This would be used in integration tests with a test database
  // Implementation depends on your test database setup
}

export const seedTestData = async () => {
  // This would seed the test database with initial data
  // Implementation depends on your test database setup
}

// API test helpers
export const createApiTestContext = () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    client: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    campaign: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    analyticsData: {
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
    },
    oAuthIntegration: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    report: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
    $disconnect: jest.fn(),
  }

  return { mockPrisma }
}

// Form testing helpers
export const fillForm = async (
  getByLabelText: any,
  userEvent: any,
  formData: Record<string, string>
) => {
  for (const [label, value] of Object.entries(formData)) {
    const input = getByLabelText(label)
    await userEvent.clear(input)
    await userEvent.type(input, value)
  }
}

// Error boundary testing
export const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Mock environment variables for tests
export const mockEnvVars = (vars: Record<string, string>) => {
  const originalEnv = process.env
  
  beforeEach(() => {
    process.env = { ...originalEnv, ...vars }
  })

  afterEach(() => {
    process.env = originalEnv
  })
}