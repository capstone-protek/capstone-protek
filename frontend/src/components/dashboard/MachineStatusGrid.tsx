import { Link } from "react-router-dom";
import { ArrowRight, AlertTriangle, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/api";
import type { MachineStatus, MachineDetailResponse } from "@/types";
import { cn } from "@/lib/utils";

// Define status config locally to avoid import issues
const statusConfig: Record<string, { icon: typeof AlertTriangle; label: string; className: string }> = {
  HEALTHY: { icon: CheckCircle, label: "Healthy", className: "text-green-500" },
  WARNING: { icon: AlertTriangle, label: "At Risk", className: "text-yellow-500" },
  CRITICAL: { icon: XCircle, label: "Critical", className: "text-red-500" },
  OFFLINE: { icon: HelpCircle, label: "Offline", className: "text-gray-400" },
};

function getHealthColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 30) return "bg-red-500";
  return "bg-gray-400";
}

export function MachineStatusGrid() {
  const { data: machines = [], isLoading, error } = useQuery<MachineDetailResponse[]>({
    queryKey: ['machines'],
    queryFn: () => dashboardService.getMachines(),
  });

  if (isLoading) {
    return (
      <Card className="shadow-lg border-2 border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">Machine Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading machines...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border-2 border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">Machine Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">Error loading machines. Please try again.</div>
        </CardContent>
      </Card>
    );
  }

  if (machines.length === 0) {
    return (
      <Card className="shadow-lg border-2 border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">Machine Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">No machines found.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-2 border-primary/10 hover:shadow-xl hover:border-primary/20 transition-all bg-white dark:bg-card">
      <CardHeader className="pb-4 border-b border-border/50">
        <CardTitle className="text-xl font-bold text-foreground">Machine Status Overview</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map((machine) => {
            const statusKey = machine.status || "OFFLINE";
            const status = statusConfig[statusKey] || statusConfig["OFFLINE"];
            const StatusIcon = status.icon;

            // Simple health score logic based on status
            const healthScore = 
              machine.status === "HEALTHY" ? 90 : 
              machine.status === "WARNING" ? 60 : 
              machine.status === "CRITICAL" ? 30 : 0;

            return (
              <Link
                key={machine.id} // Use ID as key
                to={`/machine/${machine.machine_id}`} // Use machine_id for URL
                className="block group"
              >
                <Card className="hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-l-4 border-2 rounded-lg"
                  style={{
                    borderColor: 
                      machine.status === 'CRITICAL' ? '#ef4444' : 
                      machine.status === 'WARNING' ? '#eab308' : 
                      machine.status === 'HEALTHY' ? '#22c55e' : '#9ca3af',
                    borderLeftColor:
                      machine.status === 'CRITICAL' ? '#ef4444' : 
                      machine.status === 'WARNING' ? '#eab308' : 
                      machine.status === 'HEALTHY' ? '#22c55e' : '#9ca3af'
                  }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">
                          {machine.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {machine.machine_id} {/* Corrected: machine_id */}
                        </p>
                      </div>
                      <StatusIcon className={cn("h-5 w-5", status.className)} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Health Score</span>
                        <span className="font-semibold">{healthScore}%</span>
                      </div>
                      <Progress
                        value={healthScore}
                        className={cn("h-2", getHealthColor(healthScore))}
                      /> 
                    </div>

                    <div className="mt-4 flex items-center justify-end">
                      <Button variant="ghost" size="sm" className="text-primary group-hover:text-primary/80 group-hover:bg-primary/5 p-0 h-auto font-normal">
                        Details <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}