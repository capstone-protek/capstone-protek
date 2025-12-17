import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  // State Sidebar dengan Lazy Initialization (Cek localStorage saat awal load saja)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarCollapsed");
      return saved === "true";
    }
    return false;
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      // Simpan state baru ke localStorage langsung saat tombol ditekan
      localStorage.setItem("sidebarCollapsed", String(newState));
      return newState;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans">
      
      {/* 1. SIDEBAR */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        toggleSidebar={toggleSidebar} 
      />

      {/* 2. WRAPPER KANAN (Header + Konten) */}
      <div 
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          isCollapsed ? "ml-[100px]" : "ml-72"
        )}
      >
        
        {/* 3. HEADER (Sticky) */}
        <Header />

        {/* 4. MAIN CONTENT */}
        <main className="flex-1 p-6 md:p-8 pt-6">
           <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
               {children}
           </div>
        </main>

      </div>
    </div>
  );
}