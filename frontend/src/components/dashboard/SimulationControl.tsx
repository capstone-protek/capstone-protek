// Contoh update SimulationControl.tsx (Opsional)
import { Button } from "@/components/ui/button"; 
import { Play, Square } from "lucide-react";
import { useSimulation } from "@/hooks/use-simulation"; // Import hook ini

const SimulationControl = () => {
  const { isSimulating, startSimulation, stopSimulation } = useSimulation();
  
  // Logic toggle sederhana
  const handleToggle = () => {
    if (isSimulating) {
      stopSimulation();
    } else {
      startSimulation();
    }
  };

  return (
    <div className="flex items-center gap-4 bg-background p-2 rounded-lg border">
        {/* Indikator Status */}
        <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${isSimulating ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className="text-sm font-semibold text-muted-foreground uppercase">
                {isSimulating ? 'Running' : 'Stopped'}
            </span>
        </div>

        {/* Tombol Action */}
        <Button 
            onClick={handleToggle}
            variant={isSimulating ? "destructive" : "default"}
            size="sm"
            className="w-28"
        >
            {isSimulating ? (
                <>
                    <Square className="h-4 w-4 mr-2 fill-current" /> Stop
                </>
            ) : (
                <>
                    <Play className="h-4 w-4 mr-2 fill-current" /> Start Demo
                </>
            )}
        </Button>
    </div>
  );
};

export default SimulationControl;