import { Link } from "react-router-dom";
import { ArrowRight, AlertTriangle, CheckCircle, XCircle, CircleQuestionMark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { mockMachines as machines } from "@/data/mockData";
import type { MachineStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<MachineStatus, { icon: typeof AlertTriangle; label: string; className: string }> = {
  HEALTHY: { icon: CheckCircle, label: "Healthy", className: "text-success" },
  WARNING: { icon: AlertTriangle, label: "At Risk", className: "text-warning" },
  CRITICAL: { icon: XCircle, label: "Critical", className: "text-destructive" },
  OFFLINE: { icon: CircleQuestionMark, label: "Offline", className: "text-muted-foreground" },
};

function getHealthColor(score: number): string {
  if (score >= 80) return "bg-success";
  if (score >= 60) return "bg-warning";
  if (score >=30) return "bg-destructive";
  return "bg-muted-foreground";
}

export function MachineStatusGrid() {
  return (
    <Card className="shadow-lg border-2 border-primary/10 hover:shadow-xl hover:border-primary/20 transition-all bg-white">
      <CardHeader className="pb-4 border-b border-border/50">
        <CardTitle className="text-xl font-bold text-foreground">Machine Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map((machine) => {
            const status = statusConfig[machine.status];
            const StatusIcon = status.icon;

            // derive a simple health score for display
            const healthScore = machine.status === "HEALTHY" ? 90 : machine.status === "WARNING" ? 60 : machine.status === "CRITICAL" ? 30 : machine.status === "OFFLINE" ? 0 : 1;

            return (
              <Link
                key={machine.asetId}
                to={`/machine/${machine.asetId}`}
                className="block"
              >
                <Card className="hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-l-4 border-2 group"
                  style={{
                    borderColor: machine.status === 'CRITICAL' 
                      ? 'hsl(var(--destructive))' 
                      : machine.status === 'WARNING' 
                        ? 'hsl(var(--warning))' 
                        : machine.status === 'HEALTHY' 
                          ? 'hsl(var(--success))' 
                          : 'hsl(var(--muted-foreground))', 
                  }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">
                          {machine.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {machine.asetId}
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
                      <Button variant="ghost" size="sm" className="text-primary group-hover:text-primary/80 group-hover:bg-primary/5">
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