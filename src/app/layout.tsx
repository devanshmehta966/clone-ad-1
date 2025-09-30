import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/auth/SessionProvider'
import { DashboardProvider } from '@/components/dashboard/DashboardProvider'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { PerformanceDebugPanel } from '@/components/debug/PerformanceMonitor'
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'OmniChannel Marketing Hub',
    description: 'Omnichannel marketing analytics dashboard',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ErrorBoundary>
                    <SessionProvider>
                        <DashboardProvider>
                            <TooltipProvider>
                                {children}
                                <Toaster />
                                <Sonner />
                                <PerformanceDebugPanel />
                            </TooltipProvider>
                        </DashboardProvider>
                    </SessionProvider>
                </ErrorBoundary>
            </body>
        </html>
    )
}