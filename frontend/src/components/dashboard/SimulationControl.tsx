// src/components/dashboard/SimulationControl.tsx
import { Play, Square, Loader2 } from "lucide-react";
import { useSimulation } from "@/hooks/use-simulation"; 
import { Button } from "@/components/ui/button"; // Asumsi pakai shadcn/ui button

export function SimulationControl() {
  const { isSimulating, startSimulation, stopSimulation, simulationStatus } = useSimulation();

  return (
    <div className="flex items-center gap-3 bg-card border px-4 py-2 rounded-lg shadow-sm">
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Simulation Status
        </span>
        <span className={`text-sm font-bold ${isSimulating ? 'text-green-500' : 'text-gray-500'}`}>
          {isSimulating ? "RUNNING" : "STOPPED"}
        </span>
      </div>

      <div className="h-8 w-px bg-border mx-1" />

      {isSimulating ? (
        <Button 
          onClick={stopSimulation} 
          variant="destructive" 
          size="sm"
          className="gap-2"
        >
          <Square className="h-4 w-4 fill-current" />
          Stop
        </Button>
      ) : (
        <Button 
          onClick={startSimulation} 
          variant="default" // atau "primary" tergantung tema
          size="sm"
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {simulationStatus === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
          Start Demo
        </Button>
      )}
    </div>
  );
}