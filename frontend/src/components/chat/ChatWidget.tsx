import { useState, useRef, useEffect } from "react";
import { useChat } from "@/context/ChatContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, X, Send, BrainCog, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
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

export function ChatWidget() {
  const { messages, isLoading, sendMessage } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4 font-sans">
      {isOpen && (
        <Card className="w-[350px] h-[500px] shadow-2xl border-primary/20 flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300">
          <CardHeader className="bg-primary text-primary-foreground p-4 rounded-t-lg flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <div className="bg-white/24 p-1.5 rounded-full flex items-center justify-center text-primary-foreground">
                <BrainCog className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-transparent text-primary-foreground ">Protek Copilot</CardTitle>
                <p className="text-xs opacity-80">AI Maintenance Assistant</p>
              </div>
            </div>
            <div className="flex gap-1">
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
                  <AlertDialogAction onClick={() => setIsOpen(false)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Ya, Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
                <Button variant="ghost" size="icon" className="hover:bg-white/20 h-8 w-8 text-primary-foreground" onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex w-max max-w-[85%] flex-col gap-2 rounded-lg px-3 py-2 text-sm shadow-sm", msg.role === 'user' ? "ml-auto bg-primary text-primary-foreground rounded-tr-none" : "bg-white dark:bg-card border border-border text-foreground rounded-tl-none")}>
                {/* Fix: Hapus destructuring 'node' */}
                <ReactMarkdown components={{ p: (props) => <p className="m-0" {...props} /> }}>
                    {msg.text}
                </ReactMarkdown>
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
            <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
              <Input placeholder="Tanya kondisi mesin..." value={input} onChange={(e) => setInput(e.target.value)} disabled={isLoading} className="flex-1" />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      <Button onClick={() => setIsOpen(!isOpen)} size="icon" className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95">
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </Button>
    </div>
  );
}