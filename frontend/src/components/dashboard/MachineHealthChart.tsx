import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  dashboardService, 
  machineService, // ✅ FIX: Import machineService yang benar
  type HistoryItem, 
  type MachineListItem 
} from "@/services/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Settings2 } from "lucide-react";

// Format Data untuk Recharts
interface ChartDataPoint {
  time: string;
  airTemp: number;
  processTemp: number;
  rpm: number;
  torque: number;
  toolWear: number;
}

export function MachineHealthChart() {
  // 1. Fetch Daftar Mesin untuk Dropdown
  const { data: machines, isLoading: loadingMachines } = useQuery<MachineListItem[]>({
    queryKey: ["machines-list"],
    queryFn: dashboardService.getMachinesList,
    refetchInterval: 10000,
  });

  const [selectedMachine, setSelectedMachine] = useState("");

  // Auto-select mesin pertama saat data load
  useEffect(() => {
    if (machines && machines.length > 0 && !selectedMachine) {
      setSelectedMachine(machines[0].machine_id);
    }
  }, [machines, selectedMachine]);

  // 2. Fetch History Sensor untuk Mesin Terpilih
  const { data: sensorHistory, isLoading: loadingSensor } = useQuery<HistoryItem[]>({
    queryKey: ["machine-sensor-history", selectedMachine], // Key unik untuk sensor
    // ✅ FIX: Gunakan machineService.getSensorHistory (bukan getHistory umum)
    queryFn: () => machineService.getSensorHistory(selectedMachine),
    refetchInterval: 2000, // Realtime feel (2 detik)
    enabled: !!selectedMachine,
  });

  // 3. Mapping Data (Backend snake_case -> Chart CamelCase)
  const chartData: ChartDataPoint[] = sensorHistory 
    ? [...sensorHistory].reverse().map((item) => ({
        time: new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit', second:'2-digit'}),
        airTemp: item.air_temperature_k,
        processTemp: item.process_temperature_k,
        rpm: item.rotational_speed_rpm,
        torque: item.torque_nm,
        toolWear: item.tool_wear_min
      })) 
    : [];

  return (
    <Card className="col-span-full shadow-lg border-2 border-primary/10 bg-white dark:bg-card">
      <CardHeader className="pb-4 border-b border-border/50 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Settings2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Real-time Sensor Metrics</CardTitle>
            <p className="text-xs text-muted-foreground">
               Monitoring: {selectedMachine || "Loading..."}
            </p>
          </div>
        </div>

        {/* Dropdown Filter */}
        <div className="flex items-center gap-2">
           <select 
             className="h-9 w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
             value={selectedMachine}
             onChange={(e) => setSelectedMachine(e.target.value)}
             disabled={loadingMachines}
           >
             {loadingMachines ? (
               <option>Loading machines...</option>
             ) : (
               machines?.map((m) => (
                 <option key={m.id} value={m.machine_id}>
                   {m.name} ({m.machine_id})
                 </option>
               ))
             )}
           </select>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="h-[350px] w-full">
          {!selectedMachine || loadingSensor ? (
             <div className="h-full w-full flex flex-col items-center justify-center text-gray-500 gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <p className="text-sm">Fetching sensor stream...</p>
             </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10 }} 
                />
                
                {/* Sumbu Y Kiri: Temperatur & Torsi */}
                <YAxis 
                    yAxisId="left" 
                    tick={{ fontSize: 10 }} 
                    label={{ value: 'Temp (K) / Torque (Nm)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 10, fill: '#666' } }}
                />
                
                {/* Sumbu Y Kanan: RPM */}
                <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tick={{ fontSize: 10 }} 
                    label={{ value: 'RPM', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fontSize: 10, fill: '#666' } }}
                />
                
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1F2937", borderRadius: "8px", color: "#fff", border: "none" }}
                  labelStyle={{ color: "#9CA3AF", fontSize: "12px" }}
                />
                <Legend verticalAlign="top" height={36} />

                {/* Garis Grafik */}
                <Line yAxisId="right" type="monotone" dataKey="rpm" name="RPM" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="airTemp" name="Air Temp (K)" stroke="#06B6D4" strokeWidth={2} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="torque" name="Torque (Nm)" stroke="#F59E0B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default MachineHealthChart;