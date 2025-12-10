import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { healthTrendData } from "@/data/mockData";

export function MachineHealthChart() {
  return (
    <Card className="shadow-lg border-2 border-primary/10 hover:shadow-xl hover:border-primary/20 transition-all bg-white">
      <CardHeader className="pb-4 border-b border-border/50">
        <CardTitle className="text-xl font-bold text-foreground">
          Machine Health Trend (7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={healthTrendData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="turbine"
                name="Turbine #1"
                stroke="hsl(var(--danger))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="transformer"
                name="Transformer #3"
                stroke="hsl(var(--warning))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="compressor"
                name="Compressor #5"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="generator"
                name="Generator #2"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}