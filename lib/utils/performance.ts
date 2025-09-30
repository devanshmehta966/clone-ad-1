/**
 * Performance monitoring utilities
 */

export interface PerformanceMetrics {
  name: string
  duration: number
  startTime: number
  endTime: number
  metadata?: Record<string, any>
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetrics[] = []
  private static observers: PerformanceObserver[] = []

  /**
   * Start performance measurement
   */
  static startMeasurement(name: string, metadata?: Record<string, any>): () => PerformanceMetrics {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      const metric: PerformanceMetrics = {
        name,
        duration,
        startTime,
        endTime,
        metadata
      }
      
      this.metrics.push(metric)
      
      // Log slow operations in development
      if (process.env.NODE_ENV === 'development' && duration > 1000) {
        console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`, metadata)
      }
      
      return metric
    }
  }

  /**
   * Measure async function execution
   */
  static async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const endMeasurement = this.startMeasurement(name, metadata)
    
    try {
      const result = await fn()
      const metrics = endMeasurement()
      return { result, metrics }
    } catch (error) {
      const metrics = endMeasurement()
      metrics.metadata = { ...metadata, error: error instanceof Error ? error.message : 'Unknown error' }
      throw error
    }
  }

  /**
   * Measure sync function execution
   */
  static measureSync<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): { result: T; metrics: PerformanceMetrics } {
    const endMeasurement = this.startMeasurement(name, metadata)
    
    try {
      const result = fn()
      const metrics = endMeasurement()
      return { result, metrics }
    } catch (error) {
      const metrics = endMeasurement()
      metrics.metadata = { ...metadata, error: error instanceof Error ? error.message : 'Unknown error' }
      throw error
    }
  }

  /**
   * Get all recorded metrics
   */
  static getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  /**
   * Get metrics by name pattern
   */
  static getMetricsByName(pattern: string | RegExp): PerformanceMetrics[] {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
    return this.metrics.filter(metric => regex.test(metric.name))
  }

  /**
   * Get performance summary
   */
  static getSummary(): Record<string, { count: number; avgDuration: number; maxDuration: number; minDuration: number }> {
    const summary: Record<string, { count: number; totalDuration: number; maxDuration: number; minDuration: number }> = {}
    
    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          totalDuration: 0,
          maxDuration: 0,
          minDuration: Infinity
        }
      }
      
      const s = summary[metric.name]
      s.count++
      s.totalDuration += metric.duration
      s.maxDuration = Math.max(s.maxDuration, metric.duration)
      s.minDuration = Math.min(s.minDuration, metric.duration)
    })
    
    // Convert to final format with averages
    return Object.entries(summary).reduce((acc, [name, data]) => {
      acc[name] = {
        count: data.count,
        avgDuration: data.totalDuration / data.count,
        maxDuration: data.maxDuration,
        minDuration: data.minDuration === Infinity ? 0 : data.minDuration
      }
      return acc
    }, {} as Record<string, { count: number; avgDuration: number; maxDuration: number; minDuration: number }>)
  }

  /**
   * Clear all metrics
   */
  static clearMetrics(): void {
    this.metrics = []
  }

  /**
   * Initialize Web Vitals monitoring (client-side only)
   */
  static initWebVitals(): void {
    if (typeof window === 'undefined') return

    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        
        this.metrics.push({
          name: 'LCP',
          duration: lastEntry.startTime,
          startTime: 0,
          endTime: lastEntry.startTime,
          metadata: { 
            element: lastEntry.element?.tagName,
            url: lastEntry.url 
          }
        })
      })
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.push(lcpObserver)
      } catch (e) {
        // LCP not supported
      }

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          this.metrics.push({
            name: 'FID',
            duration: entry.processingStart - entry.startTime,
            startTime: entry.startTime,
            endTime: entry.processingStart,
            metadata: { 
              eventType: entry.name 
            }
          })
        })
      })
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.push(fidObserver)
      } catch (e) {
        // FID not supported
      }

      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        
        this.metrics.push({
          name: 'CLS',
          duration: clsValue,
          startTime: 0,
          endTime: performance.now(),
          metadata: { 
            cumulativeScore: clsValue 
          }
        })
      })
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)
      } catch (e) {
        // CLS not supported
      }
    }
  }

  /**
   * Cleanup observers
   */
  static cleanup(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor() {
  const measureRender = (componentName: string) => {
    return PerformanceMonitor.startMeasurement(`render:${componentName}`)
  }

  const measureEffect = (effectName: string) => {
    return PerformanceMonitor.startMeasurement(`effect:${effectName}`)
  }

  const measureAsync = async <T>(name: string, fn: () => Promise<T>) => {
    return PerformanceMonitor.measureAsync(name, fn)
  }

  return {
    measureRender,
    measureEffect,
    measureAsync,
    getMetrics: PerformanceMonitor.getMetrics,
    getSummary: PerformanceMonitor.getSummary
  }
}

/**
 * Database query performance wrapper
 */
export function withQueryPerformance<T extends any[], R>(
  queryName: string,
  queryFn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const { result } = await PerformanceMonitor.measureAsync(
      `db:${queryName}`,
      () => queryFn(...args),
      { args: args.length }
    )
    return result
  }
}

/**
 * API route performance wrapper
 */
export function withAPIPerformance<T>(
  routeName: string,
  handler: () => Promise<T>
): Promise<T> {
  return PerformanceMonitor.measureAsync(`api:${routeName}`, handler).then(({ result }) => result)
}