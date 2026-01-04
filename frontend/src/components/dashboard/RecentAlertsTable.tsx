import type { AlertData } from "@/types";
import { AlertTriangle, AlertOctagon, Info, CheckCircle2 } from "lucide-react";

interface RecentAlertsTableProps {
  data?: AlertData[];
}

export const RecentAlertsTable = ({ data = [] }: RecentAlertsTableProps) => {
  
  // 1. Helper function untuk menentukan warna & icon berdasarkan severity
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <div className="flex items-center gap-2 text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full w-fit">
            <AlertOctagon className="h-4 w-4" />
            <span className="text-xs font-bold">CRITICAL</span>
          </div>
        );
      case "WARNING":
        return (
          <div className="flex items-center gap-2 text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded-full w-fit">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-bold">WARNING</span>
          </div>
        );
      case "INFO":
        return (
          <div className="flex items-center gap-2 text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full w-fit">
            <Info className="h-4 w-4" />
            <span className="text-xs font-bold">INFO</span>
          </div>
        );
      default:
        return <span className="text-gray-500">{severity}</span>;
    }
  };

  // 2. Format Tanggal agar enak dibaca (Contoh: 10 Des, 14:30)
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      {/* Header Card */}
      <div className="p-6 flex flex-row items-center justify-between pb-4">
        <div>
          <h3 className="font-bold text-lg">Recent Alerts</h3>
          <p className="text-sm text-muted-foreground">
            Riwayat peringatan sistem terbaru.
          </p>
        </div>
        {/* Badge jumlah alert */}
        <span className="bg-muted text-muted-foreground text-xs font-medium px-2.5 py-0.5 rounded-full">
          {data.length} Total
        </span>
      </div>

      {/* Konten Tabel */}
      <div className="p-0 overflow-x-auto">
        {data.length === 0 ? (
          // --- TAMPILAN JIKA DATA KOSONG ---
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
            <p className="text-lg font-medium">All Systems Operational</p>
            <p className="text-sm text-muted-foreground">
              Tidak ada alert yang tercatat hari ini.
            </p>
          </div>
        ) : (
          // --- TAMPILAN TABEL ---
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-3 font-medium">Severity</th>
                <th className="px-6 py-3 font-medium">Machine</th>
                <th className="px-6 py-3 font-medium">Message</th>
                <th className="px-6 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* Mapping Data alert ke baris tabel */}
              {data.map((alert) => (
                <tr 
                  key={alert.id} 
                  className="bg-card hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    {getSeverityBadge(alert.severity)}
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    <div>
                      {alert.machine.name}
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {alert.machine.asetId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground max-w-md truncate">
                    {alert.message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                    {formatDate(alert.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};