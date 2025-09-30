#!/usr/bin/env node

/**
 * Performance testing script for the NextJS Marketing Dashboard
 */

const { performance } = require('perf_hooks')
const fetch = require('node-fetch')

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const TEST_ITERATIONS = 10
const CONCURRENT_REQUESTS = 5

// Test endpoints
const ENDPOINTS = [
  { path: '/api/health', name: 'Health Check' },
  { path: '/api/dashboard/metrics', name: 'Dashboard Metrics', requiresAuth: true },
  { path: '/api/clients/paginated?page=1&limit=20', name: 'Paginated Clients', requiresAuth: true },
  { path: '/api/dashboard/alerts', name: 'Dashboard Alerts', requiresAuth: true },
  { path: '/api/integrations/health', name: 'Integration Health', requiresAuth: true }
]

// Mock authentication token (in real scenario, this would be obtained through login)
const AUTH_TOKEN = process.env.TEST_AUTH_TOKEN

class PerformanceTester {
  constructor() {
    this.results = []
  }

  async measureRequest(url, options = {}) {
    const startTime = performance.now()
    
    try {
      const response = await fetch(url, {
        ...options,
        timeout: 10000 // 10 second timeout
      })
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      return {
        success: true,
        status: response.status,
        duration,
        size: parseInt(response.headers.get('content-length') || '0'),
        cached: response.headers.get('cache-control') ? true : false
      }
    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      return {
        success: false,
        error: error.message,
        duration
      }
    }
  }

  async testEndpoint(endpoint) {
    console.log(`\n🧪 Testing ${endpoint.name} (${endpoint.path})`)
    
    const options = {}
    if (endpoint.requiresAuth && AUTH_TOKEN) {
      options.headers = {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }

    const results = []
    
    // Sequential tests
    console.log('  📊 Sequential requests...')
    for (let i = 0; i < TEST_ITERATIONS; i++) {
      const result = await this.measureRequest(`${BASE_URL}${endpoint.path}`, options)
      results.push(result)
      
      if (result.success) {
        process.stdout.write(`✓`)
      } else {
        process.stdout.write(`✗`)
      }
    }
    
    console.log('\n  ⚡ Concurrent requests...')
    
    // Concurrent tests
    const concurrentPromises = Array.from({ length: CONCURRENT_REQUESTS }, () =>
      this.measureRequest(`${BASE_URL}${endpoint.path}`, options)
    )
    
    const concurrentResults = await Promise.all(concurrentPromises)
    results.push(...concurrentResults)
    
    concurrentResults.forEach(result => {
      if (result.success) {
        process.stdout.write(`✓`)
      } else {
        process.stdout.write(`✗`)
      }
    })

    // Calculate statistics
    const successfulResults = results.filter(r => r.success)
    const failedResults = results.filter(r => !r.success)
    
    if (successfulResults.length === 0) {
      console.log('\n  ❌ All requests failed')
      return {
        endpoint: endpoint.name,
        success: false,
        totalRequests: results.length,
        failedRequests: failedResults.length
      }
    }

    const durations = successfulResults.map(r => r.duration)
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
    const minDuration = Math.min(...durations)
    const maxDuration = Math.max(...durations)
    const p95Duration = durations.sort((a, b) => a - b)[Math.floor(durations.length * 0.95)]
    
    const stats = {
      endpoint: endpoint.name,
      path: endpoint.path,
      success: true,
      totalRequests: results.length,
      successfulRequests: successfulResults.length,
      failedRequests: failedResults.length,
      avgDuration: Math.round(avgDuration),
      minDuration: Math.round(minDuration),
      maxDuration: Math.round(maxDuration),
      p95Duration: Math.round(p95Duration),
      avgSize: Math.round(successfulResults.reduce((a, b) => a + (b.size || 0), 0) / successfulResults.length),
      cacheHitRate: successfulResults.filter(r => r.cached).length / successfulResults.length
    }

    console.log(`\n  📈 Results:`)
    console.log(`     Average: ${stats.avgDuration}ms`)
    console.log(`     Min: ${stats.minDuration}ms`)
    console.log(`     Max: ${stats.maxDuration}ms`)
    console.log(`     P95: ${stats.p95Duration}ms`)
    console.log(`     Success Rate: ${(stats.successfulRequests / stats.totalRequests * 100).toFixed(1)}%`)
    console.log(`     Average Size: ${stats.avgSize} bytes`)
    console.log(`     Cache Hit Rate: ${(stats.cacheHitRate * 100).toFixed(1)}%`)

    return stats
  }

  async runAllTests() {
    console.log('🚀 Starting Performance Tests')
    console.log(`📍 Base URL: ${BASE_URL}`)
    console.log(`🔄 Iterations: ${TEST_ITERATIONS} sequential + ${CONCURRENT_REQUESTS} concurrent`)
    console.log(`🔐 Auth Token: ${AUTH_TOKEN ? 'Provided' : 'Not provided (some tests may fail)'}`)

    const allResults = []

    for (const endpoint of ENDPOINTS) {
      if (endpoint.requiresAuth && !AUTH_TOKEN) {
        console.log(`\n⚠️  Skipping ${endpoint.name} (requires authentication)`)
        continue
      }

      const result = await this.testEndpoint(endpoint)
      allResults.push(result)
      
      // Wait between tests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    this.generateReport(allResults)
  }

  generateReport(results) {
    console.log('\n' + '='.repeat(80))
    console.log('📊 PERFORMANCE REPORT')
    console.log('='.repeat(80))

    const successfulTests = results.filter(r => r.success)
    const failedTests = results.filter(r => !r.success)

    console.log(`\n📈 Summary:`)
    console.log(`   Total Endpoints Tested: ${results.length}`)
    console.log(`   Successful: ${successfulTests.length}`)
    console.log(`   Failed: ${failedTests.length}`)

    if (successfulTests.length > 0) {
      console.log(`\n⚡ Performance Metrics:`)
      
      const table = successfulTests.map(result => ({
        'Endpoint': result.endpoint,
        'Avg (ms)': result.avgDuration,
        'Min (ms)': result.minDuration,
        'Max (ms)': result.maxDuration,
        'P95 (ms)': result.p95Duration,
        'Success %': ((result.successfulRequests / result.totalRequests) * 100).toFixed(1),
        'Cache %': (result.cacheHitRate * 100).toFixed(1)
      }))

      console.table(table)

      // Performance recommendations
      console.log(`\n💡 Recommendations:`)
      
      successfulTests.forEach(result => {
        if (result.avgDuration > 1000) {
          console.log(`   ⚠️  ${result.endpoint}: Average response time (${result.avgDuration}ms) is slow. Consider optimization.`)
        }
        
        if (result.p95Duration > 2000) {
          console.log(`   ⚠️  ${result.endpoint}: P95 response time (${result.p95Duration}ms) indicates performance issues.`)
        }
        
        if (result.cacheHitRate < 0.5 && result.endpoint.includes('Dashboard')) {
          console.log(`   💾 ${result.endpoint}: Low cache hit rate (${(result.cacheHitRate * 100).toFixed(1)}%). Consider improving caching.`)
        }
        
        if (result.successfulRequests / result.totalRequests < 0.95) {
          console.log(`   🔴 ${result.endpoint}: Low success rate (${((result.successfulRequests / result.totalRequests) * 100).toFixed(1)}%). Check for errors.`)
        }
      })

      // Overall performance grade
      const avgResponseTime = successfulTests.reduce((sum, r) => sum + r.avgDuration, 0) / successfulTests.length
      const overallSuccessRate = successfulTests.reduce((sum, r) => sum + (r.successfulRequests / r.totalRequests), 0) / successfulTests.length

      let grade = 'A'
      if (avgResponseTime > 500 || overallSuccessRate < 0.98) grade = 'B'
      if (avgResponseTime > 1000 || overallSuccessRate < 0.95) grade = 'C'
      if (avgResponseTime > 2000 || overallSuccessRate < 0.90) grade = 'D'
      if (avgResponseTime > 5000 || overallSuccessRate < 0.80) grade = 'F'

      console.log(`\n🎯 Overall Performance Grade: ${grade}`)
      console.log(`   Average Response Time: ${Math.round(avgResponseTime)}ms`)
      console.log(`   Overall Success Rate: ${(overallSuccessRate * 100).toFixed(1)}%`)
    }

    if (failedTests.length > 0) {
      console.log(`\n❌ Failed Tests:`)
      failedTests.forEach(result => {
        console.log(`   - ${result.endpoint}: ${result.failedRequests}/${result.totalRequests} requests failed`)
      })
    }

    console.log('\n' + '='.repeat(80))
  }
}

// Run the tests
async function main() {
  const tester = new PerformanceTester()
  
  try {
    await tester.runAllTests()
  } catch (error) {
    console.error('❌ Performance test failed:', error.message)
    process.exit(1)
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Performance Testing Script

Usage: node scripts/test-performance.js [options]

Environment Variables:
  BASE_URL          Base URL for testing (default: http://localhost:3000)
  TEST_AUTH_TOKEN   Authentication token for protected endpoints

Options:
  --help, -h        Show this help message

Example:
  BASE_URL=http://localhost:3000 node scripts/test-performance.js
  `)
  process.exit(0)
}

if (require.main === module) {
  main()
}

module.exports = { PerformanceTester }