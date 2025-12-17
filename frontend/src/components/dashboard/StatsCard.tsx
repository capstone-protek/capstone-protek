import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variantStyles = {
  default: "bg-white border-primary/30 shadow-lg",
  success: "bg-white border-success/30 shadow-lg",
  warning: "bg-white border-warning/30 shadow-lg",
  danger: "bg-white border-destructive/30 shadow-lg",
  info: "bg-white border-info/30 shadow-lg",
};

const iconBgStyles = {
  default: "bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg",
  success: "bg-gradient-to-br from-success to-success/80 text-white shadow-lg",
  warning: "bg-gradient-to-br from-warning to-warning/80 text-white shadow-lg",
  danger: "bg-gradient-to-br from-destructive to-destructive/80 text-white shadow-lg",
  info: "bg-gradient-to-br from-info to-info/80 text-white shadow-lg",
};

const accentColors = {
  default: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
  info: "text-info",
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
}: StatsCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden border-2 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1",
      variantStyles[variant]
    )}>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <p className={cn(
              "text-xs font-bold uppercase tracking-wider"
            )}>
              {title}
            </p>
            <p className={cn(
              "text-5xl font-extrabold leading-none",
              accentColors[variant]
            )}>
              {value}
            </p>
            {trend && (
              <div className="flex items-center gap-2 pt-1">
                <span className={cn(
                  "text-sm font-bold",
                  trend.value >= 0 ? "text-success" : "text-destructive"
                )}>
                  {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
          <div className={cn(
            "p-4 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300",
            iconBgStyles[variant]
          )}>
            <Icon className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
      
      {/* Decorative corner accent */}
      <div className={cn(
        "absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity",
        variant === "default" && "bg-primary",
        variant === "success" && "bg-success",
        variant === "warning" && "bg-warning",
        variant === "danger" && "bg-destructive",
        variant === "info" && "bg-info",
      )} />
    </Card>
  );
}