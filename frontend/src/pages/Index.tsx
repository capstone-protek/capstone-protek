import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, Wrench, ShieldCheck } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { MachineHealthChart } from "@/components/dashboard/MachineHealthChart";
import { RecentAlertsTable } from "@/components/dashboard/RecentAlertsTable";
import { SimulationControl } from "@/components/dashboard/SimulationControl";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { api } from "@/lib/api";

const Index = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      // Backend Anda ternyata mengembalikan paket lengkap di endpoint ini
      const response = await api.getStats();
      console.log("Full Dashboard Data:", response); // Cek console untuk memastikan
      return response;
    },
    refetchInterval: 3000, 
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="animate-pulse text-xl font-medium text-muted-foreground">
            Connecting to System...
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isError || !data) {
    return (
      <AppLayout>
        <div className="flex h-[80vh] items-center justify-center flex-col gap-2">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <p className="text-lg text-destructive font-bold">Connection Failed</p>
          <p className="text-sm text-muted-foreground">Check Console for details</p>
        </div>
      </AppLayout>
    );
  }

  // Fallback data jika backend mengirim null/undefined
  const summary = data.summary || { 
    totalMachines: 0, 
    todaysAlerts: 0, 
    criticalMachines: 0, 
    systemHealth: 0 
  };

  const recentAlerts = data.recentAlerts || [];

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2 tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-base md:text-lg font-medium">
            Realtime Machine Monitoring
          </p>
        </div>

        <div className="flex items-center gap-4">
           <SimulationControl />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Machines"
          value={summary.totalMachines}
          icon={Activity}
          variant="info"
        />
        <StatsCard
          title="Active Alerts"
          value={summary.todaysAlerts}
          icon={AlertTriangle}
          variant="danger"
        />
        <StatsCard
          title="Critical Status"
          value={summary.criticalMachines}
          icon={Wrench}
          variant={summary.criticalMachines > 0 ? "warning" : "success"}
        />
        <StatsCard
          title="System Health"
          value={`${summary.systemHealth}%`}
          icon={ShieldCheck}
          variant={summary.systemHealth < 70 ? "danger" : "success"}
        />
      </div>
      
      {/* Charts & Tables */}
      <div className="grid lg:grid-cols-7 gap-6 mb-8">
        <div className="lg:col-span-4">
          <MachineHealthChart />
        </div>
        
        <div className="lg:col-span-3">
           <RecentAlertsTable data={recentAlerts} /> 
        </div>
      </div>

      <ChatWidget/>
    </AppLayout>
  );
};

export default Index;