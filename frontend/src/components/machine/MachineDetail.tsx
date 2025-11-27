import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Wrench, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { machines, maintenanceHistory, alerts, type MachineStatus } from "@/data/mockData";
import { cn } from "@/lib/utils";

const statusConfig: Record<MachineStatus, { icon: typeof AlertTriangle; label: string; className: string }> = {
  normal: { icon: CheckCircle, label: "Normal", className: "text-success bg-success/10" },
  warning: { icon: AlertTriangle, label: "At Risk", className: "text-warning bg-warning/10" },
  critical: { icon: XCircle, label: "Critical", className: "text-danger bg-danger/10" },
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
  const machine = machines.find((m) => m.id === id);

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

  const status = statusConfig[machine.status];
  const StatusIcon = status.icon;
  const machineAlerts = alerts.filter((a) => a.machineId === machine.id);
  const machineMaintenanceHistory = maintenanceHistory.filter((m) => m.machineId === machine.id);
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
            <p className="text-muted-foreground">{machine.location}</p>
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
                <p className="text-muted-foreground">Machine ID</p>
                <p className="font-semibold">{machine.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-semibold">{machine.type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Maintenance</p>
                <p className="font-semibold">{machine.lastMaintenance}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Health Score</p>
                <p className="font-semibold">{machine.healthScore}%</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Health Progress</p>
              <Progress value={machine.healthScore} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Prediction Result</CardTitle>
            <CardDescription>AI-powered failure prediction analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {machine.nextPredictedFailure ? (
              <div className="p-4 rounded-lg bg-danger/10 border border-danger/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-danger flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-danger text-lg">
                      Failure Predicted in {machine.nextPredictedFailure}
                    </h4>
                    <p className="text-sm text-foreground mt-1">
                      <strong>Failure Type:</strong> {machine.failureType}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Based on current sensor data and historical patterns, this machine shows signs of potential {machine.failureType.toLowerCase()}. Immediate inspection recommended.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="destructive">
                        Create Urgent Ticket
                      </Button>
                      <Button size="sm" variant="outline">
                        View Analysis Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-success text-lg">
                      No Failure Predicted
                    </h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      This machine is operating within normal parameters. Continue regular monitoring and scheduled maintenance.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sensor Data */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Real-time Sensor Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {machine.sensors.map((sensor) => {
              const percentage = ((sensor.value - sensor.min) / (sensor.max - sensor.min)) * 100;
              const isHigh = percentage > 80;
              const TrendIcon = sensor.trend === "up" ? TrendingUp : sensor.trend === "down" ? TrendingDown : Minus;

              return (
                <div
                  key={sensor.name}
                  className={cn(
                    "p-4 rounded-lg border",
                    isHigh ? "bg-danger/5 border-danger/20" : "bg-muted/50 border-border"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {sensor.name}
                    </span>
                    <TrendIcon
                      className={cn(
                        "h-4 w-4",
                        sensor.trend === "up"
                          ? "text-danger"
                          : sensor.trend === "down"
                          ? "text-success"
                          : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {sensor.value}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {sensor.unit}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{sensor.min}</span>
                      <span>{sensor.max}</span>
                    </div>
                    <Progress
                      value={percentage}
                      className={cn("h-1.5", isHigh ? "bg-danger/20" : "")}
                    />
                  </div>
                </div>
              );
            })}
          </div>
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
                {machineAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          alert.priority === "critical"
                            ? "destructive"
                            : alert.priority === "high"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {alert.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{alert.type}</p>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
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
                  {machineMaintenanceHistory.map((record) => (
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