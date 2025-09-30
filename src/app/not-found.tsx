'use client'

import Link from 'next/link'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileQuestion className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                        Page Not Found
                    </CardTitle>
                    <CardDescription>
                        The page you're looking for doesn't exist or has been moved.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button asChild className="flex-1" variant="default">
                            <Link href="/">
                                <Home className="w-4 h-4 mr-2" />
                                Go Home
                            </Link>
                        </Button>
                        <Button
                            onClick={() => window.history.back()}
                            className="flex-1"
                            variant="outline"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}