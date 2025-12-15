import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react'; // Fix: Type-only import
import { dashboardService } from "@/services/api";

// Definisi Tipe Data
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearHistory: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);
const STORAGE_KEY = "protek_chat_history";

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    }
    return [{
      id: 'init',
      role: 'assistant',
      text: "Halo! Saya Protek Copilot. Ada yang bisa saya bantu mengenai kondisi mesin hari ini? 🤖",
      timestamp: new Date().toISOString()
    }];
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async (input: string) => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const data = await dashboardService.sendMessage(input);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.reply,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat Error:", error); // Fix: Error variable used
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: "Maaf, koneksi ke server terputus.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (confirm("Hapus semua riwayat chat?")) {
        const resetMsg: Message[] = [{
            id: Date.now().toString(),
            role: 'assistant',
            text: "Riwayat percakapan telah dibersihkan. 🧹",
            timestamp: new Date().toISOString()
        }];
        setMessages(resetMsg);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, isLoading, sendMessage, clearHistory }}>
      {children}
    </ChatContext.Provider>
  );
}

// Export hook terpisah biasanya membantu fast refresh, 
// tapi jika masih error, abaikan saja (warning dev mode) selama app jalan.
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}