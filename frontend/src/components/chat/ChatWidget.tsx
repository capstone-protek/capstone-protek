import { useState, useRef, useEffect } from "react";
import { dashboardService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, X, Send, Bot, Loader2, Trash2 } from "lucide-react"; // Tambah Trash2
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  role: 'user' | 'bot';
  text: string;
  timestamp: string; // Ubah ke string biar aman di JSON
}

const STORAGE_KEY = "protek_chat_history"; // Key untuk localStorage

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // --- BARU: Initialize State dari LocalStorage ---
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    }
    // Default welcome message
    return [{
      id: 1,
      role: 'bot',
      text: "Halo! Saya Protek Copilot. Ada yang bisa saya bantu mengenai kondisi mesin hari ini? 🤖",
      timestamp: new Date().toISOString()
    }];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- BARU: Effect untuk Auto-Save ke LocalStorage ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    if (isOpen) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // --- BARU: Fungsi Hapus History ---
  const handleClearHistory = () => {
    if (confirm("Hapus semua riwayat chat?")) {
      const defaultMsg: Message[] = [{
        id: Date.now(),
        role: 'bot',
        text: "Riwayat chat telah dihapus. Ada yang bisa saya bantu lagi? 🧹",
        timestamp: new Date().toISOString()
      }];
      setMessages(defaultMsg);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMsg));
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { 
        id: Date.now(), 
        role: 'user', 
        text: input,
        timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await dashboardService.sendMessage(userMsg.text);
      
      const botMsg: Message = { 
        id: Date.now() + 1, 
        role: 'bot', 
        text: data.reply,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg: Message = { 
        id: Date.now() + 1, 
        role: 'bot', 
        text: "Maaf, koneksi ke server terputus.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4 font-sans">
      
      {isOpen && (
        <Card className="w-[350px] h-[500px] shadow-2xl border-primary/20 flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <CardHeader className="bg-primary text-primary-foreground p-4 rounded-t-lg flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="bg-tranparant text-sm font-bold text-primary-foreground/100">Protek Copilot</CardTitle>
                <p className="text-xs text-primary-foreground/80">AI Maintenance Assistant</p>
              </div>
            </div>
            
            {/* --- BARU: Tombol Hapus & Close --- */}
            <div className="flex gap-1">
                <Button 
                  variant="ghost" size="icon" 
                  className="text-primary-foreground hover:bg-white/20 h-8 w-8"
                  onClick={handleClearHistory}
                  title="Hapus Riwayat"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" size="icon" 
                  className="text-primary-foreground hover:bg-white/20 h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex w-max max-w-[85%] flex-col gap-2 rounded-lg px-3 py-2 text-sm shadow-sm",
                  msg.role === 'user'
                    ? "ml-auto bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-white dark:bg-card border border-border text-foreground rounded-tl-none"
                )}
              >
                {msg.text}
              </div>
            ))}
            
            {isLoading && (
              <div className="bg-muted w-max rounded-lg px-3 py-2 rounded-tl-none">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <CardFooter className="p-3 bg-background border-t">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex w-full items-center space-x-2"
            >
              <Input 
                placeholder="Tanya kondisi mesin..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 focus-visible:ring-primary"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </Button>
    </div>
  );
}