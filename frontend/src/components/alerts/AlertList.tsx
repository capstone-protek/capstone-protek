import { useState } from "react";
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
import { alerts, type Alert, type AlertPriority } from "@/data/mockData";
import { cn } from "@/lib/utils";

const priorityStyles: Record<AlertPriority, string> = {
  critical: "status-badge-danger",
  high: "status-badge-warning",
  medium: "status-badge-info",
  low: "status-badge-success",
};

const priorityOrder: AlertPriority[] = ["critical", "high", "medium", "low"];

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

  const filteredAlerts = alerts
    .filter((alert) => {
      const matchesSearch =
        alert.machineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchQuery.toLowerCase());

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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="shadow-card">
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
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
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
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">
            Active Alerts ({filteredAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "p-4 hover:bg-muted/50 transition-colors",
                  !alert.isRead && "bg-primary-light/30"
                )}
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
                      {!alert.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <h4 className="font-semibold text-foreground">
                      {alert.type}
                    </h4>
                    <Link
                      to={`/machine/${alert.machineId}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {alert.machineName}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      {alert.message}
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
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Detail Modal */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedAlert?.type}</DialogTitle>
            <DialogDescription>{selectedAlert?.machineName}</DialogDescription>
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
                  Description
                </h5>
                <p className="text-sm text-muted-foreground">
                  {selectedAlert.message}
                </p>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-foreground mb-1">
                  Recommended Action
                </h5>
                <p className="text-sm text-muted-foreground">
                  {selectedAlert.recommendedAction}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1" asChild>
                  <Link to={`/machine/${selectedAlert.machineId}`}>
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