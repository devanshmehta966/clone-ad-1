import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const conversionTrendData = [
  { month: "Jan", rate: 2.8, goal: 3.0, conversions: 574, visitors: 20500 },
  { month: "Feb", rate: 3.1, goal: 3.0, conversions: 707, visitors: 22800 },
  { month: "Mar", rate: 2.9, goal: 3.0, conversions: 615, visitors: 21200 },
  { month: "Apr", rate: 3.2, goal: 3.0, conversions: 786, visitors: 24563 },
  { month: "May", rate: 3.0, goal: 3.0, conversions: 783, visitors: 26100 },
  { month: "Jun", rate: 3.4, goal: 3.0, conversions: 966, visitors: 28400 },
];

const funnelData = [
  { stage: "Visitors", count: 24563, rate: 100 },
  { stage: "Product Views", count: 12281, rate: 50 },
  { stage: "Add to Cart", count: 4913, rate: 20 },
  { stage: "Checkout", count: 1228, rate: 5 },
  { stage: "Purchase", count: 786, rate: 3.2 },
];

export function ConversionChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Conversion Rate Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Rate Trend</CardTitle>
          <CardDescription>
            Monthly conversion rate vs target goal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conversionTrendData}>
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
                  name="Conversion Rate"
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

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>
            User journey from visit to purchase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex flex-col justify-center space-y-2">
            {funnelData.map((stage, index) => {
              const maxWidth = 100;
              const width = (stage.rate / 100) * maxWidth;
              const colors = [
                "bg-blue-500",
                "bg-blue-400",
                "bg-blue-300",
                "bg-blue-200",
                "bg-blue-100"
              ];

              return (
                <div key={stage.stage} className="flex items-center gap-4">
                  <div className="w-20 text-xs font-medium text-right">
                    {stage.stage}
                  </div>
                  <div className="flex-1 relative">
                    <div
                      className={`h-8 ${colors[index]} rounded-r-lg flex items-center justify-between px-3 text-white text-xs font-medium transition-all duration-300 hover:opacity-80`}
                      style={{ width: `${Math.max(width, 15)}%` }}
                    >
                      <span>{stage.count.toLocaleString()}</span>
                      <span>{stage.rate}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}