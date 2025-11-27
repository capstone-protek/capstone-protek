import { Link } from "react-router-dom";
import { ArrowRight, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { machines, type MachineStatus } from "@/data/mockData";
import { cn } from "@/lib/utils";

const statusConfig: Record<MachineStatus, { icon: typeof AlertTriangle; label: string; className: string }> = {
  normal: { icon: CheckCircle, label: "Normal", className: "text-success" },
  warning: { icon: AlertTriangle, label: "At Risk", className: "text-warning" },
  critical: { icon: XCircle, label: "Critical", className: "text-danger" },
};

function getHealthColor(score: number): string {
  if (score >= 80) return "bg-success";
  if (score >= 60) return "bg-warning";
  return "bg-danger";
}

export function MachineStatusGrid() {
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Machine Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map((machine) => {
            const status = statusConfig[machine.status];
            const StatusIcon = status.icon;

            return (
              <Link
                key={machine.id}
                to={`/machine/${machine.id}`}
                className="block"
              >
                <Card className="hover:shadow-card-hover transition-shadow cursor-pointer border-l-4"
                  style={{
                    borderLeftColor: machine.status === 'critical' 
                      ? 'hsl(var(--danger))' 
                      : machine.status === 'warning' 
                        ? 'hsl(var(--warning))' 
                        : 'hsl(var(--success))'
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">
                          {machine.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {machine.location}
                        </p>
                      </div>
                      <StatusIcon className={cn("h-5 w-5", status.className)} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Health Score</span>
                        <span className="font-semibold">{machine.healthScore}%</span>
                      </div>
                      <Progress
                        value={machine.healthScore}
                        className={cn("h-2", getHealthColor(machine.healthScore))}
                      />
                    </div>

                    {machine.nextPredictedFailure && (
                      <div className="mt-3 p-2 rounded bg-danger/10 text-danger text-xs font-medium">
                        ⚠️ Predicted failure in {machine.nextPredictedFailure}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-end">
                      <Button variant="ghost" size="sm" className="text-primary">
                        Details <ArrowRight className="ml-1 h-4 w-4" />
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