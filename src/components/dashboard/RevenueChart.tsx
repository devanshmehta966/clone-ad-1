import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const revenueData = [
  { month: "Jan", revenue: 18200, adSpend: 5400, organic: 12800 },
  { month: "Feb", revenue: 21400, adSpend: 6200, organic: 15200 },
  { month: "Mar", revenue: 19800, adSpend: 5800, organic: 14000 },
  { month: "Apr", revenue: 24580, adSpend: 7200, organic: 17380 },
  { month: "May", revenue: 22100, adSpend: 6800, organic: 15300 },
  { month: "Jun", revenue: 26900, adSpend: 8100, organic: 18800 },
];

const conversionData = [
  { month: "Jan", rate: 2.8, goal: 3.0 },
  { month: "Feb", rate: 3.1, goal: 3.0 },
  { month: "Mar", rate: 2.9, goal: 3.0 },
  { month: "Apr", rate: 3.2, goal: 3.0 },
  { month: "May", rate: 3.0, goal: 3.0 },
  { month: "Jun", rate: 3.4, goal: 3.0 },
];

export function RevenueChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>
            Monthly revenue from different sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
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
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "var(--shadow-medium)"
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                />
                <Bar 
                  dataKey="adSpend" 
                  stackId="revenue"
                  fill="hsl(var(--primary))" 
                  radius={[0, 0, 0, 0]}
                  name="Ad Revenue"
                />
                <Bar 
                  dataKey="organic" 
                  stackId="revenue"
                  fill="hsl(var(--success))" 
                  radius={[4, 4, 0, 0]}
                  name="Organic Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rate Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Rate Trend</CardTitle>
          <CardDescription>
            Monthly conversion rate vs target
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conversionData}>
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
                  domain={[2.5, 3.5]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "var(--shadow-medium)"
                  }}
                  formatter={(value: number) => [`${value}%`, ""]}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  name="Actual Rate"
                />
                <Line
                  type="monotone"
                  dataKey="goal"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Target Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}