import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// 1. Import useLocation
import { useLocation } from "react-router-dom";

export function Header() {
  // 2. Ambil path saat ini
  const location = useLocation();
  const pathname = location.pathname;

  // 3. Fungsi untuk menentukan Judul berdasarkan URL
  const getPageTitle = (path: string) => {
    // Cek halaman utama
    if (path === "/") return "Dashboard";

    // Cek halaman spesifik (sesuai route di App.tsx Anda)
    if (path === "/settings") return "Settings";
    if (path === "/machines") return "Machine Monitoring";
    if (path === "/alerts") return "System Alerts";
    if (path === "/chat") return "AI Copilot";
    if (path === "/integration") return "Integration";

    // Cek halaman detail (misal: /machine/123)
    if (path.startsWith("/machine/")) return "Machine Detail";

    // Fallback: Jika tidak terdaftar, ambil nama path-nya dan rapikan
    // Contoh: "/profile-user" -> "Profile User"
    const segment = path.split('/')[1];
    if (segment) {
      return segment
        .replace('-', ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    return "Dashboard"; // Default jika error
  };

  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border px-6 backdrop-blur-xl transition-all">
      
      {/* Bagian Kiri: Judul & Subjudul Dinamis */}
      <div>
        {/* 4. Ganti teks statis dengan variabel {title} */}
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      </div>

      {/* Bagian Kanan: Actions */}
      <div className="flex items-center gap-4">
        
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search equipment..." 
            className="w-64 bg-secondary/50 pl-10 border-border focus-visible:ring-primary"
          />
        </div>

        {/* Notification Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-10 w-10 rounded-lg border border-border bg-secondary/50 hover:bg-secondary"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-background">
            3
          </span>
        </Button>

      </div>
    </header>
  );
}