import { Activity, AlertTriangle, Gauge, Wrench } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { MachineHealthChart } from "@/components/dashboard/MachineHealthChart";
import { RecentAlertsTable } from "@/components/dashboard/RecentAlertsTable";
import { MachineStatusGrid } from "@/components/dashboard/MachineStatusGrid";
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
          trend={{ value: 20, label: "from last week" }}
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