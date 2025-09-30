"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { TopNavigation } from "@/components/layout/TopNavigation"
import { PageLoader } from "@/components/ui/page-loader"

interface DashboardLayoutClientProps {
    children: React.ReactNode
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
    return (
        <SidebarProvider>
            <PageLoader />
            <div className="min-h-screen flex w-full bg-background">
                <AppSidebar />

                <div className="flex-1 flex flex-col">
                    <TopNavigation />

                    <main className="flex-1 p-6 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}