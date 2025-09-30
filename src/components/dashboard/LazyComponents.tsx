"use client"

import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Lazy load heavy chart components
export const LazyPerformanceChart = lazy(() =>
    import('./PerformanceChart').then(module => ({ default: module.PerformanceChart }))
)

export const LazyRevenueChart = lazy(() =>
    import('./RevenueChart').then(module => ({ default: module.RevenueChart }))
)

export const LazySocialChart = lazy(() =>
    import('./SocialChart').then(module => ({ default: module.SocialChart }))
)

export const LazyWebsiteChart = lazy(() =>
    import('./WebsiteChart').then(module => ({ default: module.WebsiteChart }))
)

export const LazyConversionChart = lazy(() =>
    import('./ConversionChart').then(module => ({ default: module.ConversionChart }))
)

export const LazyTopPerformers = lazy(() =>
    import('./TopPerformers').then(module => ({ default: module.TopPerformers }))
)

// Loading skeletons for charts
export const ChartSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-64 w-full" />
        </CardContent>
    </Card>
)

export const TopPerformersSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                </div>
            ))}
        </CardContent>
    </Card>
)

// Wrapper components with suspense
export const PerformanceChartWithSuspense = () => (
    <Suspense fallback={<ChartSkeleton />}>
        <LazyPerformanceChart />
    </Suspense>
)

export const RevenueChartWithSuspense = () => (
    <Suspense fallback={<ChartSkeleton />}>
        <LazyRevenueChart />
    </Suspense>
)

export const SocialChartWithSuspense = () => (
    <Suspense fallback={<ChartSkeleton />}>
        <LazySocialChart />
    </Suspense>
)

export const WebsiteChartWithSuspense = () => (
    <Suspense fallback={<ChartSkeleton />}>
        <LazyWebsiteChart />
    </Suspense>
)

export const ConversionChartWithSuspense = () => (
    <Suspense fallback={<ChartSkeleton />}>
        <LazyConversionChart />
    </Suspense>
)

export const TopPerformersWithSuspense = () => (
    <Suspense fallback={<TopPerformersSkeleton />}>
        <LazyTopPerformers />
    </Suspense>
)