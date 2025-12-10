import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Download, ChevronDown, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Alert, AlertPriority } from "@/types";
import { cn } from "@/lib/utils";
import { alertsAPI } from "@/services/api";
import { mockAlerts } from "@/data/mockData";

const priorityStyles: Record<AlertPriority, string> = {
  KRITIS: "status-badge-danger",
  TINGGI: "status-badge-warning",
  SEDANG: "status-badge-info",
  RENDAH: "status-badge-success",
};

const priorityOrder: AlertPriority[] = ["KRITIS", "TINGGI", "SEDANG", "RENDAH"];

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AlertList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("time");
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch from API, fallback to mock data
    alertsAPI
      .getAll()
      .then(setAlerts)
      .catch(() => {
        console.log("Using mock data");
        setAlerts(mockAlerts);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredAlerts = alerts
    .filter((alert) => {
      const matchesSearch =
        alert.asetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority =
        priorityFilter === "all" || alert.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        return (
          priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
        );
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  if (loading) {
    return <div className="p-4">Loading alerts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="shadow-lg border-2 hover:shadow-xl transition-all">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="KRITIS">Critical</SelectItem>
                  <SelectItem value="TINGGI">High</SelectItem>
                  <SelectItem value="SEDANG">Medium</SelectItem>
                  <SelectItem value="RENDAH">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <ChevronDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time">Latest First</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert List */}
      <Card className="shadow-lg border-2 hover:shadow-xl transition-all">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-xl font-bold">
            Active Alerts ({filteredAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredAlerts.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No alerts found
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            "status-badge capitalize",
                            priorityStyles[alert.priority]
                          )}
                        >
                          {alert.priority}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(alert.timestamp)}
                        </span>
                      </div>
                      <h4 className="font-semibold text-foreground">
                        {alert.diagnosis}
                      </h4>
                      <Link
                        to={`/machine/${alert.asetId}`}
                        className="text-sm text-primary hover:underline"
                      >
                        Machine: {alert.asetId}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        Probability: {(alert.probabilitas * 100).toFixed(1)}%
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alert Detail Modal */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedAlert?.diagnosis}</DialogTitle>
            <DialogDescription>{selectedAlert?.asetId}</DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div>
                <span
                  className={cn(
                    "status-badge capitalize",
                    priorityStyles[selectedAlert.priority]
                  )}
                >
                  {selectedAlert.priority} Priority
                </span>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-foreground mb-1">
                  Diagnosis
                </h5>
                <p className="text-sm text-muted-foreground">
                  {selectedAlert.diagnosis}
                </p>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-foreground mb-1">
                  Sensor Data at Alert Time
                </h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Air Temp:</span>{" "}
                    {selectedAlert.sensorDataTerkait.airTemp}°C
                  </div>
                  <div>
                    <span className="text-muted-foreground">Process Temp:</span>{" "}
                    {selectedAlert.sensorDataTerkait.processTemp}°C
                  </div>
                  <div>
                    <span className="text-muted-foreground">RPM:</span>{" "}
                    {selectedAlert.sensorDataTerkait.rpm}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Torque:</span>{" "}
                    {selectedAlert.sensorDataTerkait.torque}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tool Wear:</span>{" "}
                    {selectedAlert.sensorDataTerkait.toolWear}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Probability:</span>{" "}
                    {(selectedAlert.probabilitas * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1" asChild>
                  <Link to={`/machine/${selectedAlert.asetId}`}>
                    View Machine
                  </Link>
                </Button>
                <Button variant="outline" className="flex-1">
                  Create Ticket
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
