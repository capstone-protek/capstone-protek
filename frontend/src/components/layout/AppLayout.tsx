import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";
import { Search, Bell } from "lucide-react"; // Icon tambahan
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  // State Sidebar
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed");
      return saved === "true";
    }
    return false;
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebar-collapsed", String(newState));
      return newState;
    });
  };

  return (
    // Wrapper Utama: Background sedikit abu-abu agar Sidebar (Putih) terlihat menonjol ("Pop")
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex font-sans text-foreground">
      
      {/* 1. SIDEBAR (Fixed Position) */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        toggleSidebar={toggleSidebar} 
      />

      {/* 2. AREA KANAN (Header + Konten) */}
      {/* Margin kiri (ml) menyesuaikan lebar sidebar */}
      <div 
        className={cn(
            "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
            isCollapsed ? "ml-[70px]" : "ml-64"
        )}
      >
        {/* --- HEADER STICKY --- */}
        {/* Header ini sekarang menjadi bagian dari layout kanan, jadi dia akan ikut bergeser */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/40 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* Search Bar */}
            <div className="flex flex-1 items-center gap-2 md:w-1/3">
                <div className="relative w-full max-w-[300px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search machines, alerts..."
                      className="w-full bg-slate-100/50 pl-9 border-none shadow-none focus-visible:ring-1"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-background"></span>
                </Button>
            </div>
        </header>

        {/* --- KONTEN UTAMA --- */}
        <main className="flex-1 p-6 md:p-8 pt-6">
           {/* Animasi smooth saat konten muncul */}
           <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
               {children}
           </div>
        </main>
      </div>

    </div>
  );
}