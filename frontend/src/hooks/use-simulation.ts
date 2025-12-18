import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { simulationService } from '@/services/api';
import { toast } from 'sonner';

export function useSimulation() {
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Helper untuk refresh data dashboard saat simulasi berjalan
  const refreshDashboard = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-alerts"] });
    queryClient.invalidateQueries({ queryKey: ["machine-history"] });
  }, [queryClient]);

  const checkStatus = useCallback(async () => {
    try {
      const data = await simulationService.getStatus();
      setIsRunning(data.is_running);
    } catch (error) {
      console.error("Gagal sync status simulasi", error);
    }
  }, []);

  // Toggle Start/Stop
  const toggleSimulation = async () => {
    setIsLoading(true);
    try {
      if (isRunning) {
        await simulationService.stop();
        toast.info("Simulasi dihentikan.");
        setIsRunning(false);
      } else {
        await simulationService.start();
        toast.success("Simulasi dimulai! Grafik akan bergerak.");
        setIsRunning(true);
        // Langsung refresh data agar user tidak menunggu interval
        refreshDashboard();
      }
    } catch (error) {
      console.error("Error toggle simulation:", error);
      toast.error("Gagal mengubah status simulasi.");
      // Re-sync status asli jika error
      await checkStatus();
    } finally {
      setIsLoading(false);
    }
  };

  // Polling Status & Data Refresh
  useEffect(() => {
    checkStatus(); // Cek awal

    // Interval cek status simulasi
    const statusInterval = setInterval(checkStatus, 3000);

    // Jika running, kita bisa memaksa refresh data grafik lebih agresif (opsional)
    // tapi biasanya refetchInterval di useQuery masing-masing komponen sudah cukup.
    
    return () => clearInterval(statusInterval);
  }, [checkStatus]);

  return {
    isRunning,
    isLoading,
    toggleSimulation
  };
}