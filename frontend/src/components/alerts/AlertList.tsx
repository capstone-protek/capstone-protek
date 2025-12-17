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
import type { AlertData } from "@/types";
import { cn } from "@/lib/utils";
import { dashboardService } from "@/services/api";
import { mockAlerts } from "@/data/mockData";

const severityStyles: Record<string, string> = {
  CRITICAL: "bg-destructive/10 text-destructive border-destructive/20",
  WARNING: "bg-warning/10 text-warning border-warning/20",
  INFO: "bg-info/10 text-info border-info/20",
};

const severityOrder = ["CRITICAL", "WARNING", "INFO"];

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
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("time");
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch from API, fallback to mock data
    dashboardService
      .getAlerts()
      .then((data) => {
        // Backend mengembalikan { alerts: [...] } atau array langsung
        const alertsArray = Array.isArray(data) 
          ? data 
          : (data as data)?.alerts || [];
        setAlerts(alertsArray);
      })
      .catch((error) => {
        console.error("Error fetching alerts:", error);
        console.log("Using mock data");
        // Convert mock data to AlertData format if needed
        setAlerts(mockAlerts as AlertData[]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredAlerts = alerts
    .filter((alert) => {
      const matchesSearch =
        alert.machine.asetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.machine.name.toLowerCase().includes(searchQuery.toLowerCase());

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
                            "px-2 py-1 rounded-md text-xs font-semibold border capitalize",
                            severityStyles[alert.severity] || "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(alert.timestamp.toString())}
                        </span>
                      </div>
                      <h4 className="font-semibold text-foreground">
                        {alert.message}
                      </h4>
                      <Link
                        to={`/machine/${alert.machine.asetId}`}
                        className="text-sm text-primary hover:underline"
                      >
                        Machine: {alert.machine.name} ({alert.machine.asetId})
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
            <DialogTitle>{selectedAlert?.message}</DialogTitle>
            <DialogDescription>
              {selectedAlert?.machine.name} ({selectedAlert?.machine.asetId})
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
                  {formatDate(selectedAlert.timestamp.toString())}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1" asChild>
                  <Link to={`/machine/${selectedAlert.machine.asetId}`}>
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
