import { StatsCards } from "@/components/stats-cards"
import { ChartsSection } from "@/components/charts-section"
import { RecentActivity } from "@/components/recent-activity"

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Welcome back</h1>
        <p className="text-muted-foreground">Here's what's happening with your GreenMind system today.</p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Charts Section */}
      <ChartsSection />

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  )
}
