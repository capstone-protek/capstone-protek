import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  dashboardService, 
  machineService, 
  type MachineListItem, 
  type MachineHistoryResponse 
} from "@/services/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Loader2 } from "lucide-react";

export function PredictionChart() {
  // 1. Ambil List Mesin untuk Dropdown
  const { data: machines } = useQuery<MachineListItem[]>({
    queryKey: ["machines-list"],
    queryFn: dashboardService.getMachinesList,
  });

  const [selectedMachine, setSelectedMachine] = useState("");

  // Auto-select mesin pertama saat data load
  useEffect(() => {
    if (machines && machines.length > 0 && !selectedMachine) {
      setSelectedMachine(machines[0].machine_id);
    }
  }, [machines, selectedMachine]);

  // 2. Ambil History (Prediksi ada di dalam sini)
  const { data: history, isLoading } = useQuery<MachineHistoryResponse>({
    queryKey: ["machine-history", selectedMachine],
    // ✅ FIX 2: Gunakan machineService.getHistory (Endpoint yang benar)
    queryFn: () => machineService.getHistory(selectedMachine),
    refetchInterval: 3000,
    enabled: !!selectedMachine,
  });

  // 3. Mapping Data
  // ✅ FIX 3: Tambahkan [.reverse()] agar grafik jalan dari kiri ke kanan
  const chartData = history?.prediction
    ? [...history.prediction].reverse().map(p => ({
        time: new Date(p.prediction_time).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit', second:'2-digit' }),
        risk: (p.risk_probability * 100).toFixed(1), // Konversi ke %
        rul: (p.rul_minutes_val / 60).toFixed(1)     // Konversi menit ke jam
      }))
    : [];

  return (
    <Card className="col-span-full shadow-md border-primary/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
           <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" /> 
              Real-time Failure Risk Prediction
           </CardTitle>
           <p className="text-xs text-muted-foreground mt-1 ml-7">
             Monitoring Probabilitas Kerusakan & Sisa Umur (RUL)
           </p>
        </div>
        
        <select 
           className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
           value={selectedMachine}
           onChange={(e) => setSelectedMachine(e.target.value)}
        >
           {machines?.map(m => (
             <option key={m.id} value={m.machine_id}>{m.name}</option>
           ))}
        </select>
      </CardHeader>
      
      <CardContent>
        <div className="h-[300px] w-full mt-4">
           {isLoading ? (
             <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Menganalisis data prediksi...</p>
             </div>
           ) : chartData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData}>
                 <defs>
                   <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                     <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                 <XAxis 
                    dataKey="time" 
                    tick={{fontSize: 11, fill: "#6b7280"}} 
                    tickMargin={10}
                 />
                 <YAxis 
                    unit="%" 
                    tick={{fontSize: 11, fill: "#6b7280"}} 
                    domain={[0, 100]} 
                 />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                    itemStyle={{ fontSize: '13px' }}
                 />
                 <Area 
                    type="monotone" 
                    dataKey="risk" 
                    name="Risk Probability (%)" 
                    stroke="#ef4444" 
                    fillOpacity={1} 
                    fill="url(#colorRisk)" 
                    strokeWidth={2}
                    animationDuration={1000}
                 />
               </AreaChart>
             </ResponsiveContainer>
           ) : (
             <div className="h-full flex items-center justify-center border-2 border-dashed rounded-xl bg-muted/10 text-muted-foreground">
                <p>Belum ada data prediksi untuk mesin ini.</p>
             </div>
           )}
        </div>
      </CardContent>
    </Card>
  );
}