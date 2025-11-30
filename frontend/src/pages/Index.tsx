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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-5xl font-extrabold text-foreground mb-3 tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            Monitor machine health and predictive maintenance insights
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="bg-white border-2 shadow-md hover:shadow-lg hover:bg-primary/5 hover:border-primary transition-all" asChild>
            <Link to="/alerts">
              <Bell className="mr-2 h-4 w-4" />
              View Alerts
            </Link>
          </Button>
          <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all" asChild>
            <Link to="/chat">
              <MessageSquare className="mr-2 h-4 w-4" />
              Ask Copilot
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Button 
          variant="outline" 
          className="h-auto py-8 flex-col gap-3 bg-white border-2 border-primary/20 hover:border-primary hover:bg-primary/5 hover:shadow-lg transition-all group relative overflow-hidden" 
          asChild
        >
          <Link to="/chat" className="relative z-10">
            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <MessageSquare className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-sm font-semibold text-foreground">Ask Copilot</span>
          </Link>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-8 flex-col gap-3 bg-white border-2 border-warning/20 hover:border-warning hover:bg-warning/5 hover:shadow-lg transition-all group relative overflow-hidden" 
          asChild
        >
          <Link to="/alerts" className="relative z-10">
            <div className="p-3 rounded-xl bg-warning/10 group-hover:bg-warning/20 transition-colors">
              <Bell className="h-7 w-7 text-warning group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-sm font-semibold text-foreground">View Alerts</span>
          </Link>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-8 flex-col gap-3 bg-white border-2 border-info/20 hover:border-info hover:bg-info/5 hover:shadow-lg transition-all group relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="p-3 rounded-xl bg-info/10 group-hover:bg-info/20 transition-colors">
              <Wrench className="h-7 w-7 text-info group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-sm font-semibold text-foreground">Schedule Service</span>
          </div>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-8 flex-col gap-3 bg-white border-2 border-success/20 hover:border-success hover:bg-success/5 hover:shadow-lg transition-all group relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="p-3 rounded-xl bg-success/10 group-hover:bg-success/20 transition-colors">
              <Activity className="h-7 w-7 text-success group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-sm font-semibold text-foreground">Run Diagnostics</span>
          </div>
        </Button>
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <MachineHealthChart />
        <RecentAlertsTable />
      </div>

      {/* Machine Status Grid */}
      <MachineStatusGrid />
    </AppLayout>
  );
};

export default Index;