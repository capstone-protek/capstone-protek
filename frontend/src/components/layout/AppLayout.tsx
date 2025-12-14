import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  // State untuk mengontrol buka/tutup sidebar
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      
      {/* 1. SIDEBAR (Terima props state) */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        toggleSidebar={() => setIsCollapsed(!isCollapsed)} 
      />

      {/* 2. MAIN CONTENT WRAPPER */}
      {/* Margin kiri (ml) akan berubah sesuai lebar sidebar */}
      <main 
        className={cn(
            "transition-all duration-300 ease-in-out min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900",
            isCollapsed ? "ml-[80px]" : "ml-64"
        )}
      >
        {/* Header Dashboard */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Machine Monitoring</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Overview • Notifications • Machine Health</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">24 Aug - 15 Dec, 2024</span>
              <Button variant="outline" size="sm" className="text-xs">
                Filter
              </Button>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-xs">
                Add Machine
              </Button>
            </div>
          </div>
        </header>

        {/* Isi Halaman */}
        <div className="p-8 fade-in animate-in duration-500 flex-1">
           {children}
        </div>
      </main>

    </div>
  );
}