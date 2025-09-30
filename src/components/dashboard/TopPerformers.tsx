import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, TrendingUp } from "lucide-react";

const topPages = [
  { page: "/landing/summer-sale", views: 12543, conversionRate: 8.2, trend: "up" },
  { page: "/products/wireless-headphones", views: 9876, conversionRate: 6.7, trend: "up" },
  { page: "/blog/marketing-tips", views: 7654, conversionRate: 4.1, trend: "down" },
  { page: "/pricing", views: 5432, conversionRate: 12.3, trend: "up" },
  { page: "/contact", views: 3210, conversionRate: 2.8, trend: "neutral" },
];

const topCampaigns = [
  { name: "Summer Sale - Google Ads", spend: "$2,450", roas: "4.2x", platform: "Google" },
  { name: "Brand Awareness - Facebook", spend: "$1,890", roas: "3.8x", platform: "Facebook" },
  { name: "Retargeting - LinkedIn", spend: "$890", roas: "5.1x", platform: "LinkedIn" },
];

export function TopPerformers() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Top Performing Pages
          </CardTitle>
          <CardDescription>Highest traffic and conversion pages this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPages.map((page, index) => (
              <div key={page.page} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary">#{index + 1}</span>
                    <span className="text-sm font-medium truncate">{page.page}</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>{page.views.toLocaleString()} views</span>
                    <span>{page.conversionRate}% conversion</span>
                  </div>
                </div>
                <Badge 
                  variant={page.trend === "up" ? "default" : page.trend === "down" ? "destructive" : "secondary"}
                  className="ml-2"
                >
                  {page.trend === "up" ? "↑" : page.trend === "down" ? "↓" : "→"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            Top Campaigns
          </CardTitle>
          <CardDescription>Best performing ad campaigns by ROAS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCampaigns.map((campaign, index) => (
              <div key={campaign.name} className="flex items-center justify-between p-3 rounded-lg bg-success-light/30">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-success">#{index + 1}</span>
                    <span className="text-sm font-medium">{campaign.name}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>{campaign.spend} spent</span>
                    <Badge variant="outline" className="text-xs">
                      {campaign.platform}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-success">{campaign.roas}</div>
                  <div className="text-xs text-muted-foreground">ROAS</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}