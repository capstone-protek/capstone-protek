/* eslint-disable react-refresh/only-export-components */
import  { createContext, useContext, useState, useEffect } from 'react';
import  type { ReactNode } from 'react';
import { dashboardService } from "@/services/api";

// Tipe Data Message
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
      if (saved) {
        try { return JSON.parse(saved); } catch { return []; }
      }
    }
    return [{
      id: 'init',
      role: 'assistant',
      text: "Halo! Saya Protek Copilot. Ada yang bisa saya bantu? 🤖",
      timestamp: new Date().toISOString()
    }];
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async (input: string) => {
    if (!input.trim() || isLoading) return;

    // 1. Tambah pesan User ke UI
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 2. Panggil API Backend
      const data = await dashboardService.sendMessage(input);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.reply || "Maaf, saya tidak mengerti respon server.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error("Chat Error:", error);
      
      // 3. Tangani Error (Termasuk 500)
      let errorMessage = "Maaf, terjadi kesalahan koneksi.";
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 500) {
            errorMessage = "⚠️ Server Backend sedang gangguan (Error 500). Coba lagi nanti.";
        } else if (error.code === "ERR_NETWORK") {
            errorMessage = "⚠️ Tidak bisa menghubungi server. Cek koneksi internet.";
        }
      }

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: errorMessage,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
      const resetMsg: Message[] = [{
          id: Date.now().toString(),
          role: 'assistant',
          text: "Riwayat percakapan telah dibersihkan. 🧹",
          timestamp: new Date().toISOString()
      }];
      setMessages(resetMsg);
  };

  return (
    <ChatContext.Provider value={{ messages, isLoading, sendMessage, clearHistory }}>
      {children}
    </ChatContext.Provider>
  );
}

// Tambahkan import axios untuk pengecekan error di atas
import axios from 'axios'; 

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}