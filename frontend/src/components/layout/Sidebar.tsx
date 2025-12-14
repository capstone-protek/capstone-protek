import { NavLink, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Settings, 
  Activity, 
  MessageSquare, 
  MessageCircleQuestionMark,
  ChevronRight,
  PanelLeft,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/protek-logo.svg";
import { Button } from "@/components/ui/button";

// Definisikan Props yang diterima dari AppLayout
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
        "fixed left-0 top-0 z-40 h-screen bg-gray-900 transition-all duration-300 ease-in-out flex flex-col",
        isCollapsed ? "w-[80px]" : "w-64"
      )}
    >
      {/* --- HEADER LOGO --- */}
      <div className={cn(
        "flex h-16 items-center px-6 transition-all",
        isCollapsed ? "justify-center px-4" : "justify-start"
      )}>
        <Link to="/" className="flex items-center gap-3 overflow-hidden">
          {/* Container Logo Icon */}
          <div className="flex h-8 w-8 min-w-[32px] items-center justify-center rounded-lg bg-purple-600">
            <img src={logo} className="h-5 w-5" alt="Apexify Logo" />
          </div>
          
          {/* Logo Text - Hilang saat collapsed */}
          <div className={cn(
            "transition-all duration-300 overflow-hidden whitespace-nowrap",
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            <h1 className="text-xl font-bold text-white tracking-tight">Protek</h1>
          </div>
        </Link>
      </div>

      {/* --- NAVIGATION LINKS --- */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-x-hidden">
        {navigation.map((item, index) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all relative",
                // Hover & Active States
                isActive
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white",
                // Layout saat collapsed vs expanded
                isCollapsed ? "justify-center" : "gap-3",
                // Special styling untuk Dashboard (first item)
                index === 0 && isActive && "bg-gradient-to-r from-purple-600 to-purple-500"
              )
            }
          >
            {/* Tooltip Hover saat Collapsed */}
            {isCollapsed && (
                <div className="absolute left-16 z-50 rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none whitespace-nowrap">
                    {item.name}
                </div>
            )}

            <item.icon 
                className={cn(
                    "h-5 w-5 flex-shrink-0 transition-all", 
                )} 
            />
            
            {/* Label Text */}
            <span className={cn(
              "whitespace-nowrap transition-all duration-300 overflow-hidden",
              isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
            )}>
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* --- FOOTER & TOGGLE --- */}
      <div className="border-t border-gray-800 p-4 flex flex-col gap-3">
        {/* Analytics Card - hanya tampil saat expanded */}
        {!isCollapsed && (
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs font-medium">Get detailed analytics for free</span>
            </div>
            <p className="text-xs text-purple-100 mb-3">
              Boost your machine monitoring with our analytics
            </p>
            <Button 
              size="sm" 
              className="w-full bg-white text-purple-600 hover:bg-gray-100 text-xs font-medium"
            >
              Upgrade Now
            </Button>
          </div>
        )}

        {/* Support Link */}
        <Link
          to="/support"
          className={cn(
            "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-all",
            isCollapsed ? "justify-center" : "gap-3"
          )}
          title={isCollapsed ? "Support" : ""}
        >
          <MessageCircleQuestionMark className="h-5 w-5 flex-shrink-0" />
          <span className={cn(
              "whitespace-nowrap transition-all duration-300 overflow-hidden",
              isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
            )}>
            Support
          </span>
        </Link>

        {/* Dark Mode Toggle */}
        <div className={cn(
          "flex items-center gap-3 px-3 py-2",
          isCollapsed && "justify-center"
        )}>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Dark Mode</span>
            <div className="w-8 h-4 bg-purple-600 rounded-full relative">
              <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 right-0.5"></div>
            </div>
          </div>
        </div>

        {/* Tombol Toggle Buka/Tutup */}
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleSidebar}
            className={cn(
                "w-full hover:bg-gray-800 text-gray-400 hover:text-white",
                isCollapsed ? "px-0" : "justify-between"
            )}
        >
            {!isCollapsed && <span className="text-xs font-normal">Collapse</span>}
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}