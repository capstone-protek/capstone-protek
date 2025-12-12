import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Settings2 } from "lucide-react";

export function MachineHealthChart() {
  // State untuk Filter Mesin
  const [selectedMachine, setSelectedMachine] = useState("1");

  // Fetch Data Sensor History berdasarkan mesin yang dipilih
  const { data: chartData } = useQuery({
    queryKey: ["sensor-history", selectedMachine], // Key berubah jika mesin berubah
    queryFn: () => dashboardService.getSensors(selectedMachine),
    refetchInterval: 2000, // Live update tiap 2 detik
  });

  return (
    <Card className="col-span-full shadow-lg border-2 border-primary/10 bg-white dark:bg-card">
      <CardHeader className="pb-4 border-b border-border/50 flex flex-row items-center justify-between">
        
        {/* Title Section */}
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Settings2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">
              Real-time Sensor Metrics
            </CardTitle>
          </div>
        </div>

        {/* --- FITUR FILTER MESIN --- */}
        <div className="flex items-center gap-2">
            <select 
                className="h-9 w-[150px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
            >
                {/* Value harus sesuai dengan machine_id di database (1, 2, dst) */}
                <option value="1">Machine #1</option>
                <option value="2">Machine #2</option>
                <option value="3">Machine #3</option>
            </select>
        </div>

      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="h-[400px] w-full">
          {!chartData || chartData.length === 0 ? (
             <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground gap-2">
               <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
               <p>Waiting for sensor data stream...</p>
             </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                
                <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} 
                    tickMargin={10}
                />
                
                {/* Y-Axis KIRI: Untuk Suhu & Torque (Range 0 - 350) */}
                <YAxis 
                    yAxisId="left" 
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    label={{ value: 'Temp / Torque', angle: -90, position: 'insideLeft', fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />

                {/* Y-Axis KANAN: Khusus RPM (Range Ribuan) */}
                <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    domain={['auto', 'auto']} // Auto scale biar grafik rpm gelombangnya kelihatan
                    tick={{ fontSize: 11, fill: "hsl(var(--primary))" }}
                    label={{ value: 'Rotational Speed (RPM)', angle: 90, position: 'insideRight', fontSize: 10, fill: "hsl(var(--primary))" }}
                />

                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: "hsl(var(--popover))", 
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
                    }}
                    itemStyle={{ fontSize: "12px", padding: 0 }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "0.5rem" }}
                />
                
                <Legend verticalAlign="top" height={36} iconType="circle" />

                {/* --- TRENDLINES (Semua muncul barengan) --- */}
                
                {/* 1. RPM (Biru - Axis Kanan) */}
                <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="rpm" 
                    name="RPM" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 6 }}
                />

                {/* 2. Air Temperature (Merah - Axis Kiri) */}
                <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="airTemp" 
                    name="Air Temp [K]" 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                    dot={false} 
                />

                {/* 3. Process Temperature (Oranye - Axis Kiri) */}
                <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="processTemp" 
                    name="Proc. Temp [K]" 
                    stroke="#f97316" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" // Putus-putus biar beda sama Air Temp
                    dot={false} 
                />

                {/* 4. Torque (Ungu - Axis Kiri) */}
                <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="torque" 
                    name="Torque [Nm]" 
                    stroke="#8b5cf6" 
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