"use client"

import { useState } from "react"
import { AlertBanner } from "@/components/dashboard/AlertBanner"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { IntegrationStatus } from "@/components/dashboard/IntegrationStatus"
import { useDashboard } from "@/components/dashboard/DashboardProvider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    PerformanceChartWithSuspense,
    RevenueChartWithSuspense,
    SocialChartWithSuspense,
    WebsiteChartWithSuspense,
    ConversionChartWithSuspense,
    TopPerformersWithSuspense
} from "@/components/dashboard/LazyComponents"
import {
    Eye,
    MousePointer,
    DollarSign,
    Users,
    TrendingUp,
    Target,
    Heart,
    Share2,
    Banknote
} from "lucide-react"

export default function DashboardPage() {
    const { metrics, currentUser } = useDashboard()
    const [showRevenueDetails, setShowRevenueDetails] = useState(false)
    const [showSocialDetails, setShowSocialDetails] = useState(false)
    const [showWebsiteDetails, setShowWebsiteDetails] = useState(false)
    const [showConversionDetails, setShowConversionDetails] = useState(false)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Marketing Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Welcome back, {currentUser?.name}! Monitor your omnichannel performance and get actionable insights.
                </p>
            </div>

            <AlertBanner />

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Website Visits"
                    value={metrics.website.visits.toLocaleString()}
                    change={metrics.website.changeVsPrevMonth}
                    icon={Eye}
                    trend={metrics.website.changeVsPrevMonth > 0 ? "up" : "down"}
                    clickable={true}
                    onClick={() => setShowWebsiteDetails(true)}
                />
                <MetricCard
                    title="Conversion Rate"
                    value={`${metrics.website.conversionRate}%`}
                    change={-2.1}
                    icon={Target}
                    trend="down"
                    clickable={true}
                    onClick={() => setShowConversionDetails(true)}
                />
                <MetricCard
                    title="Total Revenue"
                    value="$24,580"
                    change={16.2}
                    icon={Banknote}
                    trend="up"
                    clickable={true}
                    onClick={() => setShowRevenueDetails(true)}
                    className="border-primary/20 bg-primary/5"
                />
                <MetricCard
                    title="Social Engagement"
                    value={`${metrics.social.engagement}%`}
                    change={22.1}
                    icon={Heart}
                    trend="up"
                    clickable={true}
                    onClick={() => setShowSocialDetails(true)}
                    className="border-accent/20 bg-accent/5"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PerformanceChartWithSuspense />

                <div className="space-y-6">
                    {/* Integration Status */}
                    <IntegrationStatus />

                    {/* Quick Actions */}
                    <div className="bg-card rounded-xl p-6 border">
                        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full text-left p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                <span className="font-medium">Optimize underperforming ads</span>
                                <p className="text-sm text-muted-foreground">3 campaigns need attention</p>
                            </button>
                            <button className="w-full text-left p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                <span className="font-medium">Review budget allocation</span>
                                <p className="text-sm text-muted-foreground">Monthly budget analysis</p>
                            </button>
                            <button className="w-full text-left p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                <span className="font-medium">Generate weekly report</span>
                                <p className="text-sm text-muted-foreground">Ready for download</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Performers */}
            <TopPerformersWithSuspense />

            {/* Revenue Details Modal */}
            <Dialog open={showRevenueDetails} onOpenChange={setShowRevenueDetails}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Revenue Analytics</DialogTitle>
                        <DialogDescription>
                            Detailed breakdown of revenue metrics and advertising performance
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 mb-6">
                        <MetricCard
                            title="Ad Spend"
                            value={`${metrics.ads.spend.toLocaleString()}`}
                            change={metrics.ads.changeVsPrevMonth}
                            icon={DollarSign}
                            trend={metrics.ads.changeVsPrevMonth > 0 ? "up" : "down"}
                        />
                        <MetricCard
                            title="Cost Per Click"
                            value={`${metrics.ads.cpc}`}
                            change={-5.2}
                            icon={MousePointer}
                            trend="up"
                            className="border-success/20 bg-success-light/30"
                        />
                        <MetricCard
                            title="Cost Per Acquisition"
                            value={`${metrics.ads.cpa}`}
                            change={18.5}
                            icon={TrendingUp}
                            trend="down"
                            className="border-warning/20 bg-warning-light/30"
                        />
                    </div>
                    <RevenueChartWithSuspense />
                </DialogContent>
            </Dialog>

            {/* Social Details Modal */}
            <Dialog open={showSocialDetails} onOpenChange={setShowSocialDetails}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Social Media Analytics</DialogTitle>
                        <DialogDescription>
                            Detailed breakdown of social media performance and engagement metrics
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-6">
                        <MetricCard
                            title="Content Shares"
                            value="1,247"
                            change={-8.3}
                            icon={Share2}
                            trend="down"
                        />
                        <MetricCard
                            title="Social Followers"
                            value={`${(metrics.social.followers / 1000).toFixed(1)}k`}
                            change={metrics.social.changeVsPrevMonth}
                            icon={Users}
                            trend={metrics.social.changeVsPrevMonth > 0 ? "up" : "down"}
                        />
                    </div>
                    <SocialChartWithSuspense />
                </DialogContent>
            </Dialog>

            {/* Website Details Modal */}
            <Dialog open={showWebsiteDetails} onOpenChange={setShowWebsiteDetails}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Website Analytics</DialogTitle>
                        <DialogDescription>
                            Detailed breakdown of website traffic and page performance
                        </DialogDescription>
                    </DialogHeader>
                    <WebsiteChartWithSuspense />
                </DialogContent>
            </Dialog>

            {/* Conversion Details Modal */}
            <Dialog open={showConversionDetails} onOpenChange={setShowConversionDetails}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Conversion Analytics</DialogTitle>
                        <DialogDescription>
                            Detailed breakdown of conversion rates and user funnel
                        </DialogDescription>
                    </DialogHeader>
                    <ConversionChartWithSuspense />
                </DialogContent>
            </Dialog>
        </div>
    )
}