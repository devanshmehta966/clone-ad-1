'use client'

import { useEffect } from 'react'
import { AlertTriangle, X, RefreshCw, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { getUserFriendlyMessage, getSuggestedActions, shouldRedirectToLogin, shouldSuggestRetry } from '../../../lib/utils/error-messages'

interface ErrorToastProps {
    error: {
        code: string
        message: string
        details?: any
    }
    onRetry?: () => void
    onDismiss?: () => void
}

export function ErrorToast({ error, onRetry, onDismiss }: ErrorToastProps) {
    const userMessage = getUserFriendlyMessage(error.code, error.message)
    const actions = getSuggestedActions(error.code)
    const canRetry = shouldSuggestRetry(error.code)
    const needsLogin = shouldRedirectToLogin(error.code)

    const handleRetry = () => {
        onRetry?.()
        onDismiss?.()
    }

    const handleLogin = () => {
        window.location.href = '/signin'
    }

    return (
        <div className="flex items-start space-x-3 p-4 bg-white border border-red-200 rounded-lg shadow-lg max-w-md">
            <div className="flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                    {userMessage}
                </p>

                {actions.length > 0 && (
                    <div className="mt-2">
                        <p className="text-xs text-gray-600">
                            Suggested actions:
                        </p>
                        <ul className="mt-1 text-xs text-gray-600 list-disc list-inside">
                            {actions.map((action, index) => (
                                <li key={index}>{action}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mt-3 flex space-x-2">
                    {needsLogin && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleLogin}
                            className="text-xs"
                        >
                            <LogIn className="w-3 h-3 mr-1" />
                            Sign In
                        </Button>
                    )}

                    {canRetry && onRetry && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleRetry}
                            className="text-xs"
                        >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Retry
                        </Button>
                    )}
                </div>
            </div>

            <button
                onClick={onDismiss}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}

// Utility functions for showing error toasts
export function showErrorToast(
    error: { code: string; message: string; details?: any },
    options?: {
        onRetry?: () => void
        duration?: number
    }
) {
    const { onRetry, duration = 5000 } = options || {}

    toast.custom(
        (t) => (
            <ErrorToast
                error={error}
                onRetry={onRetry}
                onDismiss={() => toast.dismiss(t)}
            />
        ),
        {
            duration,
            position: 'top-right'
        }
    )
}

export function showSuccessToast(message: string, duration = 3000) {
    toast.success(message, {
        duration,
        position: 'top-right'
    })
}

export function showWarningToast(message: string, duration = 4000) {
    toast.warning(message, {
        duration,
        position: 'top-right'
    })
}

export function showInfoToast(message: string, duration = 3000) {
    toast.info(message, {
        duration,
        position: 'top-right'
    })
}