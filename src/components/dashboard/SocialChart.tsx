import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const engagementData = [
  { month: "Jan", likes: 2400, comments: 800, shares: 600, followers: 16800 },
  { month: "Feb", likes: 2800, comments: 950, shares: 720, followers: 17200 },
  { month: "Mar", likes: 3100, comments: 1100, shares: 850, followers: 17600 },
  { month: "Apr", likes: 3400, comments: 1200, shares: 900, followers: 18000 },
  { month: "May", likes: 3800, comments: 1350, shares: 1050, followers: 18100 },
  { month: "Jun", likes: 4200, comments: 1500, shares: 1200, followers: 18200 },
];

const platformData = [
  { name: "Instagram", value: 45, color: "hsl(var(--accent))" },
  { name: "Facebook", value: 30, color: "hsl(var(--primary))" },
  { name: "LinkedIn", value: 15, color: "hsl(var(--success))" },
  { name: "Twitter", value: 10, color: "hsl(var(--warning))" },
];

export function SocialChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Engagement Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Trends</CardTitle>
          <CardDescription>
            Social media engagement over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementData}>
                <defs>
                  <linearGradient id="likes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="comments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="shares" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                  dataKey="likes"
                  stackId="1"
                  stroke="hsl(var(--accent))"
                  fill="url(#likes)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="comments"
                  stackId="1"
                  stroke="hsl(var(--primary))"
                  fill="url(#comments)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="shares"
                  stackId="1"
                  stroke="hsl(var(--success))"
                  fill="url(#shares)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Platform Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Distribution</CardTitle>
          <CardDescription>
            Engagement distribution by platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex flex-col">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "var(--shadow-medium)"
                    }}
                    formatter={(value: number) => [`${value}%`, "Engagement"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {platformData.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground truncate">
                    {item.name} ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}