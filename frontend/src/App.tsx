import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Alerts from "./pages/Alerts";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import Machines from "./pages/Machines";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import MachineDetailPage from "./pages/MachineDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar/>
        <div className="flex-1 pl-64 bg-background">
          <Header />
          <main className="p-6 pt-12 bg-background">
           <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/machines" element={<Machines />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/machines" element={<MachineDetailPage />} />
              <Route path="/machine/:asetId" element={<MachineDetailPage />} />
              <Route path="*" element={<NotFound />} />
           </Routes>
          </main>
        </div>
      </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  
);

export default App;