import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Settings, 
  Activity, 
  MessageSquare, 
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/protek-logo.svg";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const mainNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Alerts", href: "/alerts", icon: AlertTriangle },
  { name: "Machines", href: "/machines", icon: Activity },
  { name: "Copilot", href: "/chat", icon: MessageSquare },
];

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  return (
    <aside 
      className={cn(
        "fixed left-4 top-4 bottom-4 z-40 flex flex-col rounded-2xl border border-border bg-card shadow-xl transition-all duration-300",
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* --- HEADER GABUNGAN (Logo + Toggle) --- */}
      <div className={cn(
        "flex items-center border-b border-border/50 transition-all duration-300",
        // LOGIKA UTAMA:
        // Jika Collapsed: Flex Column (atas-bawah), padding lebih besar (py-4)
        // Jika Expanded: Flex Row (kiri-kanan), tinggi fix (h-16), justify-between
        isCollapsed 
          ? "flex-col justify-center py-4 gap-4" 
          : "flex-row h-16 px-4 justify-between"
      )}>
        
        {/* 1. BAGIAN LOGO */}
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center text-primary">
               <img src={logo} className="h-10 w-10" alt="Logo" />
          </div>
          
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-2xl font-semibold text-foreground leading-none">Protek</h1>
            </div>
          )}
        </div>

        {/* 2. TOMBOL TOGGLE (PANEL) */}
        {/* Saat expanded dia di kanan, saat collapsed dia di bawah logo */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/80",
            // Tambahan animasi halus saat pindah posisi
            isCollapsed ? "mt-0" : "ml-auto"
          )}
        >
          {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>

      </div>

      {/* --- NAVIGATION ITEMS --- */}
      <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto overflow-x-hidden">
        {mainNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            title={isCollapsed ? item.name : undefined}
            className={({ isActive }) =>
              cn(
                "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isCollapsed && "justify-center px-2",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0 transition-colors" />
            {!isCollapsed && (
               <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">
                 {item.name}
               </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* --- BOTTOM SECTION --- */}
      <div className="border-t border-border px-3 py-2 space-y-1">

        <NavLink
            to="/settings"
            title={isCollapsed ? "Settings" : undefined}
            className={({ isActive }) =>
              cn(
                "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isCollapsed && "justify-center px-2",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )
            }
        >
             <Settings className="h-5 w-5 shrink-0" />
             {!isCollapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
}