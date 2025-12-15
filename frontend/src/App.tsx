import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// 1. IMPORT ChatProvider
import { ChatProvider } from "@/context/ChatContext"; 

import Index from "./pages/Index";
import Alerts from "./pages/Alerts";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import Machines from "./pages/Machines";
import Integration from "./pages/Integration";
import MachineDetailPage from "./pages/MachineDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ChatProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/integration" element={<Integration />} />
            <Route path="/machines" element={<Machines />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/machine/:id" element={<MachineDetailPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ChatProvider>

    </TooltipProvider>
  </QueryClientProvider>
);

export default App;