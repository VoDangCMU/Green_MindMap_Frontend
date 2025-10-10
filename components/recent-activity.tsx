import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const activities = [
  {
    id: 1,
    user: "Sarah Chen",
    action: "Created new project",
    time: "2 minutes ago",
    status: "success",
  },
  {
    id: 2,
    user: "Mike Johnson",
    action: "Updated user settings",
    time: "15 minutes ago",
    status: "info",
  },
  {
    id: 3,
    user: "Emily Davis",
    action: "Deleted old records",
    time: "1 hour ago",
    status: "warning",
  },
  {
    id: 4,
    user: "Tom Wilson",
    action: "Failed login attempt",
    time: "2 hours ago",
    status: "error",
  },
  {
    id: 5,
    user: "Lisa Anderson",
    action: "Exported data report",
    time: "3 hours ago",
    status: "success",
  },
]

const statusColors = {
  success: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  info: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  warning: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
}

export function RecentActivity() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Activity</CardTitle>
        <p className="text-sm text-muted-foreground">Latest actions from your team</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{activity.user}</p>
                <p className="text-sm text-muted-foreground">{activity.action}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                <Badge variant="outline" className={statusColors[activity.status as keyof typeof statusColors]}>
                  {activity.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
