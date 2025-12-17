import { NavLink, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Settings, 
  Activity, 
  MessageSquare, 
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/protek-logo.svg";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Alerts", href: "/alerts", icon: AlertTriangle },
  { name: "Machines", href: "/machines", icon: Activity },
  { name: "Copilot", href: "/chat", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-card shadow-sm transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[70px]" : "w-64"
      )}
    >
      {/* HEADER LOGO */}
      <div className="flex h-16 items-center justify-center border-b border-border/50 px-2">
        <Link to="/" className="flex items-center gap-1 overflow-hidden">
          {/* Logo Icon Wrapper */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center ">
             <img src={logo} className="h-6 w-6" alt="Logo" />
          </div>
          
          {/* Logo Text */}
          <div className={cn(
            "flex flex-col overflow-hidden transition-all duration-300",
            isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 pl-2"
          )}>
            <span className="font-bold text-2xl leading-none tracking-tight">Protek</span>
          </div>
        </Link>
      </div>

      {/* NAVIGATION ITEMS */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-6 overflow-x-hidden">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out relative",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                isCollapsed ? "justify-center px-0" : "justify-start gap-3"
              )
            }
            title={isCollapsed ? item.name : ""} // Tooltip native browser sederhana
          >
            <item.icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-105", isCollapsed && "h-6 w-6")} />
            
            <span className={cn(
              "whitespace-nowrap transition-all duration-300 overflow-hidden",
              isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
            )}>
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* FOOTER & TOGGLE */}
      <div className="border-t border-border/50 p-3 space-y-2">
        <Link
            to="/support"
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all",
              isCollapsed ? "justify-center" : "gap-3"
            )}
            title="Support"
        >
             <HelpCircle className="h-5 w-5 shrink-0" />
             <span className={cn(
              "whitespace-nowrap transition-all duration-300 overflow-hidden",
              isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
            )}>
              Support
            </span>
        </Link>

        {/* Toggle Button */}
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={cn(
                "w-full flex items-center text-muted-foreground hover:text-foreground mt-2",
                isCollapsed ? "justify-center" : "justify-between px-3"
            )}
        >
            {!isCollapsed && <span className="text-xs">Collapse</span>}
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}