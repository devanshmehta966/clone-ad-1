'use client'

import { IntegrationLayout } from '@/components/layout/IntegrationLayout'
import { MetricCard } from '@/components/dashboard/MetricCard'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Eye,
  MousePointer,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Settings,
  Plus,
  TrendingUp,
  Target,
} from 'lucide-react'

export default function GoogleAnalyticsPage() {
  // const handleCreateReportClick = () => {
  //     console.log("Create Report clicked");
  //     alert("Create Report functionality will be implemented here");
  // };

  const topPages = [
    {
      page: '/',
      pageviews: 12456,
      uniqueViews: 8934,
      avgTime: '2:34',
      bounceRate: '45%',
    },
    {
      page: '/products',
      pageviews: 8765,
      uniqueViews: 6543,
      avgTime: '3:12',
      bounceRate: '38%',
    },
    {
      page: '/about',
      pageviews: 4321,
      uniqueViews: 3876,
      avgTime: '1:45',
      bounceRate: '52%',
    },
    {
      page: '/contact',
      pageviews: 2987,
      uniqueViews: 2654,
      avgTime: '1:28',
      bounceRate: '48%',
    },
  ]

  const trafficSources = [
    { source: 'Organic Search', sessions: 15432, percentage: 45.2 },
    { source: 'Direct', sessions: 8765, percentage: 25.7 },
    { source: 'Social Media', sessions: 5432, percentage: 15.9 },
    { source: 'Paid Search', sessions: 3210, percentage: 9.4 },
    { source: 'Referral', sessions: 1234, percentage: 3.8 },
  ]

  const deviceData = [
    { device: 'Desktop', sessions: 18765, percentage: 55.1 },
    { device: 'Mobile', sessions: 12345, percentage: 36.2 },
    { device: 'Tablet', sessions: 2987, percentage: 8.7 },
  ]

  return (
    <IntegrationLayout
      title="Google Analytics"
      description="Website traffic and conversion data insights"
      // headerActions={
      //     <Button
      //         onClick={handleCreateReportClick}
      //         className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
      //     >
      //         <Plus className="w-4 h-4" />
      //         Create Report
      //     </Button>
      // }
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Users"
            value="34,097"
            change={12.3}
            icon={Users}
            trend="up"
          />
          <MetricCard
            title="Page Views"
            value="87,529"
            change={8.7}
            icon={Eye}
            trend="up"
          />
          <MetricCard
            title="Session Duration"
            value="2:45"
            change={-5.2}
            icon={Clock}
            trend="down"
          />
          <MetricCard
            title="Bounce Rate"
            value="42.3%"
            change={-3.1}
            icon={TrendingUp}
            trend="up"
            className="border-success/20 bg-success-light/30"
          />
        </div>

        {/* Traffic Sources & Device Breakdown */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>How users find your website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trafficSources.map((source, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <span className="text-sm font-medium">
                        {source.source}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {source.sessions.toLocaleString()} sessions
                      </p>
                    </div>
                    <Badge variant="outline">{source.percentage}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>User device preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deviceData.map((device, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {device.device === 'Desktop' && (
                        <Monitor className="h-4 w-4" />
                      )}
                      {device.device === 'Mobile' && (
                        <Smartphone className="h-4 w-4" />
                      )}
                      {device.device === 'Tablet' && (
                        <Globe className="h-4 w-4" />
                      )}
                      <div>
                        <span className="text-sm font-medium">
                          {device.device}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {device.sessions.toLocaleString()} sessions
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{device.percentage}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Behavior Insights */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>Key engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pages per Session</span>
                  <span className="text-sm text-muted-foreground">3.4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">New vs Returning</span>
                  <span className="text-sm text-muted-foreground">
                    65% / 35%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Goal Conversion Rate
                  </span>
                  <span className="text-sm text-muted-foreground">4.7%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Exit Rate</span>
                  <span className="text-sm text-muted-foreground">38.2%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Geographic Data</CardTitle>
              <CardDescription>Top countries and regions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">United States</span>
                  <Badge variant="outline">42.3%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">United Kingdom</span>
                  <Badge variant="outline">18.7%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Canada</span>
                  <Badge variant="outline">12.1%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Australia</span>
                  <Badge variant="outline">8.9%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Pages Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Pages</CardTitle>
            <CardDescription>
              Your most visited pages and their performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium">Page</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Page Views
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Unique Views
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Avg. Time
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Bounce Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topPages.map((page, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{page.page}</td>
                      <td className="px-4 py-3">
                        {page.pageviews.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {page.uniqueViews.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">{page.avgTime}</td>
                      <td className="px-4 py-3">{page.bounceRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </IntegrationLayout>
  )
}
