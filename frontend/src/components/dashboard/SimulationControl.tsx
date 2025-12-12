import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { simulationService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Play, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios"; // 1. Pastikan AxiosError di-import

// 2. DEFINISIKAN TIPE BACKEND ERROR DI SINI
// Ini memberi tahu TypeScript bahwa error dari backend kita punya properti 'message'
type BackendError = {
  message: string;
};

export function SimulationControl() {
  const queryClient = useQueryClient();
  const [localLoading, setLocalLoading] = useState(false);

  // 1. Cek Status Simulasi
  const { data: status, isLoading: isStatusLoading } = useQuery({
    queryKey: ["simulation-status"],
    queryFn: simulationService.getStatus,
    refetchInterval: 5000,
  });

  const isRunning = status?.is_running || false;

  // 2. Start Mutation
  const startMutation = useMutation({
    mutationFn: simulationService.start,
    onMutate: () => setLocalLoading(true),
    onSuccess: (data) => {
      toast.success("Simulasi Dimulai", { description: data.message });
      queryClient.invalidateQueries({ queryKey: ["simulation-status"] });
    },
    // Gunakan BackendError di sini
    onError: (error: AxiosError<BackendError>) => {
      const errMsg = error.response?.data?.message || "Server Error";
      toast.error("Gagal Memulai", { description: errMsg });
    },
    onSettled: () => setLocalLoading(false),
  });

  // 3. Stop Mutation
  const stopMutation = useMutation({
    mutationFn: simulationService.stop,
    onMutate: () => setLocalLoading(true),
    onSuccess: (data) => {
      toast.info("Simulasi Dihentikan", { description: data.message });
      queryClient.invalidateQueries({ queryKey: ["simulation-status"] });
    },
    // Gunakan BackendError di sini juga
    onError: (error: AxiosError<BackendError>) => {
      const errMsg = error.response?.data?.message || "Server Error";
      toast.error("Gagal Menghentikan", { description: errMsg });
    },
    onSettled: () => setLocalLoading(false),
  });

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
      {/* Indikator Status Teks */}
      <div className="hidden md:flex flex-col items-end mr-2">
        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
          Simulation Status
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`relative flex h-2 w-2`}>
            {isRunning && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isRunning ? 'bg-green-500' : 'bg-slate-400'}`}></span>
          </span>
          <span className={`text-xs font-semibold ${isRunning ? 'text-green-600' : 'text-slate-500'}`}>
            {isRunning ? "RUNNING" : "STOPPED"}
          </span>
        </div>
      </div>

      {/* Tombol Utama */}
      <Button
        variant={isRunning ? "destructive" : "default"}
        size="sm"
        onClick={handleToggle}
        disabled={isLoading}
        className="min-w-[140px] shadow-sm transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
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