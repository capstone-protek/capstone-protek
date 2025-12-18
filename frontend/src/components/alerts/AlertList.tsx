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
import { cn } from "@/lib/utils";
// ✅ FIX: Import dari api.ts
import { dashboardService, type AlertData } from "@/services/api";

const severityStyles: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-600 border-red-200",
  WARNING: "bg-yellow-100 text-yellow-600 border-yellow-200",
  INFO: "bg-blue-100 text-blue-600 border-blue-200",
};

const severityOrder = ["CRITICAL", "WARNING", "INFO"];

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString("id-ID", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AlertList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("time");
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    dashboardService
      .getRecentAlerts()
      .then((data) => {
        // ✅ FIX: Backend return { alerts: [...] }
        const alertsArray = data?.alerts || [];
        setAlerts(alertsArray);
      })
      .catch((err) => {
        console.error("Error fetching alerts:", err);
        setAlerts([]); // Set empty on error
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredAlerts = alerts
    .filter((alert) => {
      // ✅ FIX: Gunakan machine_id dan optional chaining
      const machineName = alert.machine?.name || "";
      const machineId = alert.machine_id || "";
      const message = alert.message || "";

      const matchesSearch =
        machineId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machineName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity =
        severityFilter === "all" || alert.severity === severityFilter;

      return matchesSearch && matchesSeverity;
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        return (
          severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
        );
      }
      // Sort by Time
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading alerts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="shadow-sm border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts (ID, Name, Message)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                  <SelectItem value="INFO">Info</SelectItem>
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
      <Card className="shadow-sm border">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-xl font-bold">
            Active Alerts ( {filteredAlerts.length} )
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredAlerts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No alerts found matching your criteria.
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
                            "px-2 py-1 rounded-md text-xs font-semibold border capitalize",
                            severityStyles[alert.severity] || "bg-gray-100 text-gray-600 border-gray-200"
                          )}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(alert.timestamp)}
                        </span>
                      </div>
                      <h4 className="font-semibold text-foreground">
                        {alert.message}
                      </h4>
                      <Link
                        to={`/machines/${alert.machine_id}`} // ✅ FIX: Link ke route machines
                        className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                      >
                        Machine: {alert.machine?.name || "Unknown"} ({alert.machine_id})
                      </Link>
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
            <DialogTitle>Alert Details</DialogTitle>
            <DialogDescription>
              Machine: {selectedAlert?.machine?.name || "Unknown"} ({selectedAlert?.machine_id})
            </DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div>
                <span
                  className={cn(
                    "px-2 py-1 rounded-md text-xs font-semibold border capitalize",
                    severityStyles[selectedAlert.severity] || "bg-muted text-muted-foreground border-border"
                  )}
                >
                  {selectedAlert.severity} Severity
                </span>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-foreground mb-1">
                  Message
                </h5>
                <p className="text-sm text-muted-foreground">
                  {selectedAlert.message}
                </p>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-foreground mb-1">
                  Timestamp
                </h5>
                <p className="text-sm text-muted-foreground">
                  {formatDate(selectedAlert.timestamp)}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1" asChild>
                  <Link to={`/machines/${selectedAlert.machine_id}`}>
                    View Machine
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}