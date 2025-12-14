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
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue Card */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <Activity className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium">+12.5%</span>
          </div>
          <div>
            <p className="text-purple-100 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-bold">$348,261</p>
            <p className="text-purple-200 text-xs">Compared to last month</p>
          </div>
        </div>

        {/* Sales Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <Wrench className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-green-500">+8.2%</span>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Sales</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">$15,708.98</p>
            <p className="text-gray-400 text-xs">Compared to last month</p>
          </div>
        </div>

        {/* Total Transactions Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-green-500">+15.3%</span>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Transactions</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">7,415,644</p>
            <p className="text-gray-400 text-xs">Compared to last month</p>
          </div>
        </div>

        {/* Total Conversion Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-500">+2.1%</span>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Conversion</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">10,87%</p>
            <p className="text-gray-400 text-xs">Compared to last month</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Analytics Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytic</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sales & Estimation</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Nov 25, 2023</span>
                <span className="text-sm font-medium text-green-500">$32,830.90</span>
                <span className="text-sm font-medium text-blue-500">$18,100.00</span>
              </div>
            </div>
            <MachineHealthChart />
          </div>
        </div>

        {/* Session by Country - Takes 1 column */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Session by Country</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-sm"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">United States</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">85%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-sm"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Canada</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">70%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-sm"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Indonesia</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">45%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded-sm"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">South Korea</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">38%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transaction History Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md">
                Download
              </button>
              <button className="px-3 py-1 text-xs bg-purple-600 text-white rounded-md">
                See more
              </button>
            </div>
          </div>
        </div>
        <RecentAlertsTable data={recentAlerts} />
      </div>

      {/* Simulation Control & Chat Widget */}
      <div className="mt-8 flex items-center justify-between">
        <SimulationControl />
        <ChatWidget />
      </div>
    </AppLayout>
  );
};

export default Index;