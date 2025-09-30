import { DashboardLayoutClient } from "@/components/layout/DashboardLayoutClient"

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}