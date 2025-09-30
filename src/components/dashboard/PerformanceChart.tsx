import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { memo } from "react";

const data = [
  { name: "Jan", website: 4000, ads: 2400, social: 2400 },
  { name: "Feb", website: 3000, ads: 1398, social: 2210 },
  { name: "Mar", website: 2000, ads: 9800, social: 2290 },
  { name: "Apr", website: 2780, ads: 3908, social: 2000 },
  { name: "May", website: 1890, ads: 4800, social: 2181 },
  { name: "Jun", website: 2390, ads: 3800, social: 2500 },
  { name: "Jul", website: 3490, ads: 4300, social: 2100 },
];

export const PerformanceChart = memo(function PerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Performance</CardTitle>
        <CardDescription>
          Traffic and conversion trends across all channels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="website" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="social" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(262 83% 58%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(262 83% 58%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "var(--shadow-medium)"
                }}
              />
              <Area
                type="monotone"
                dataKey="website"
                stackId="1"
                stroke="hsl(217 91% 60%)"
                fill="url(#website)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="ads"
                stackId="1"
                stroke="hsl(142 76% 36%)"
                fill="url(#ads)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="social"
                stackId="1"
                stroke="hsl(262 83% 58%)"
                fill="url(#social)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Legend and Metrics */}
        <div className="mt-6 space-y-4">
          {/* Legend */}
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium">Website Traffic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span className="text-sm font-medium">Paid Ads</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm font-medium">Social Media</span>
            </div>
          </div>

          {/* Channel Performance Summary */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">2.8k</div>
              <div className="text-xs text-muted-foreground">Avg Website</div>
              <div className="text-xs text-green-600">+12.5%</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">4.2k</div>
              <div className="text-xs text-muted-foreground">Avg Paid Ads</div>
              <div className="text-xs text-green-600">+18.3%</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">2.3k</div>
              <div className="text-xs text-muted-foreground">Avg Social</div>
              <div className="text-xs text-red-600">-2.1%</div>
            </div>
          </div>

          {/* Channel Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">Top Performing Periods</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>March (Peak)</span>
                  <span className="font-medium">14.1k total</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>July (Recent)</span>
                  <span className="font-medium">9.9k total</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Best Channel</span>
                  <span className="font-medium text-green-600">Paid Ads</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">Key Insights</h4>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  • Paid ads show strongest growth (+18.3%)
                </div>
                <div className="text-xs text-muted-foreground">
                  • Social media needs attention (-2.1%)
                </div>
                <div className="text-xs text-muted-foreground">
                  • March spike indicates seasonal opportunity
                </div>
                <div className="text-xs text-muted-foreground">
                  • Website traffic remains stable baseline
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t">
            <div className="flex flex-wrap gap-2 justify-center">
              <button className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors">
                Optimize Website
              </button>
              <button className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors">
                Scale Paid Ads
              </button>
              <button className="px-3 py-1 text-xs bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors">
                Fix Social Strategy
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});