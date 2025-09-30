import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const trafficData = [
  { month: "Jan", visits: 20500, uniqueVisitors: 15400, bounceRate: 45 },
  { month: "Feb", visits: 22800, uniqueVisitors: 17200, bounceRate: 42 },
  { month: "Mar", visits: 21200, uniqueVisitors: 16100, bounceRate: 48 },
  { month: "Apr", visits: 24563, uniqueVisitors: 18300, bounceRate: 39 },
  { month: "May", visits: 26100, uniqueVisitors: 19500, bounceRate: 41 },
  { month: "Jun", visits: 28400, uniqueVisitors: 21200, bounceRate: 37 },
];

const pageViewsData = [
  { page: "Homepage", views: 8420, conversions: 245 },
  { page: "Product Page", views: 6200, conversions: 186 },
  { page: "Blog", views: 4800, conversions: 72 },
  { page: "Landing Page", views: 5143, conversions: 154 },
];

export function WebsiteChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Traffic Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Trends</CardTitle>
          <CardDescription>
            Website visits and unique visitors over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "var(--shadow-medium)"
                  }}
                  formatter={(value: number) => [value.toLocaleString(), ""]}
                />
                <Line
                  type="monotone"
                  dataKey="visits"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  name="Total Visits"
                />
                <Line
                  type="monotone"
                  dataKey="uniqueVisitors"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 3 }}
                  name="Unique Visitors"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Pages Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Top Pages Performance</CardTitle>
          <CardDescription>
            Page views and conversions by page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pageViewsData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="page" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "var(--shadow-medium)"
                  }}
                  formatter={(value: number) => [value.toLocaleString(), ""]}
                />
                <Bar 
                  dataKey="views" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  name="Page Views"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}