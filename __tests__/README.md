# Testing Documentation

This document provides comprehensive information about the testing setup and implementation for the Next.js Marketing Dashboard migration project.

## Testing Framework Overview

The project uses a comprehensive testing strategy with multiple layers:

- **Unit Tests**: Jest + React Testing Library for components, services, and controllers
- **Integration Tests**: Jest for API routes and database operations
- **Visual Regression Tests**: Playwright for UI consistency verification
- **End-to-End Tests**: Playwright for complete user workflows

## Test Structure

```
__tests__/
├── unit/                           # Unit tests
│   ├── components/                 # React component tests
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── ...
│   ├── controllers/                # Controller logic tests
│   ├── services/                   # Service layer tests
│   └── utils/                      # Utility function tests
├── integration/                    # Integration tests
│   ├── api/                        # API route tests
│   └── database/                   # Database operation tests
├── utils/                          # Test utilities and helpers
│   ├── test-factories.ts           # Mock data factories
│   ├── test-helpers.ts             # Testing utilities
│   └── test-db-seed.ts             # Test database seeding
└── setup.test.ts                   # Basic setup verification

playwright-tests/                   # Playwright E2E and visual tests
├── visual/                         # Visual regression tests
│   ├── dashboard.spec.ts
│   ├── auth.spec.ts
│   └── clients.spec.ts
├── e2e/                           # End-to-end workflow tests
├── auth.setup.ts                  # Authentication setup for tests
├── global-setup.ts                # Global test setup
└── global-teardown.ts             # Global test cleanup
```

## Running Tests

### Jest Tests

```bash
# Run all Jest tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run unit tests only
yarn test:unit

# Run integration tests only
yarn test:integration

# Run tests with coverage report
yarn test:coverage

# Run tests for CI (with coverage)
yarn test:ci
```

### Playwright Tests

```bash
# Run all Playwright tests
yarn test:e2e

# Run Playwright tests with UI
yarn test:e2e:ui

# Run visual regression tests only
yarn test:visual

# Run all tests (Jest + Playwright)
yarn test:all
```

## Test Configuration

### Jest Configuration (`jest.config.js`)

- **Environment**: jsdom for React component testing
- **Setup**: Custom setup file with mocks and utilities
- **Coverage**: 80% threshold for critical paths
- **Module Resolution**: Supports Next.js path mapping
- **Exclusions**: Excludes shadcn/ui components and build artifacts

### Playwright Configuration (`playwright.config.ts`)

- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Base URL**: http://localhost:3000
- **Reporters**: HTML and JSON reports
- **Screenshots**: On failure
- **Video**: On failure
- **Traces**: On retry

## Test Utilities

### Test Factories (`test-factories.ts`)

Provides factory functions for creating mock data:

```typescript
// Create mock user
const user = createMockUser({ email: 'test@example.com' })

// Create mock client
const client = createMockClient({ businessName: 'Test Business' })

// Create mock API response
const response = createMockApiResponse(data, true)
```

### Test Helpers (`test-helpers.ts`)

Provides utility functions for testing:

```typescript
// Render component with providers
renderWithProviders(<Component />, { session: mockSession })

// Mock fetch responses
mockFetch({ success: true, data: mockData })

// Fill form fields
await fillForm(getByLabelText, userEvent, {
  'Email': 'test@example.com',
  'Password': 'password123'
})
```

### Database Seeding (`test-db-seed.ts`)

Provides functions for test database management:

```typescript
// Seed test database with sample data
await seedTestDatabase()

// Clear test database
await clearTestDatabase()
```

## Writing Tests

### Unit Test Example

```typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/MyComponent'
import { renderWithProviders } from '../../utils/test-helpers'

describe('MyComponent', () => {
  it('renders correctly', () => {
    renderWithProviders(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MyComponent />)
    
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Updated Text')).toBeInTheDocument()
  })
})
```

### Integration Test Example

```typescript
import { GET } from '@/app/api/my-endpoint/route'
import { createMockNextRequest } from '../../utils/test-factories'

describe('/api/my-endpoint', () => {
  it('returns data for authenticated user', async () => {
    const request = createMockNextRequest('http://localhost:3000/api/my-endpoint')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
```

### Visual Regression Test Example

```typescript
import { test, expect } from '@playwright/test'

test('dashboard visual regression', async ({ page }) => {
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  
  // Take screenshot and compare
  await expect(page).toHaveScreenshot('dashboard.png', {
    fullPage: true,
  })
})
```

## Mocking Strategy

### Next.js Mocks

- **next/navigation**: Router and navigation hooks
- **next-auth/react**: Authentication hooks and providers
- **next/image**: Image component

### External Service Mocks

- **Prisma**: Database operations
- **OAuth Providers**: Authentication flows
- **External APIs**: Third-party integrations

### Environment Variables

Test-specific environment variables are set in `jest.setup.js`:

```javascript
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
```

## Coverage Requirements

The project maintains high code coverage standards:

- **Statements**: 80% minimum
- **Branches**: 80% minimum
- **Functions**: 80% minimum
- **Lines**: 80% minimum

### Coverage Exclusions

- shadcn/ui components (external library)
- Type definition files (*.d.ts)
- Story files (*.stories.*)
- Build artifacts

## Visual Regression Testing

Visual tests ensure pixel-perfect migration from the original Vite application:

### Test Categories

1. **Layout Tests**: Overall page structure and positioning
2. **Component Tests**: Individual component appearance
3. **Responsive Tests**: Mobile and tablet layouts
4. **State Tests**: Loading, error, and empty states
5. **Interactive Tests**: Hover effects and animations

### Screenshot Management

- Screenshots are stored in `playwright-tests/visual/screenshots/`
- Baseline images are committed to version control
- Failed comparisons generate diff images for review

## Continuous Integration

### GitHub Actions Integration

```yaml
- name: Run Jest Tests
  run: yarn test:ci

- name: Run Playwright Tests
  run: yarn test:e2e

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

### Pre-commit Hooks

```json
{
  "pre-commit": [
    "yarn test:unit",
    "yarn lint"
  ]
}
```

## Debugging Tests

### Jest Debugging

```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Run specific test file
yarn test MyComponent.test.tsx

# Run tests matching pattern
yarn test --testNamePattern="should render"
```

### Playwright Debugging

```bash
# Run tests in headed mode
yarn test:e2e --headed

# Run tests with debug mode
yarn test:e2e --debug

# Generate test code
npx playwright codegen localhost:3000
```

## Performance Testing

### Test Performance Monitoring

- Tests should complete within reasonable time limits
- Long-running tests are identified and optimized
- Parallel execution is used where possible

### Memory Management

- Proper cleanup in test teardown
- Mock cleanup between tests
- Database connection management

## Best Practices

### Test Organization

1. **Descriptive Names**: Use clear, descriptive test names
2. **Single Responsibility**: Each test should verify one behavior
3. **Arrange-Act-Assert**: Follow the AAA pattern
4. **Independent Tests**: Tests should not depend on each other

### Mock Management

1. **Minimal Mocking**: Mock only what's necessary
2. **Realistic Data**: Use realistic mock data
3. **Consistent Mocks**: Maintain consistent mock behavior
4. **Mock Cleanup**: Clear mocks between tests

### Assertion Quality

1. **Specific Assertions**: Use specific, meaningful assertions
2. **Error Messages**: Provide clear error messages
3. **Edge Cases**: Test edge cases and error conditions
4. **Accessibility**: Include accessibility testing

## Troubleshooting

### Common Issues

1. **Module Resolution**: Check path mappings in jest.config.js
2. **Mock Conflicts**: Ensure mocks are properly isolated
3. **Async Issues**: Use proper async/await patterns
4. **Environment Variables**: Verify test environment setup

### Debug Commands

```bash
# Check Jest configuration
yarn jest --showConfig

# List all tests
yarn jest --listTests

# Run tests with verbose output
yarn jest --verbose

# Clear Jest cache
yarn jest --clearCache
```

## Migration Testing Strategy

### Pixel-Perfect Verification

The visual regression tests ensure the migrated Next.js application matches the original Vite application exactly:

1. **Component Comparison**: Each component is visually compared
2. **Layout Verification**: Page layouts are pixel-perfect
3. **Responsive Testing**: All breakpoints are verified
4. **Interactive States**: Hover, focus, and active states match

### Functional Equivalence

Integration tests verify that all functionality works identically:

1. **API Compatibility**: All endpoints return identical responses
2. **Data Flow**: Data processing produces identical results
3. **User Workflows**: Complete user journeys work as expected
4. **Error Handling**: Error states and messages are preserved

This comprehensive testing strategy ensures a successful migration with zero regression in functionality or appearance.