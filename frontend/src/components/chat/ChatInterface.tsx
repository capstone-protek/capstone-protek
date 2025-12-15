// src/components/chat/ChatInterface.tsx

import { useState, useRef, useEffect } from "react";
import { useChat } from "@/context/ChatContext"; 
import { Send, Bot, User, Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';

const suggestions = [
  "Bagaimana status semua mesin?",
  "Apakah ada mesin yang kritis?",
  "Tampilkan alert terbaru",
  "Kondisi mesin M-14850",
];

// --- PERHATIKAN DI SINI ---
// Gunakan 'export function' (tanpa default) agar bisa diimport dengan { ChatInterface }
export function ChatInterface() {
  const { messages, isLoading, sendMessage, clearHistory } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();
    const text = textOverride || input;
    sendMessage(text);
    setInput("");
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      {/* ... (Isi konten sama seperti sebelumnya) ... */}
       <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card relative">
        
        {/* Tombol Clear */}
        <div className="absolute top-4 right-4 z-10">
            <Button variant="ghost" size="icon" onClick={clearHistory} title="Bersihkan Chat">
                <Trash2 className="w-5 h-5 text-muted-foreground hover:text-destructive transition-colors" />
            </Button>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6"> 
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                )}
                
                <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}>
                  <div className="text-sm leading-relaxed">
                     <ReactMarkdown components={{ p: (props) => <p className="m-0" {...props} /> }}>
                        {message.text}
                     </ReactMarkdown>
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Bot className="h-5 w-5 animate-pulse text-primary" />
                </div>
                <div className="max-w-[80%] rounded-lg bg-secondary px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sedang menganalisa...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="border-t border-border p-4 bg-background">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Rekomendasi Pertanyaan:</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {suggestions.map((s, i) => (
                <Button key={i} variant="outline" size="sm" className="justify-start text-left h-auto py-2 whitespace-normal" onClick={() => handleSubmit(undefined, s)}>
                  {s}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border p-4 bg-background">
          <form onSubmit={(e) => handleSubmit(e)} className="flex gap-2">
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