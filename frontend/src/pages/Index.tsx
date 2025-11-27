import { Activity, AlertTriangle, Gauge, Bell, MessageSquare, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { MachineHealthChart } from "@/components/dashboard/MachineHealthChart";
import { RecentAlertsTable } from "@/components/dashboard/RecentAlertsTable";
import { MachineStatusGrid } from "@/components/dashboard/MachineStatusGrid";
import { Button } from "@/components/ui/button";
import { dashboardStats } from "@/data/mockData";

const Index = () => {
  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor machine health and predictive maintenance insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/alerts">
              <Bell className="mr-2 h-4 w-4" />
              View Alerts
            </Link>
          </Button>
          <Button asChild>
            <Link to="/chat">
              <MessageSquare className="mr-2 h-4 w-4" />
              Ask Copilot
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Machines"
          value={dashboardStats.totalMachines}
          icon={Activity}
          variant="info"
        />
        <StatsCard
          title="Critical Alerts"
          value={dashboardStats.criticalAlertsCount}
          icon={AlertTriangle}
          variant="danger"
          trend={{ value: -20, label: "vs last week" }}
        />
        <StatsCard
          title="Offline Machines"
          value={dashboardStats.offlineMachinesCount}
          icon={Wrench}
          variant="warning"
        />
        <StatsCard
          title="At Risk (recent)"
          value={dashboardStats.recentCriticalAlerts.length}
          icon={Gauge}
          variant="success"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
          <Link to="/chat">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span className="text-sm">Ask Copilot</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
          <Link to="/alerts">
            <Bell className="h-5 w-5 text-warning" />
            <span className="text-sm">View Alerts</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2">
          <Wrench className="h-5 w-5 text-info" />
          <span className="text-sm">Schedule Service</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2">
          <Activity className="h-5 w-5 text-success" />
          <span className="text-sm">Run Diagnostics</span>
        </Button>
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <MachineHealthChart />
        <RecentAlertsTable />
      </div>

      {/* Machine Status Grid */}
      <MachineStatusGrid />
    </AppLayout>
  );
};

export default Index;