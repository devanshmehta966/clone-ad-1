import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpIcon, ArrowDownIcon, LucideIcon } from "lucide-react";
import { memo, useMemo } from "react";

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  changeLabel?: string;
  icon: LucideIcon;
  trend: "up" | "down" | "neutral";
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
}

export const MetricCard = memo(function MetricCard({
  title,
  value,
  change,
  changeLabel = "vs last month",
  icon: Icon,
  trend,
  className = "",
  onClick,
  clickable = false
}: MetricCardProps) {
  const { trendColor, trendBg, trendLabel } = useMemo(() => {
    switch (trend) {
      case "up":
        return {
          trendColor: "text-success",
          trendBg: "bg-success-light",
          trendLabel: "Growing"
        };
      case "down":
        return {
          trendColor: "text-destructive",
          trendBg: "bg-destructive/10",
          trendLabel: "Declining"
        };
      default:
        return {
          trendColor: "text-muted-foreground",
          trendBg: "bg-muted",
          trendLabel: "Stable"
        };
    }
  }, [trend]);

  return (
    <Card
      className={`hover:shadow-medium transition-all duration-200 ${className} ${clickable ? 'cursor-pointer hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="flex items-center gap-1 mt-1">
              {trend !== "neutral" && (
                <>
                  {trend === "up" ? (
                    <ArrowUpIcon className="w-3 h-3 text-success" />
                  ) : (
                    <ArrowDownIcon className="w-3 h-3 text-destructive" />
                  )}
                </>
              )}
              <span className={`text-xs font-medium ${trendColor}`}>
                {change > 0 ? "+" : ""}{change}%
              </span>
              <span className="text-xs text-muted-foreground">
                {changeLabel}
              </span>
            </div>
          </div>

          <Badge
            variant="secondary"
            className={`${trendBg} ${trendColor} border-0`}
          >
            {trendLabel}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
});