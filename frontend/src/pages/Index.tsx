import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, Wrench, ShieldCheck } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PredictionChart } from "@/components/dashboard/PredictionChart"; 
import { RecentAlertsTable } from "@/components/dashboard/RecentAlertsTable";
import SimulationControl from "@/components/dashboard/SimulationControl";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { 
  dashboardService, 
  type DashboardStats, 
  type AlertsResponse,
  type AlertData 
} from "@/services/api";

const Index = () => {
  const statsQuery = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardService.getStats,
    refetchInterval: 3000, // Refresh stat setiap 3 detik
  });

  const alertsQuery = useQuery<AlertsResponse>({
    queryKey: ["dashboard-alerts"],
    queryFn: dashboardService.getRecentAlerts,
    refetchInterval: 3000, // Refresh alert setiap 3 detik
  });

  const stats = statsQuery.data; 
  const alertsData: AlertData[] = alertsQuery.data?.alerts || []; 

  // Hitung persentase kesehatan sistem
  const systemHealth = stats && stats.total > 0 
    ? Math.round((stats.healthy / stats.total) * 100) 
    : 0;

  return (
    <AppLayout>
       {/* Header Section dengan Title dan Simulation Control */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div>
               <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard Monitoring</h1>
               <p className="text-muted-foreground">Overview kondisi mesin dan prediksi AI realtime.</p>
           </div>
           <SimulationControl />
       </div>

      {/* Stats Cards */}
      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Machines"
            value={stats.total}
            icon={Activity}
            variant="info"
          />
          <StatsCard
            title="Unhealthy"
            value={stats.warning + stats.critical} 
            icon={AlertTriangle}
            variant="danger"
          />
          <StatsCard
            title="Healthy"
            value={stats.healthy}
            icon={Wrench}
            variant="success"
          />
          <StatsCard
            title="System Health"
            value={`${systemHealth}%`}
            icon={ShieldCheck} 
            variant={systemHealth < 70 ? "danger" : "success"}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>)}
        </div>
      )}
      
      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Chart mengambil 2 kolom */}
        <div className="lg:col-span-2">
            <PredictionChart />
        </div>
        
        {/* Alerts Table mengambil 1 kolom */}
        <div className="lg:col-span-1">
            <RecentAlertsTable data={alertsData} /> 
        </div>
      </div>

      <ChatWidget/>
    </AppLayout>
  );
};

export default Index;