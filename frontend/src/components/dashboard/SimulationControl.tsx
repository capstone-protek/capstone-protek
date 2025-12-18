import { Play, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSimulation } from "@/hooks/use-simulation";

const SimulationControl = () => {
  // Gunakan hook yang baru kita buat
  const { isRunning, isLoading, toggleSimulation } = useSimulation();

  return (
    <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl p-2 px-4 shadow-sm">
      
      {/* Indikator Visual */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
            {isRunning && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isRunning ? "bg-green-500" : "bg-gray-400"}`}></span>
            </span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {isRunning ? "LIVE DATA" : "OFFLINE"}
            </span>
        </div>
      </div>

      <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>

      {/* Tombol Control */}
      <Button 
        size="sm" 
        variant={isRunning ? "destructive" : "default"}
        onClick={toggleSimulation}
        disabled={isLoading}
        className={`gap-2 transition-all min-w-[140px] shadow-sm ${isRunning ? 'bg-destructive hover:bg-red-600' : 'bg-info hover:bg-blue-700'}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Syncing...
          </>
        ) : isRunning ? (
          <>
            <Square className="h-4 w-4 fill-current" /> Stop Simulation
          </>
        ) : (
          <>
            <Play className="h-4 w-4 fill-current" /> Start Simulation
          </>
        )}
      </Button>
    </div>
  );
};

export default SimulationControl;