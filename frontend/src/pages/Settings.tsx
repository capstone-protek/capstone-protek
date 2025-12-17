import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/theme";
import { 
  Moon, 
  Sun, 
  Monitor, 
  Check, 
  ChevronsUpDown 
} from "lucide-react";

// Import komponen Dropdown Shadcn
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  // Helper untuk menampilkan Icon sesuai tema yang aktif di Trigger Button
  const CurrentIcon = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  }[theme];

  return (
    <AppLayout>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Theme Preference
              </label>
              
              {/* --- DROPDOWN MENU START --- */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-[250px] justify-between px-3 font-normal"
                  >
                    <div className="flex items-center gap-2">
                      <CurrentIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{theme} Mode</span>
                    </div>
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="start" className="w-[250px]">
                  {/* Pilihan Light */}
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                    {theme === "light" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>

                  {/* Pilihan Dark */}
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                    {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>

                  {/* Pilihan System */}
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>System</span>
                    {theme === "system" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {theme === 'system' 
                ? "We'll adjust the theme based on your device settings." 
                : `Active theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)} mode.`}
            </p>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}