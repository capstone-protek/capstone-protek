import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-6 backdrop-blur-xl transition-all">
      
      {/* Bagian Kiri: Judul & Subjudul */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground hidden sm:block">
          Welcome back! Here's your equipment overview.
        </p>
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