import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Trash2 } from "lucide-react"; // Tambah Trash2
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { dashboardService } from "@/services/api"; 

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string; // String untuk support JSON
}

const suggestions = [
  "Bagaimana status semua mesin?",
  "Apakah ada mesin yang kritis?",
  "Tampilkan alert terbaru",
  "Kondisi mesin M-14850",
];

const STORAGE_KEY = "protek_chat_history"; // Samakan key dengan widget agar sinkron

export function ChatInterface() {
  // --- BARU: Load from LocalStorage ---
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        // Mapping sedikit karena struktur ID/Role di widget vs interface mungkin beda dikit
        // Tapi logic utamanya sama: ambil JSON
        return JSON.parse(saved);
      }
    }
    return [{
      id: "1",
      role: "assistant",
      content: "Halo! Saya Maintenance Copilot. Saya terhubung langsung ke data sensor pabrik. Ada yang bisa saya bantu?",
      timestamp: new Date().toISOString(),
    }];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- BARU: Save to LocalStorage ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // --- BARU: Clear History ---
  const handleClear = () => {
    if(confirm("Apakah Anda yakin ingin menghapus semua riwayat chat?")) {
        const resetMsg: Message[] = [{
            id: Date.now().toString(),
            role: "assistant",
            content: "Riwayat percakapan telah dibersihkan.",
            timestamp: new Date().toISOString(),
        }];
        setMessages(resetMsg);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resetMsg));
    }
  }

  const handleSend = async (message?: string) => {
    const query = message || input;
    if (!query.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await dashboardService.sendMessage(query);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Maaf, terjadi gangguan koneksi ke server.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card relative">
        
        {/* --- BARU: Tombol Clear History Melayang di Kanan Atas --- */}
        <div className="absolute top-4 right-4 z-10">
            <Button variant="ghost" size="icon" onClick={handleClear} title="Bersihkan Chat">
                <Trash2 className="w-5 h-5 text-muted-foreground hover:text-destructive transition-colors" />
            </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}> 
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Bot className="h-5 w-5 animate-pulse text-primary" />
                </div>
                <div className="max-w-[80%] rounded-lg bg-secondary px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sedang menganalisa data pabrik...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="border-t border-border p-4">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Pertanyaan Rekomendasi:
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto py-2 whitespace-normal"
                  onClick={() => handleSend(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="border-t border-border p-4">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya tentang status mesin..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}