import { NavLink, Link } from "react-router-dom";
import { LayoutDashboard, AlertTriangle, MessageSquare, Settings, Activity, MessageCircleQuestionMark } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/protek-logo.svg";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Alerts", href: "/alerts", icon: AlertTriangle },
  { name: "Machines", href: "/machines:id", icon: Activity },
  { name: "Copilot", href: "/chat", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
      <div className="flex h-full flex-col justify-between">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-primary">
              <img src={logo} className="h-14 w-14" />
            </div>
            <div>   
              <h1 className="text-lg font-bold text-foreground">PROTEK</h1>
              <p className="text-xs text-muted-foreground">Predictive Operations & Equipment Tracker</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary shadow-glow"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("h-5 w-5 transition-all", isActive && "scale-110")} />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4">
          <Link
            to="/support"
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <MessageCircleQuestionMark className="h-5 w-5 transition-all group-hover:scale-110" />
            Support & Help
          </Link>
        </div>
      </div>
    </aside>
  );
}
