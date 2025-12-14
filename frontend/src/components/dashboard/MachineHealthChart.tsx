import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Settings2 } from "lucide-react";
import type { SensorDataPoint } from "@/types";

// Interface untuk data chart yang sudah diformat
interface ChartDataPoint {
  time: string;
  airTemp: number;
  processTemp: number;
  rpm: number;
  torque: number;
  toolWear: number;
}

// Interface untuk opsi mesin
interface MachineOption {
  id: number;
  asetId: string;
  name: string;
}

export function MachineHealthChart() {
  // Fetch Daftar Mesin
  const { data: machines, isLoading: loadingMachines } = useQuery({
    queryKey: ["machines-list"],
    queryFn: dashboardService.getMachines,
  });

  // State Filter Mesin
  const [selectedMachine, setSelectedMachine] = useState("");

  // Auto-select mesin pertama
  useEffect(() => {
    // TypeScript akan otomatis tahu tipe 'machines' dari return dashboardService
    if (machines && machines.length > 0 && !selectedMachine) {
      setSelectedMachine(machines[0].asetId); 
    }
  }, [machines, selectedMachine]);

  // Fetch Data Sensor dari tabel sensor_data
  const { data: sensorData, isLoading: loadingSensor } = useQuery({
    queryKey: ["sensor-data", selectedMachine], 
    queryFn: () => dashboardService.getSensorData(selectedMachine),
    refetchInterval: 5000, // Refresh setiap 5 detik
    enabled: !!selectedMachine,
  });

  // Format data untuk chart
  const chartData: ChartDataPoint[] = sensorData?.map((item: SensorDataPoint) => ({
    time: new Date(item.insertion_time).toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    }),
    airTemp: item.air_temperature_K,
    processTemp: item.process_temperature_K,
    rpm: item.rotational_speed_rpm,
    torque: item.torque_Nm,
    toolWear: item.tool_wear_min
  })) || [];

  return (
    <Card className="col-span-full shadow-lg border-2 border-primary/10 bg-white dark:bg-card">
      <CardHeader className="pb-4 border-b border-border/50 flex flex-row items-center justify-between">
        
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Settings2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">
              Real-time Sensor Metrics
            </CardTitle>
            <p className="text-xs text-muted-foreground">
                Monitoring: {selectedMachine || "Loading..."}
            </p>
          </div>
        </div>

        {/* Filter Mesin */}
        <div className="flex items-center gap-2">
            <select 
                className="h-9 w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
                disabled={loadingMachines}
            >
                {loadingMachines ? (
                    <option>Loading machines...</option>
                ) : (
                    // --- PERBAIKAN DI SINI ---
                    // Hapus ': any'. TypeScript biasanya otomatis tahu tipe datanya.
                    // Jika masih merah, gunakan: (m: MachineOption)
                    machines?.map((m: MachineOption) => (
                        <option key={m.id} value={m.asetId}>
                            {m.name} ({m.asetId})
                        </option>
                    ))
                )}
            </select>
        </div>

      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="h-[350px] w-full">
          {!selectedMachine || !chartData || chartData.length === 0 ? (
             <div className="h-full w-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 gap-2">
               <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
               <p className="text-sm">
                 {loadingSensor ? "Fetching sensor data..." : "Waiting for sensor data stream..."}
               </p>
             </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
                
                <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10, fill: "#9CA3AF" }} 
                    tickMargin={8}
                    axisLine={false}
                />
                
                <YAxis 
                    yAxisId="left" 
                    tick={{ fontSize: 10, fill: "#9CA3AF" }}
                    axisLine={false}
                />

                <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    domain={['auto', 'auto']} 
                    tick={{ fontSize: 10, fill: "#9CA3AF" }}
                    axisLine={false}
                />

                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: "#1F2937", 
                        borderColor: "#374151",
                        borderRadius: "8px",
                        border: "1px solid #374151",
                        color: "#F9FAFB"
                    }}
                    formatter={(value: number, name: string) => [
                        `${value.toFixed(2)}${
                            name.includes('Temp') ? ' K' : 
                            name.includes('RPM') ? ' RPM' : 
                            name.includes('Torque') ? ' Nm' : 
                            name.includes('Tool Wear') ? ' min' : ''
                        }`, 
                        name
                    ]}
                    labelFormatter={(label) => `Time: ${label}`}
                />
                
                <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }}
                />

                {/* RPM - Primary line */}
                <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="rpm" 
                    name="RPM" 
                    stroke="#8B5CF6" 
                    strokeWidth={3} 
                    dot={false}
                />

                {/* Air Temperature */}
                <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="airTemp" 
                    name="Air Temp" 
                    stroke="#06B6D4" 
                    strokeWidth={2} 
                    dot={false} 
                />

                {/* Process Temperature */}
                <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="processTemp" 
                    name="Process Temp" 
                    stroke="#10B981" 
                    strokeWidth={2} 
                    dot={false} 
                />

                {/* Torque */}
                <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="torque" 
                    name="Torque" 
                    stroke="#F59E0B" 
                    strokeWidth={2} 
                    dot={false} 
                />

              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}