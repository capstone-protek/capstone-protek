import { useState, useRef, useEffect } from "react";
import { useChat } from "@/context/ChatContext"; 
import { Send, BrainCog, User, Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import { toast } from "sonner";

// 1. IMPORT KOMPONEN ALERT DIALOG
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const suggestions = [
  "Bagaimana status semua mesin?",
  "Apakah ada mesin yang kritis?",
  "Tampilkan alert terbaru",
  "Kondisi mesin M-14850",
];

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
    if (!text.trim()) return; 
    sendMessage(text);
    setInput("");
  };

  // 2. FUNGSI EKSEKUSI HAPUS (Dijalankan setelah user klik "Ya, Hapus")
  const executeClearChat = () => {
    clearHistory();
    toast.success("Riwayat percakapan telah dibersihkan.", {
      position: "top-center",
      duration: 3000,
    });
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
       <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card relative">
        
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6"> 
          <div className="space-y-6">
            
            {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground mt-10 opacity-50">
                    <BrainCog className="h-12 w-12 mb-2" />
                    <p>Mulai percakapan dengan Protek Copilot</p>
                </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <BrainCog className="h-5 w-5 text-primary" />
                  </div>
                )}
                
                <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}>
                  <div className="text-sm leading-relaxed prose dark:prose-invert max-w-none">
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
                  <BrainCog className="h-5 w-5 animate-pulse text-primary" />
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
        {messages.length <= 1 && (
          <div className="border-t border-border p-4 bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Rekomendasi Pertanyaan:</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {suggestions.map((s, i) => (
                <Button key={i} variant="outline" size="sm" className="justify-start text-left h-auto py-2 whitespace-normal text-xs" onClick={() => handleSubmit(undefined, s)}>
                  {s}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-background">
          <form onSubmit={(e) => handleSubmit(e)} className="flex gap-2">
            
            {/* 3. BUNGKUS TOMBOL DELETE DENGAN ALERT DIALOG */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  disabled={messages.length === 0 || isLoading}
                  className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                    <Trash2 className="w-5 h-5" />
                </Button>
              </AlertDialogTrigger>
              
              {/* ISI MODAL KONFIRMASI (YANG MENGGANTIKAN POPUP BROWSER) */}
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus semua percakapan?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Semua riwayat chat Anda dengan Protek Copilot akan dihapus permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  {/* Klik tombol ini baru menjalankan fungsi hapus */}
                  <AlertDialogAction onClick={executeClearChat} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Ya, Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

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