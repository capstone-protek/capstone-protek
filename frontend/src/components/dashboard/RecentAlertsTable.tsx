import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { mockAlerts } from "@/data/mockData";
import type { AlertPriority } from "@/types";
import { cn } from "@/lib/utils";

const priorityStyles: Record<AlertPriority, string> = {
  KRITIS: "status-badge-danger",
  TINGGI: "status-badge-warning",
  SEDANG: "status-badge-info",
  RENDAH: "status-badge-success",
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function RecentAlertsTable() {
  const recentAlerts = mockAlerts.slice(0, 5);

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">Recent Alerts</CardTitle>
          <CardDescription>Latest maintenance alerts and warnings</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/alerts">
            View All <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Machine</TableHead>
              <TableHead>Alert Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentAlerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>
                  <Link
                    to={`/machine/${alert.asetId}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {alert.asetId}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {alert.diagnosis}
                </TableCell>
                <TableCell>
                  <span
                    className={cn("status-badge capitalize", priorityStyles[alert.priority])}
                  >
                    {alert.priority}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatTimeAgo(alert.timestamp)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}