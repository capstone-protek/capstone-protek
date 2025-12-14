import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { simulationService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Play, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios"; // Wajib import ini

// Tipe data untuk error response dari backend
type BackendError = {
  status: string;
  message: string;
};

export function SimulationControl() {
  const queryClient = useQueryClient();
  const [localLoading, setLocalLoading] = useState(false);

  // 1. Cek Status Realtime (Polling setiap 3 detik)
  // Ini memastikan tombol selalu sinkron dengan kondisi server
  const { data: status, isLoading: isStatusLoading } = useQuery({
    queryKey: ["simulation-status"],
    queryFn: simulationService.getStatus,
    refetchInterval: 3000, 
  });

  const isRunning = status?.is_running || false;

  // 2. Logic Tombol START
  const startMutation = useMutation({
    mutationFn: simulationService.start,
    onMutate: () => setLocalLoading(true),
    
    onSuccess: (data) => {
      toast.success("Berhasil", { description: data.message });
      // Update status jadi TRUE (Running)
      queryClient.setQueryData(["simulation-status"], { is_running: true }); 
      queryClient.invalidateQueries({ queryKey: ["simulation-status"] });
    },

    onError: (error: AxiosError<BackendError>) => {
      // LOGIC PENYELAMAT TOMBOL
      if (error.response?.status === 400) {
        toast.info("Info Simulasi", { description: "Simulasi sudah berjalan aktif." });
        
        // --- TAMBAHKAN BARIS INI ---
        // Paksa UI untuk "tahu" bahwa simulasi sedang jalan (is_running: true)
        // Ini akan langsung mengubah tombol jadi STOP (Merah)
        queryClient.setQueryData(["simulation-status"], { is_running: true });
        // ---------------------------
        
      } else {
        const errMsg = error.response?.data?.message || "Gagal memulai simulasi";
        toast.error("Error", { description: errMsg });
      }
    },
    onSettled: () => setLocalLoading(false),
  });

  // 3. Logic Tombol STOP
  const stopMutation = useMutation({
    mutationFn: simulationService.stop,
    onMutate: () => setLocalLoading(true),
    
    onSuccess: (data) => {
      toast.info("Berhenti", { description: data.message });
      // Update status jadi FALSE (Stopped)
      queryClient.setQueryData(["simulation-status"], { is_running: false });
      queryClient.invalidateQueries({ queryKey: ["simulation-status"] });
    },

    onError: (error: AxiosError<BackendError>) => {
      if (error.response?.status === 400) {
        toast.info("Info Simulasi", { description: "Simulasi sudah dalam kondisi berhenti." });
        
        // --- TAMBAHKAN BARIS INI ---
        // Paksa UI jadi FALSE (Stopped) -> Tombol jadi START (Hijau/Hitam)
        queryClient.setQueryData(["simulation-status"], { is_running: false });
        // ---------------------------
        
      } else {
        const errMsg = error.response?.data?.message || "Gagal menghentikan simulasi";
        toast.error("Error", { description: errMsg });
      }
    },
    onSettled: () => setLocalLoading(false),
  });

  // Handler Klik
  const handleToggle = () => {
    if (isRunning) {
      stopMutation.mutate();
    } else {
      startMutation.mutate();
    }
  };

  const isLoading = localLoading || isStatusLoading;

  return (
    <div className="flex items-center gap-2">
      {/* Indikator Status Visual (Teks Kecil di Kiri Tombol) */}
      <div className="hidden md:flex flex-col items-end mr-2">
        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
          Status
        </span>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            {isRunning && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRunning ? 'bg-green-500' : 'bg-slate-400'}`}></span>
          </span>
          <span className={`text-xs font-bold ${isRunning ? 'text-green-600' : 'text-slate-500'}`}>
            {isRunning ? "RUNNING" : "STOPPED"}
          </span>
        </div>
      </div>

      {/* Tombol Utama */}
      <Button
        variant={isRunning ? "destructive" : "default"} // Merah jika jalan, Biru/Hitam jika mati
        size="sm"
        onClick={handleToggle}
        disabled={isLoading}
        className={`min-w-[150px] shadow-sm transition-all font-semibold ${
            isRunning ? 'hover:bg-red-600' : 'hover:bg-primary/90'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Syncing...
          </>
        ) : isRunning ? (
          <>
            <Square className="mr-2 h-4 w-4 fill-current" />
            Stop Simulation
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4 fill-current" />
            Start Simulation
          </>
        )}
      </Button>
    </div>
  );
}