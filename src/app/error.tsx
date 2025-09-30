'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorPageProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Global error page:', error)
        }

        // In production, send to error reporting service
        if (process.env.NODE_ENV === 'production') {
            // Example: Send to error reporting service
            // errorReportingService.captureException(error)
        }
    }, [error])

    const handleGoHome = () => {
        window.location.href = '/'
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                        Something went wrong
                    </CardTitle>
                    <CardDescription>
                        We encountered an unexpected error. Please try again or contact support if the problem persists.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {process.env.NODE_ENV === 'development' && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-800 font-mono break-all">
                                {error.message}
                            </p>
                            {error.digest && (
                                <p className="text-xs text-red-600 mt-1">
                                    Error ID: {error.digest}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                            onClick={reset}
                            className="flex-1"
                            variant="default"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                        <Button
                            onClick={handleGoHome}
                            className="flex-1"
                            variant="outline"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Go Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}