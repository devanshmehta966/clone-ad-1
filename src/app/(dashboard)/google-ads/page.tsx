'use client'

import { useState } from 'react'
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
import { CreateCampaignModal } from '@/components/google-ads/CreateCampaignModal'
import {
  DollarSign,
  MousePointer,
  Eye,
  TrendingUp,
  Play,
  Pause,
  Settings,
  BarChart3,
} from 'lucide-react'

export default function GoogleAdsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleCreateCampaignClick = () => {
    console.log('Create Campaign clicked')
    setIsCreateModalOpen(true)
  }

  const campaigns = [
    {
      id: 1,
      name: 'Summer Sale Campaign',
      status: 'Active',
      budget: 1200,
      spent: 890,
      clicks: 2456,
      impressions: 45678,
      ctr: 5.38,
      cpc: 0.36,
    },
    {
      id: 2,
      name: 'Brand Awareness Q3',
      status: 'Paused',
      budget: 800,
      spent: 320,
      clicks: 1123,
      impressions: 28934,
      ctr: 3.88,
      cpc: 0.29,
    },
    {
      id: 3,
      name: 'Product Launch',
      status: 'Active',
      budget: 2000,
      spent: 1456,
      clicks: 3890,
      impressions: 67234,
      ctr: 5.79,
      cpc: 0.37,
    },
  ]

  return (
    <IntegrationLayout
      title="Google Ads"
      description="Manage and monitor your Google Ads campaigns"
      // headerActions={
      //     <Button
      //         onClick={handleCreateCampaignClick}
      //         className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
      //     >
      //         <Play className="w-4 h-4" />
      //         Create Campaign
      //     </Button>
      // }
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Spend"
            value="$2,666"
            change={12.5}
            icon={DollarSign}
            trend="up"
          />
          <MetricCard
            title="Total Clicks"
            value="7,469"
            change={8.2}
            icon={MousePointer}
            trend="up"
          />
          <MetricCard
            title="Impressions"
            value="141.8k"
            change={-3.1}
            icon={Eye}
            trend="down"
          />
          <MetricCard
            title="Average CPC"
            value="$0.34"
            change={-5.7}
            icon={TrendingUp}
            trend="up"
            className="border-success/20 bg-success-light/30"
          />
        </div>

        {/* Campaigns Table */}
        <Card>
          <CardHeader>
            <CardTitle>Active Campaigns</CardTitle>
            <CardDescription>
              Monitor performance and manage your Google Ads campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium">
                      Campaign
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Budget</th>
                    <th className="px-4 py-3 text-left font-medium">Spent</th>
                    <th className="px-4 py-3 text-left font-medium">Clicks</th>
                    <th className="px-4 py-3 text-left font-medium">CTR</th>
                    <th className="px-4 py-3 text-left font-medium">CPC</th>
                    {/* <th className="text-left py-3 px-4 font-medium">Actions</th> */}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 font-medium">{campaign.name}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            campaign.status === 'Active'
                              ? 'default'
                              : 'secondary'
                          }
                          className={
                            campaign.status === 'Active'
                              ? 'bg-success text-success-foreground'
                              : ''
                          }
                        >
                          {campaign.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">${campaign.budget}</td>
                      <td className="px-4 py-3">${campaign.spent}</td>
                      <td className="px-4 py-3">
                        {campaign.clicks.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">{campaign.ctr}%</td>
                      <td className="px-4 py-3">${campaign.cpc}</td>
                      {/* <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            {campaign.status === 'Active' ? (
                              <Pause className="h-3 w-3" />
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                          </Button>
                          <Button size="sm" variant="outline">
                            <BarChart3 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </IntegrationLayout>
  )
}
