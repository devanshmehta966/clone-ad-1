"use client";

import { IntegrationLayout } from "@/components/layout/IntegrationLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DollarSign,
    MousePointer,
    // Eye,
    Heart,
    Users,
    // Share2,
    // Settings,
    // Plus
} from "lucide-react";

export default function MetaAdsPage() {
    // const handleCreateAdSetClick = () => {
    //     console.log("Create Ad Set clicked");
    //     alert("Create Ad Set functionality will be implemented here");
    // };

    const adSets = [
        {
            id: 1,
            name: "Lookalike Audience - Purchase",
            objective: "Conversions",
            status: "Active",
            budget: 150,
            spent: 127,
            reach: 45678,
            impressions: 89345,
            clicks: 1234,
            engagement: 567
        },
        {
            id: 2,
            name: "Interest Targeting - Fitness",
            objective: "Traffic",
            status: "Active",
            budget: 200,
            spent: 89,
            reach: 23456,
            impressions: 67890,
            clicks: 890,
            engagement: 234
        },
        {
            id: 3,
            name: "Retargeting - Website Visitors",
            objective: "Conversions",
            status: "Paused",
            budget: 100,
            spent: 45,
            reach: 12345,
            impressions: 34567,
            clicks: 456,
            engagement: 123
        }
    ];

    return (
        <IntegrationLayout
            title="Meta Ads"
            description="Manage Facebook and Instagram advertising campaigns"
        // headerActions={
        //     <Button
        //         onClick={handleCreateAdSetClick}
        //         className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        //     >
        //         <Plus className="w-4 h-4" />
        //         Create Ad Set
        //     </Button>
        // }
        >
            <div className="space-y-6">

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Total Spend"
                        value="$261"
                        change={15.3}
                        icon={DollarSign}
                        trend="up"
                    />
                    <MetricCard
                        title="Reach"
                        value="81.5k"
                        change={22.1}
                        icon={Users}
                        trend="up"
                    />
                    <MetricCard
                        title="Engagement"
                        value="924"
                        change={18.7}
                        icon={Heart}
                        trend="up"
                        className="border-accent/20 bg-accent-light/30"
                    />
                    <MetricCard
                        title="Link Clicks"
                        value="2,580"
                        change={-4.2}
                        icon={MousePointer}
                        trend="down"
                    />
                </div>

                {/* Platform Performance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Facebook Performance</CardTitle>
                            <CardDescription>Last 30 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Impressions</span>
                                    <span className="text-sm text-muted-foreground">156.2k</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Clicks</span>
                                    <span className="text-sm text-muted-foreground">1,847</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">CTR</span>
                                    <span className="text-sm text-muted-foreground">1.18%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">CPC</span>
                                    <span className="text-sm text-muted-foreground">$0.89</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Instagram Performance</CardTitle>
                            <CardDescription>Last 30 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Impressions</span>
                                    <span className="text-sm text-muted-foreground">89.7k</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Clicks</span>
                                    <span className="text-sm text-muted-foreground">733</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">CTR</span>
                                    <span className="text-sm text-muted-foreground">0.82%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">CPC</span>
                                    <span className="text-sm text-muted-foreground">$1.24</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Ad Sets Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ad Sets</CardTitle>
                        <CardDescription>
                            Monitor and optimize your Meta advertising campaigns
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium">Ad Set</th>
                                        <th className="text-left py-3 px-4 font-medium">Objective</th>
                                        <th className="text-left py-3 px-4 font-medium">Status</th>
                                        <th className="text-left py-3 px-4 font-medium">Budget</th>
                                        <th className="text-left py-3 px-4 font-medium">Spent</th>
                                        <th className="text-left py-3 px-4 font-medium">Reach</th>
                                        <th className="text-left py-3 px-4 font-medium">Clicks</th>
                                        <th className="text-left py-3 px-4 font-medium">Engagement</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adSets.map((adSet) => (
                                        <tr key={adSet.id} className="border-b hover:bg-muted/50">
                                            <td className="py-3 px-4 font-medium">{adSet.name}</td>
                                            <td className="py-3 px-4">{adSet.objective}</td>
                                            <td className="py-3 px-4">
                                                <Badge
                                                    variant={adSet.status === "Active" ? "default" : "secondary"}
                                                    className={adSet.status === "Active" ? "bg-success text-success-foreground" : ""}
                                                >
                                                    {adSet.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">${adSet.budget}</td>
                                            <td className="py-3 px-4">${adSet.spent}</td>
                                            <td className="py-3 px-4">{adSet.reach.toLocaleString()}</td>
                                            <td className="py-3 px-4">{adSet.clicks.toLocaleString()}</td>
                                            <td className="py-3 px-4">{adSet.engagement}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </IntegrationLayout>
    );
}