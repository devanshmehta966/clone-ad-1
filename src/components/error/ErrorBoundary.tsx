'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'

interface Props {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
    hasError: boolean
    error?: Error
    errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error,
            errorInfo
        })

        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo)
        }

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo)

        // In production, you might want to send this to an error reporting service
        if (process.env.NODE_ENV === 'production') {
            // Example: Send to error reporting service
            // errorReportingService.captureException(error, { extra: errorInfo })
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    }

    handleGoHome = () => {
        window.location.href = '/'
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback
            }

            // Default error UI
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
                                We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <Alert>
                                    <AlertDescription className="text-sm font-mono">
                                        {this.state.error.message}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                    onClick={this.handleRetry}
                                    className="flex-1"
                                    variant="default"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Try Again
                                </Button>
                                <Button
                                    onClick={this.handleGoHome}
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

        return this.props.children
    }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<Props, 'children'>
) {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </ErrorBoundary>
    )

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

    return WrappedComponent
}

// Hook for error reporting in functional components
export function useErrorHandler() {
    return (error: Error, errorInfo?: any) => {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error caught by useErrorHandler:', error, errorInfo)
        }

        // In production, send to error reporting service
        if (process.env.NODE_ENV === 'production') {
            // Example: Send to error reporting service
            // errorReportingService.captureException(error, { extra: errorInfo })
        }
    }
}