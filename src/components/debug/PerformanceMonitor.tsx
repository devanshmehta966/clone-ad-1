"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PerformanceMonitor } from '../../../lib/utils/performance'
import { Activity, Clock, Zap, AlertTriangle } from 'lucide-react'

interface PerformanceMetrics {
    name: string
    duration: number
    startTime: number
    endTime: number
    metadata?: Record<string, any>
}

export function PerformanceDebugPanel() {
    const [metrics, setMetrics] = useState<PerformanceMetrics[]>([])
    const [isVisible, setIsVisible] = useState(false)
    const [summary, setSummary] = useState<Record<string, any>>({})

    useEffect(() => {
        // Initialize Web Vitals monitoring
        PerformanceMonitor.initWebVitals()

        // Update metrics every 2 seconds
        const interval = setInterval(() => {
            setMetrics(PerformanceMonitor.getMetrics())
            setSummary(PerformanceMonitor.getSummary())
        }, 2000)

        return () => {
            clearInterval(interval)
            PerformanceMonitor.cleanup()
        }
    }, [])

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null
    }

    const webVitals = metrics.filter(m => ['LCP', 'FID', 'CLS'].includes(m.name))
    const apiCalls = metrics.filter(m => m.name.startsWith('api:'))
    const dbQueries = metrics.filter(m => m.name.startsWith('db:'))
    const renders = metrics.filter(m => m.name.startsWith('render:'))

    const getPerformanceGrade = (duration: number, type: string) => {
        if (type === 'LCP') {
            if (duration <= 2500) return { grade: 'Good', color: 'bg-green-500' }
            if (duration <= 4000) return { grade: 'Needs Improvement', color: 'bg-yellow-500' }
            return { grade: 'Poor', color: 'bg-red-500' }
        }

        if (type === 'FID') {
            if (duration <= 100) return { grade: 'Good', color: 'bg-green-500' }
            if (duration <= 300) return { grade: 'Needs Improvement', color: 'bg-yellow-500' }
            return { grade: 'Poor', color: 'bg-red-500' }
        }

        if (type === 'CLS') {
            if (duration <= 0.1) return { grade: 'Good', color: 'bg-green-500' }
            if (duration <= 0.25) return { grade: 'Needs Improvement', color: 'bg-yellow-500' }
            return { grade: 'Poor', color: 'bg-red-500' }
        }

        // For API/DB calls
        if (duration <= 100) return { grade: 'Fast', color: 'bg-green-500' }
        if (duration <= 500) return { grade: 'Good', color: 'bg-blue-500' }
        if (duration <= 1000) return { grade: 'Slow', color: 'bg-yellow-500' }
        return { grade: 'Very Slow', color: 'bg-red-500' }
    }

    if (!isVisible) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <Button
                    onClick={() => setIsVisible(true)}
                    size="sm"
                    variant="outline"
                    className="bg-background/80 backdrop-blur-sm"
                >
                    <Activity className="w-4 h-4 mr-2" />
                    Performance
                </Button>
            </div>
        )
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-y-auto">
            <Card className="bg-background/95 backdrop-blur-sm border-2">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Performance Monitor
                        </CardTitle>
                        <Button
                            onClick={() => setIsVisible(false)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                        >
                            ×
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                    {/* Web Vitals */}
                    {webVitals.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-2 flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                Core Web Vitals
                            </h4>
                            <div className="space-y-1">
                                {webVitals.slice(-3).map((metric, index) => {
                                    const { grade, color } = getPerformanceGrade(metric.duration, metric.name)
                                    return (
                                        <div key={index} className="flex items-center justify-between">
                                            <span>{metric.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span>{metric.duration.toFixed(1)}{metric.name === 'CLS' ? '' : 'ms'}</span>
                                                <Badge className={`${color} text-white text-xs px-1 py-0`}>
                                                    {grade}
                                                </Badge>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* API Calls */}
                    {Object.keys(summary).filter(key => key.startsWith('api:')).length > 0 && (
                        <div>
                            <h4 className="font-medium mb-2 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                API Calls
                            </h4>
                            <div className="space-y-1">
                                {Object.entries(summary)
                                    .filter(([key]) => key.startsWith('api:'))
                                    .slice(-5)
                                    .map(([name, data]) => {
                                        const { grade, color } = getPerformanceGrade(data.avgDuration, 'api')
                                        return (
                                            <div key={name} className="flex items-center justify-between">
                                                <span className="truncate">{name.replace('api:', '')}</span>
                                                <div className="flex items-center gap-2">
                                                    <span>{data.avgDuration.toFixed(0)}ms</span>
                                                    <Badge className={`${color} text-white text-xs px-1 py-0`}>
                                                        {grade}
                                                    </Badge>
                                                </div>
                                            </div>
                                        )
                                    })}
                            </div>
                        </div>
                    )}

                    {/* Database Queries */}
                    {Object.keys(summary).filter(key => key.startsWith('db:')).length > 0 && (
                        <div>
                            <h4 className="font-medium mb-2 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Database Queries
                            </h4>
                            <div className="space-y-1">
                                {Object.entries(summary)
                                    .filter(([key]) => key.startsWith('db:'))
                                    .slice(-5)
                                    .map(([name, data]) => {
                                        const { grade, color } = getPerformanceGrade(data.avgDuration, 'db')
                                        return (
                                            <div key={name} className="flex items-center justify-between">
                                                <span className="truncate">{name.replace('db:', '')}</span>
                                                <div className="flex items-center gap-2">
                                                    <span>{data.avgDuration.toFixed(0)}ms</span>
                                                    <Badge className={`${color} text-white text-xs px-1 py-0`}>
                                                        {grade}
                                                    </Badge>
                                                </div>
                                            </div>
                                        )
                                    })}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                        <Button
                            onClick={() => {
                                PerformanceMonitor.clearMetrics()
                                setMetrics([])
                                setSummary({})
                            }}
                            size="sm"
                            variant="outline"
                            className="text-xs h-6"
                        >
                            Clear
                        </Button>
                        <Button
                            onClick={() => {
                                console.log('Performance Metrics:', PerformanceMonitor.getMetrics())
                                console.log('Performance Summary:', PerformanceMonitor.getSummary())
                            }}
                            size="sm"
                            variant="outline"
                            className="text-xs h-6"
                        >
                            Log to Console
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}