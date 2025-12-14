import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, Wrench, ShieldCheck } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { MachineHealthChart } from "@/components/dashboard/MachineHealthChart";
import { RecentAlertsTable } from "@/components/dashboard/RecentAlertsTable";
import { dashboardService } from "@/services/api";
import { SimulationControl } from "@/components/dashboard/SimulationControl";
import { ChatWidget } from "@/components/chat/ChatWidget";
import type { DashboardSummaryResponse } from "@/types";

const Index = () => {
  // 1. Fetch Data menggunakan React Query
  const { data, isLoading, isError } = useQuery<DashboardSummaryResponse>({
    queryKey: ["dashboard-summary"],
    queryFn: dashboardService.getSummary,
    refetchInterval: 5000, // Refresh otomatis setiap 5 detik (Realtime feel)
  });

  // 2. Loading State (Skeleton sederhana)
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="animate-pulse text-xl font-medium text-muted-foreground">
            Loading Dashboard Data...
          </div>
        </div>
      </AppLayout>
    );
  }

  // 3. Error State
  if (isError || !data) {
    return (
      <AppLayout>
        <div className="flex h-[80vh] items-center justify-center flex-col gap-2">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <p className="text-lg text-destructive font-bold">Failed to load data</p>
          <p className="text-sm text-muted-foreground">Check your backend connection</p>
        </div>
      </AppLayout>
    );
  }

  // Destructure data agar kode lebih bersih
  const { summary, recentAlerts } = data;

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

        <div className="flex items-center gap-4">
           {/* Komponen ini akan otomatis mengatur state Start/Stop */}
           <SimulationControl />
        </div>
        
        {/* Indikator Online */}
        <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-green-600 dark:text-green-400">Live Updates</span>
        </div>
      </div>

      {/* Stats Cards - MAPPING DATA API KE CARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1: Total Machines */}
        <StatsCard
          title="Total Machines"
          value={summary.totalMachines}
          icon={Activity}
          variant="info"
        />

        {/* Card 2: Today's Alerts */}
        <StatsCard
          title="Today's Alerts"
          value={summary.todaysAlerts}
          icon={AlertTriangle}
          variant="danger"
          // Opsional: Hitung trend jika ada data historis, jika tidak hapus prop trend
        />

        {/* Card 3: Critical Machines (Ganti Offline -> Critical agar sesuai API) */}
        <StatsCard
          title="Critical Machines"
          value={summary.criticalMachines}
          icon={Wrench}
          variant={summary.criticalMachines > 0 ? "warning" : "success"}
        />

        {/* Card 4: System Health Score */}
        <StatsCard
          title="System Health"
          value={`${summary.systemHealth}%`}
          icon={ShieldCheck} // Ganti icon Gauge ke ShieldCheck biar fresh
          variant={summary.systemHealth < 70 ? "danger" : "success"}
        />
      </div>
      
      {/* Charts & Tables */}
      <div className="grid md:grid-cols-2 lg:grid-cols-7 mt-4 gap-6 mb-8">
        {/* Note: Pastikan chart handle data kosong jika endpoint chart belum siap */}
        <MachineHealthChart />
      </div>
      
      <div className="grid mt-4 gap-6 mb-8">
        {/* Pass data alert dari summary API ke tabel */}
        {/* Anda mungkin perlu update komponen RecentAlertsTable agar menerima props 'data' */}
        <RecentAlertsTable data={recentAlerts} /> 
      </div>

      <div>
        <ChatWidget/>
      </div>
    </AppLayout>
  );
};

export default Index;