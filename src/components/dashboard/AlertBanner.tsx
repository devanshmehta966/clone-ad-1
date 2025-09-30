import { AlertTriangle, TrendingDown, X, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Alert {
  id: string;
  type: "warning" | "critical" | "insight";
  title: string;
  message: string;
  action?: string;
}

const alerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    title: "High CPA Detected",
    message: "Your Google Ads CPA is 40% above target ($45 vs $32 target). Consider pausing underperforming campaigns.",
    action: "Review Campaigns"
  },
  {
    id: "2",
    type: "insight",
    title: "AI Recommendation",
    message: "Instagram engagement dropped 25% this week. Test video content format for better performance.",
    action: "View Insights"
  }
];

export function AlertBanner() {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const activeAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id));

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  const getAlertStyles = (type: Alert["type"]) => {
    switch (type) {
      case "critical":
        return "bg-destructive/10 border-destructive/20 text-destructive";
      case "warning":
        return "bg-warning/10 border-warning/20 text-warning";
      case "insight":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-muted border-border text-foreground";
    }
  };

  const getIcon = (type: Alert["type"]) => {
    switch (type) {
      case "critical":
      case "warning":
        return <AlertTriangle className="w-4 h-4" />;
      case "insight":
        return <Brain className="w-4 h-4" />;
      default:
        return <TrendingDown className="w-4 h-4" />;
    }
  };

  if (activeAlerts.length === 0) return null;

  return (
    <div className="space-y-2 px-6 pt-4">
      {activeAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-center justify-between p-4 rounded-lg border ${getAlertStyles(alert.type)}`}
        >
          <div className="flex items-center gap-3">
            {getIcon(alert.type)}
            <div>
              <h4 className="font-semibold text-sm">{alert.title}</h4>
              <p className="text-sm opacity-90">{alert.message}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {alert.action && (
              <Button
                variant="ghost"
                size="sm"
                className="text-current border-current hover:bg-current/10"
              >
                {alert.action}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissAlert(alert.id)}
              className="text-current hover:bg-current/10 p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}