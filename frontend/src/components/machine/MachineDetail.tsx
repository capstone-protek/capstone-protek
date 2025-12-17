import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Wrench, Calendar } from "lucide-react";
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
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/api";
import { mockMachines as machines, maintenanceHistory, mockAlerts as alerts } from "@/data/mockData";
import type { MachineStatus, MachineDetailResponse, AlertData, SensorHistoryData } from "@/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<MachineStatus, { icon: typeof AlertTriangle; label: string; className: string }> = {
  HEALTHY: { icon: CheckCircle, label: "Healthy", className: "text-success bg-success/10" },
  WARNING: { icon: AlertTriangle, label: "At Risk", className: "text-warning bg-warning/10" },
  CRITICAL: { icon: XCircle, label: "Critical", className: "text-destructive bg-destructive/10" },
  OFFLINE: { icon: XCircle, label: "Offline", className: "text-muted-foreground bg-muted/10" },
};

// Mock sensor history data
const generateSensorHistory = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    temperature: 60 + Math.random() * 35,
    vibration: 2 + Math.random() * 6,
  }));
};

export function MachineDetail() {
  const { id } = useParams<{ id: string }>();
  const asetId = id as string;

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
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold mb-4">Machine not found</h2>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{machine.name}</h1>
            <p className="text-muted-foreground">{machine.asetId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn("flex items-center gap-1 px-3 py-1", status.className)}>
            <StatusIcon className="h-4 w-4" />
            {status.label}
          </Badge>
          <Button>
            <Wrench className="mr-2 h-4 w-4" />
            Schedule Maintenance
          </Button>
        </div>
      </div>

      {/* Machine Info & Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Machine Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Asset ID</p>
                <p className="font-semibold">{machine.asetId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-semibold">{machine.status}</p>
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
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No sensor data available</p>
            )}
          </CardContent>
        </Card>
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
          ) : (
            <p className="text-sm text-muted-foreground">No sensor data available</p>
          )}
        </CardContent>
      </Card>

      {/* Sensor History Chart */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Sensor History (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature (°C)"
                  stroke="hsl(var(--danger))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="vibration"
                  name="Vibration (mm/s)"
                  stroke="hsl(var(--warning))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Maintenance History */}
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
            {machineMaintenanceHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {machineMaintenanceHistory.map((record: { id: string; machineId: string; date: string; type: string; description: string }) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-sm">{record.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {record.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No maintenance records</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}