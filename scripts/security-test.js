#!/usr/bin/env node

/**
 * Security Testing Script
 * Tests various security measures implemented in the application
 */

const https = require('https')
const http = require('http')
const { URL } = require('url')

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'
const TEST_EMAIL = 'test@example.com'
const TEST_PASSWORD = 'testpassword123'

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const isHttps = urlObj.protocol === 'https:'
    const client = isHttps ? https : http
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Security-Test-Script/1.0',
        ...options.headers
      }
    }

    const req = client.request(requestOptions, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        })
      })
    })

    req.on('error', reject)
    
    if (options.body) {
      req.write(options.body)
    }
    
    req.end()
  })
}

// Test security headers
async function testSecurityHeaders() {
  log('\n🔒 Testing Security Headers...', 'blue')
  
  try {
    const response = await makeRequest(BASE_URL)
    const headers = response.headers
    
    const securityHeaders = {
      'x-frame-options': 'DENY',
      'x-content-type-options': 'nosniff',
      'x-xss-protection': '1; mode=block',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'content-security-policy': true // Just check if present
    }
    
    let passed = 0
    let total = Object.keys(securityHeaders).length
    
    for (const [header, expectedValue] of Object.entries(securityHeaders)) {
      const actualValue = headers[header]
      
      if (actualValue) {
        if (expectedValue === true || actualValue.includes(expectedValue)) {
          log(`  ✅ ${header}: ${actualValue}`, 'green')
          passed++
        } else {
          log(`  ❌ ${header}: Expected "${expectedValue}", got "${actualValue}"`, 'red')
        }
      } else {
        log(`  ❌ ${header}: Missing`, 'red')
      }
    }
    
    log(`\nSecurity Headers: ${passed}/${total} passed`, passed === total ? 'green' : 'yellow')
    
  } catch (error) {
    log(`❌ Error testing security headers: ${error.message}`, 'red')
  }
}

// Test rate limiting
async function testRateLimit() {
  log('\n⏱️  Testing Rate Limiting...', 'blue')
  
  try {
    const requests = []
    const maxRequests = 10
    
    // Make multiple rapid requests
    for (let i = 0; i < maxRequests; i++) {
      requests.push(makeRequest(`${BASE_URL}/api/dashboard/metrics`))
    }
    
    const responses = await Promise.allSettled(requests)
    const rateLimited = responses.some(r => 
      r.status === 'fulfilled' && r.value.statusCode === 429
    )
    
    if (rateLimited) {
      log('  ✅ Rate limiting is working', 'green')
    } else {
      log('  ⚠️  Rate limiting may not be configured properly', 'yellow')
    }
    
  } catch (error) {
    log(`❌ Error testing rate limiting: ${error.message}`, 'red')
  }
}

// Test authentication endpoints
async function testAuthSecurity() {
  log('\n🔐 Testing Authentication Security...', 'blue')
  
  try {
    // Test login rate limiting
    log('  Testing login rate limiting...')
    const loginRequests = []
    
    for (let i = 0; i < 6; i++) {
      loginRequests.push(
        makeRequest(`${BASE_URL}/api/auth/callback/credentials`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: TEST_EMAIL,
            password: 'wrongpassword'
          })
        })
      )
    }
    
    const loginResponses = await Promise.allSettled(loginRequests)
    const rateLimitedLogin = loginResponses.some(r => 
      r.status === 'fulfilled' && r.value.statusCode === 429
    )
    
    if (rateLimitedLogin) {
      log('    ✅ Login rate limiting is working', 'green')
    } else {
      log('    ⚠️  Login rate limiting may not be configured', 'yellow')
    }
    
    // Test protected routes without authentication
    log('  Testing protected route access...')
    const protectedResponse = await makeRequest(`${BASE_URL}/api/dashboard/metrics`)
    
    if (protectedResponse.statusCode === 401) {
      log('    ✅ Protected routes require authentication', 'green')
    } else {
      log('    ❌ Protected routes may be accessible without auth', 'red')
    }
    
  } catch (error) {
    log(`❌ Error testing authentication security: ${error.message}`, 'red')
  }
}

// Test input validation
async function testInputValidation() {
  log('\n🛡️  Testing Input Validation...', 'blue')
  
  const maliciousInputs = [
    '<script>alert("xss")</script>',
    'javascript:alert("xss")',
    '../../etc/passwd',
    'SELECT * FROM users',
    '${7*7}',
    '{{7*7}}',
    'A'.repeat(10000) // Very long string
  ]
  
  try {
    for (const input of maliciousInputs) {
      const response = await makeRequest(`${BASE_URL}/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessName: input,
          businessEmail: 'test@example.com'
        })
      })
      
      // Should return 400 (validation error) or 401 (unauthorized)
      if (response.statusCode === 400 || response.statusCode === 401) {
        log(`  ✅ Input "${input.substring(0, 20)}..." properly rejected`, 'green')
      } else {
        log(`  ❌ Input "${input.substring(0, 20)}..." may not be properly validated`, 'red')
      }
    }
    
  } catch (error) {
    log(`❌ Error testing input validation: ${error.message}`, 'red')
  }
}

// Test CORS configuration
async function testCORS() {
  log('\n🌐 Testing CORS Configuration...', 'blue')
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/dashboard/metrics`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://malicious-site.com',
        'Access-Control-Request-Method': 'POST'
      }
    })
    
    const corsHeader = response.headers['access-control-allow-origin']
    
    if (!corsHeader || corsHeader === 'https://malicious-site.com') {
      log('  ❌ CORS may allow unauthorized origins', 'red')
    } else {
      log('  ✅ CORS properly configured', 'green')
    }
    
  } catch (error) {
    log(`❌ Error testing CORS: ${error.message}`, 'red')
  }
}

// Test cookie security
async function testCookieSecurity() {
  log('\n🍪 Testing Cookie Security...', 'blue')
  
  try {
    const response = await makeRequest(BASE_URL)
    const setCookieHeaders = response.headers['set-cookie'] || []
    
    let secureCount = 0
    let httpOnlyCount = 0
    let sameSiteCount = 0
    
    setCookieHeaders.forEach(cookie => {
      if (cookie.includes('Secure')) secureCount++
      if (cookie.includes('HttpOnly')) httpOnlyCount++
      if (cookie.includes('SameSite')) sameSiteCount++
    })
    
    if (setCookieHeaders.length > 0) {
      log(`  Cookies found: ${setCookieHeaders.length}`)
      log(`  Secure: ${secureCount}/${setCookieHeaders.length}`)
      log(`  HttpOnly: ${httpOnlyCount}/${setCookieHeaders.length}`)
      log(`  SameSite: ${sameSiteCount}/${setCookieHeaders.length}`)
      
      if (secureCount === setCookieHeaders.length && 
          httpOnlyCount === setCookieHeaders.length && 
          sameSiteCount === setCookieHeaders.length) {
        log('  ✅ All cookies properly secured', 'green')
      } else {
        log('  ⚠️  Some cookies may not be properly secured', 'yellow')
      }
    } else {
      log('  ℹ️  No cookies set on main page', 'blue')
    }
    
  } catch (error) {
    log(`❌ Error testing cookie security: ${error.message}`, 'red')
  }
}

// Test environment variable validation
async function testEnvironmentValidation() {
  log('\n🔧 Testing Environment Configuration...', 'blue')
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'ENCRYPTION_KEY'
  ]
  
  let missingVars = []
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  })
  
  if (missingVars.length === 0) {
    log('  ✅ All required environment variables are set', 'green')
  } else {
    log(`  ❌ Missing environment variables: ${missingVars.join(', ')}`, 'red')
  }
  
  // Check secret lengths
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    log('  ⚠️  NEXTAUTH_SECRET should be at least 32 characters', 'yellow')
  }
  
  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length < 32) {
    log('  ⚠️  ENCRYPTION_KEY should be at least 32 characters', 'yellow')
  }
}

// Main test runner
async function runSecurityTests() {
  log('🔍 Starting Security Tests...', 'blue')
  log(`Testing URL: ${BASE_URL}`)
  
  await testEnvironmentValidation()
  await testSecurityHeaders()
  await testRateLimit()
  await testAuthSecurity()
  await testInputValidation()
  await testCORS()
  await testCookieSecurity()
  
  log('\n✅ Security tests completed!', 'green')
  log('\nNote: Some tests may show warnings in development mode.', 'yellow')
  log('Ensure all security measures are properly configured for production.', 'yellow')
}

// Run tests if called directly
if (require.main === module) {
  runSecurityTests().catch(error => {
    log(`❌ Test runner error: ${error.message}`, 'red')
    process.exit(1)
  })
}

module.exports = {
  runSecurityTests,
  testSecurityHeaders,
  testRateLimit,
  testAuthSecurity,
  testInputValidation,
  testCORS,
  testCookieSecurity
}