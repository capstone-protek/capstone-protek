import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/api";
import { mockMachines as machines, maintenanceHistory, mockAlerts as alerts } from "@/data/mockData";
import type { MachineStatus, MachineDetailResponse, AlertData, SensorHistoryData } from "@/types";
import { cn } from "@/lib/utils";

// Konfigurasi Status (Mapping warna & icon)
const statusConfig: Record<string, { icon: typeof AlertTriangle; label: string; className: string }> = {
  HEALTHY: { icon: CheckCircle, label: "Healthy", className: "text-green-600 bg-green-100 dark:bg-green-900/30" },
  WARNING: { icon: AlertTriangle, label: "At Risk", className: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30" },
  CRITICAL: { icon: XCircle, label: "Critical", className: "text-red-600 bg-red-100 dark:bg-red-900/30" },
  OFFLINE: { icon: Info, label: "Offline", className: "text-gray-500 bg-gray-100 dark:bg-gray-800" },
};

export function MachineDetail() {
  // 1. Ambil ID dari URL
  const { id } = useParams<{ id: string }>();
  const machineId = id || "";

  // 2. Fetch Detail Mesin (Info + Latest Sensor + Active Alerts)
  const { data: machine, isLoading: loadingDetail } = useQuery<MachineDetailData>({
    queryKey: ['machine-detail', machineId],
    queryFn: () => machineService.getDetail(machineId),
    enabled: !!machineId,
    refetchInterval: 5000,
  });

  // 3. Fetch History untuk Grafik
  // ✅ FIX: Gunakan tipe HistoryItem[] (Array), bukan MachineHistoryResponse (Object)
  const { data: historyData, isLoading: loadingHistory } = useQuery<HistoryItem[]>({
    queryKey: ['machine-sensor-history', machineId],
    queryFn: () => machineService.getSensorHistory(machineId),
    enabled: !!machineId,
    refetchInterval: 5000,
  });

  // Fetch machine detail from API
  const { data: detail, isLoading: isLoadingDetail } = useQuery<MachineDetailResponse>({
    queryKey: ['machine-detail', asetId],
    queryFn: () => dashboardService.getMachineDetail(asetId),
    enabled: !!asetId,
  });

  // Fetch sensor history from API
  const { data: sensorHistoryData = [], isLoading: isLoadingHistory } = useQuery<SensorHistoryData[]>({
    queryKey: ['machine-history', asetId],
    queryFn: () => dashboardService.getHistory(asetId),
    enabled: !!asetId,
  });

  // Fallback to mock data if API fails
  const summary = machines.find((m: { asetId: string; name: string; status: MachineStatus }) => m.asetId === asetId);

  // Compute latest reading from sensor history
  const latestReading = React.useMemo(() => {
    if (!sensorHistoryData || sensorHistoryData.length === 0) return null;
    
    // Group by timestamp and get latest readings for each sensor type
    const sensorTypes = ['Air_Temp', 'Process_Temp', 'RPM', 'Torque', 'Tool_Wear'];
    const latestByType: Record<string, SensorHistoryData> = {};
    
    sensorHistoryData.forEach((reading) => {
      if (sensorTypes.includes(reading.type)) {
        const existing = latestByType[reading.type];
        if (!existing || new Date(reading.timestamp) > new Date(existing.timestamp)) {
          latestByType[reading.type] = reading;
        }
      }
    });

    // Check if we have all required sensor types
    const hasAllSensors = sensorTypes.every(type => latestByType[type]);
    if (!hasAllSensors) return null;

    // Get the latest timestamp
    const timestamps = Object.values(latestByType).map(r => new Date(r.timestamp));
    const latestTimestamp = new Date(Math.max(...timestamps.map(d => d.getTime())));

    return {
      timestamp: latestTimestamp.toISOString(),
      airTemp: latestByType['Air_Temp']?.value || 0,
      processTemp: latestByType['Process_Temp']?.value || 0,
      rpm: latestByType['RPM']?.value || 0,
      torque: latestByType['Torque']?.value || 0,
      toolWear: latestByType['Tool_Wear']?.value || 0,
    };
  }, [sensorHistoryData]);

  if (isLoadingDetail) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Loading machine details...</p>
      </div>
    );
  }

  const machine = detail ?? summary;
  if (!machine) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center min-h-[60vh]">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <XCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Machine Not Found</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Mesin dengan ID <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">{machineId}</span> tidak ditemukan dalam database.
        </p>
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  const status = statusConfig[machine.status as MachineStatus];
  const StatusIcon = status.icon;
  const machineAlerts = alerts.filter((a: AlertData) => a.machine.asetId === asetId);
  const machineMaintenanceHistory = maintenanceHistory.filter((m: { id: string; machineId: string; date: string; type: string; description: string }) => m.machineId === asetId);
  const sensorHistory = generateSensorHistory();

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="h-10 w-10">
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              {machine.name}
              <Badge variant="outline" className={cn("px-2.5 py-0.5 border-0 font-medium", status.className)}>
                <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                {status.label}
              </Badge>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground text-sm">Asset ID:</span>
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{machine.machine_id}</code>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. KIRI: Machine Info Card */}
        <Card className="shadow-sm h-fit">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              Machine Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-5">
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Status</p>
                <p className={cn("font-semibold inline-flex items-center gap-1.5", status.className.replace('bg-', 'text-').split(' ')[0])}>
                  <span className={`h-2 w-2 rounded-full ${statusKey === 'HEALTHY' ? 'bg-green-500' : statusKey === 'CRITICAL' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                  {machine.status}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Install Date</p>
                <p className="font-medium">{new Date(machine.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Last Prediction</p>
                <p className="font-medium truncate">
                  Normal Operation
                </p>
              </div>
            </div>
            {latestReading && (
              <div className="text-sm">
                <p className="text-muted-foreground mb-2">Last Reading Timestamp</p>
                <p className="text-xs">{new Date(latestReading.timestamp).toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sensor Data</CardTitle>
            <CardDescription>Current readings from machine sensors</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <p className="text-sm text-muted-foreground">Loading sensor data...</p>
            ) : latestReading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Air Temperature</p>
                  <p className="font-semibold">{latestReading.airTemp.toFixed(1)}°C</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Process Temperature</p>
                  <p className="font-semibold">{latestReading.processTemp.toFixed(1)}°C</p>
                </div>
                <div>
                  <p className="text-muted-foreground">RPM</p>
                  <p className="font-semibold">{Math.round(latestReading.rpm)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Torque</p>
                  <p className="font-semibold">{latestReading.torque.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tool Wear</p>
                  <p className="font-semibold">{Math.round(latestReading.toolWear)}</p>
                </div>
                <p className="font-mono text-sm font-semibold">
                  {new Date(latestReading.insertion_time).toLocaleString('id-ID')}
                </p>
              </div>
            ) : (
              <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20 text-xs text-destructive">
                <p className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" /> No Data Received
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. TENGAH/KANAN: Realtime Sensor Metrics (Cards) */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
           {latestReading ? (
             <>
               <MetricCard label="Air Temp" value={latestReading.air_temperature_k} unit="K" color="text-blue-600 dark:text-blue-400" />
               <MetricCard label="Process Temp" value={latestReading.process_temperature_k} unit="K" color="text-orange-600 dark:text-orange-400" />
               <MetricCard label="Rotational Speed" value={latestReading.rotational_speed_rpm} unit="RPM" color="text-purple-600 dark:text-purple-400" />
               <MetricCard label="Torque" value={latestReading.torque_nm} unit="Nm" color="text-yellow-600 dark:text-yellow-400" />
               <MetricCard label="Tool Wear" value={latestReading.tool_wear_min} unit="min" color="text-slate-600 dark:text-slate-400" />
             </>
           ) : (
             <div className="col-span-full h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-muted/10 text-muted-foreground">
               <Info className="h-8 w-8 mb-2 opacity-50" />
               <p>No telemetry data available.</p>
             </div>
           )}
        </div>
      </div>

      {/* Sensor Data Grid - simplified */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Real-time Sensor Data</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <p className="text-sm text-muted-foreground">Loading sensor data...</p>
          ) : latestReading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground">Air Temp</p>
                <p className="text-lg font-semibold">{latestReading.airTemp.toFixed(1)}°C</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground">Process Temp</p>
                <p className="text-lg font-semibold">{latestReading.processTemp.toFixed(1)}°C</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground">RPM</p>
                <p className="text-lg font-semibold">{Math.round(latestReading.rpm)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground">Torque</p>
                <p className="text-lg font-semibold">{latestReading.torque.toFixed(1)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground">Tool Wear</p>
                <p className="text-lg font-semibold">{Math.round(latestReading.toolWear)}</p>
              </div>
            </div>
            <div className="hidden md:flex gap-4 text-xs font-medium">
               <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Air Temp</span>
               <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Process Temp</span>
               <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Torque</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full mt-2">
            {loadingHistory ? (
               <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                 <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                 <p className="text-sm">Loading chart data...</p>
               </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis 
                    dataKey="time" 
                    tick={{fontSize: 12, fill: "hsl(var(--muted-foreground))"}} 
                    tickMargin={10}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    yAxisId="left" 
                    fontSize={12} 
                    tick={{fill: "hsl(var(--muted-foreground))"}}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: 'Temp (K) / Torque (Nm)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))', fontSize: 10 } }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    fontSize={12} 
                    tick={{fill: "hsl(var(--muted-foreground))"}}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: 'RPM', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))', fontSize: 10 } }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
                    itemStyle={{ fontSize: '12px' }}
                    labelStyle={{ fontSize: '12px', marginBottom: '4px', color: 'hsl(var(--muted-foreground))' }}
                  />
                  
                  <Line yAxisId="left" type="monotone" dataKey="temp" name="Air Temp (K)" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line yAxisId="left" type="monotone" dataKey="process" name="Process Temp (K)" stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line yAxisId="left" type="monotone" dataKey="torque" name="Torque (Nm)" stroke="#eab308" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="rpm" name="RPM" stroke="#8b5cf6" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                No historical data available for chart.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* --- ALERTS & MAINTENANCE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Machine Alerts */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {machineAlerts.length > 0 ? (
              <div className="space-y-3">
                {machineAlerts.map((alert: AlertData) => (
                  <div
                    key={alert.id || `${alert.machine.asetId}-${alert.timestamp}`}
                    className="p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          alert.severity === "CRITICAL"
                            ? "destructive"
                            : alert.severity === "WARNING"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {alert.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{alert.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active alerts</p>
            )}
          </CardContent>
        </Card>

        {/* Maintenance History */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Maintenance History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {machine.alerts && machine.alerts.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[100px]">Severity</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead className="text-right">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {machine.alerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <Badge variant={alert.severity === 'CRITICAL' ? 'destructive' : alert.severity === 'WARNING' ? 'default' : 'secondary'} className="text-[10px] px-2">
                            {alert.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-xs max-w-[200px] truncate" title={alert.message}>
                          {alert.message}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(alert.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit' })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground text-sm border-2 border-dashed rounded-xl bg-muted/5">
                <CheckCircle className="h-8 w-8 text-green-500/50 mx-auto mb-2" />
                No active alerts recorded. System is healthy.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

// --- Helper Component untuk Kartu Metrik Kecil ---
function MetricCard({ label, value, unit, color }: { label: string, value: number, unit: string, color: string }) {
  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mb-2">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={cn("text-2xl font-bold font-mono tracking-tight", color)}>
          {typeof value === 'number' ? value.toFixed(1) : '-'}
        </span>
        <span className="text-xs text-muted-foreground font-medium">{unit}</span>
      </div>
    </div>
  )
}

export default MachineDetail;