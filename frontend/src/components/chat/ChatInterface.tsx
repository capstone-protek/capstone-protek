import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockMachines as machines, mockAlerts as alerts, mockMachineDetails } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestions = [
  "Show machines with critical status",
  "What's the status of Turbine #12?",
  "List all alerts from the last 24 hours",
  "Which machines need maintenance this week?",
];

function processQuery(query: string): string {
  const lowerQuery = query.toLowerCase();

  // Status of all machines (using contract statuses)
  if (lowerQuery.includes("status") && (lowerQuery.includes("all") || lowerQuery.includes("machines"))) {
    const critical = machines.filter(m => m.status === "CRITICAL").length;
    const warning = machines.filter(m => m.status === "WARNING").length;
    const healthy = machines.filter(m => m.status === "HEALTHY").length;

    let response = `📊 **Machine Status Overview**\n\n`;
    response += `- 🔴 **Critical**: ${critical} machine(s)\n`;
    response += `- 🟡 **At Risk**: ${warning} machine(s)\n`;
    response += `- 🟢 **Healthy**: ${healthy} machine(s)\n\n`;

    if (critical > 0) {
      const criticalMachines = machines.filter(m => m.status === "CRITICAL");
      response += `⚠️ **Critical Machines:**\n`;
      criticalMachines.forEach(m => {
        // derive a simple health score
        const healthScore = m.status === "HEALTHY" ? 90 : m.status === "WARNING" ? 60 : m.status === "CRITICAL" ? 30 : 0;
        response += `- ${m.name} (${m.asetId}): Health ${healthScore}%\n`;
      });
    }
    return response;
  }

  // Machines at risk
  if (lowerQuery.includes("risk") || lowerQuery.includes("at risk")) {
    const atRisk = machines.filter(m => m.status === "WARNING" || m.status === "CRITICAL");
    if (atRisk.length === 0) {
      return "✅ Great news! No machines are currently at risk.";
    }
    let response = `⚠️ **Machines at Risk This Week:**\n\n`;
    atRisk.forEach(m => {
      const healthScore = m.status === "HEALTHY" ? 90 : m.status === "WARNING" ? 60 : m.status === "CRITICAL" ? 30 : 0;
      response += `**${m.name}** (${m.asetId})\n`;
      response += `- Status: ${m.status}\n`;
      response += `- Health Score: ${healthScore}%\n`;
      response += `\n`;
    });
    return response;
  }

  // Recent alerts
  if (lowerQuery.includes("alert") || lowerQuery.includes("alerts")) {
    const recentAlerts = alerts.slice(0, 3);
    let response = `🔔 **Recent Alerts:**\n\n`;
    recentAlerts.forEach(a => {
      const priorityEmoji = a.priority === "KRITIS" ? "🔴" : a.priority === "TINGGI" ? "🟠" : a.priority === "SEDANG" ? "🟡" : "🟢";
      response += `${priorityEmoji} **${a.diagnosis}**\n`;
      response += `- Machine: ${a.asetId}\n`;
      response += `- Probability: ${(a.probabilitas * 100).toFixed(1)}%\n\n`;
    });
    return response;
  }

  // Specific machine status - try to use detailed mock data if available
  const machineMatch = machines.find(m => 
    lowerQuery.includes(m.name.toLowerCase()) || 
    lowerQuery.includes(m.asetId.toLowerCase())
  );
  
  if (machineMatch) {
    const machineDetail = mockMachineDetails[machineMatch.asetId];
    const statusEmoji = machineMatch.status === "CRITICAL" ? "🔴" : machineMatch.status === "WARNING" ? "🟡" : "🟢";
    let response = `**${machineMatch.name}** ${statusEmoji}\n\n`;
    response += `- **Asset ID**: ${machineMatch.asetId}\n`;
    response += `- **Status**: ${machineMatch.status}\n`;
    const healthScore = machineMatch.status === "HEALTHY" ? 90 : machineMatch.status === "WARNING" ? 60 : machineMatch.status === "CRITICAL" ? 30 : 0;
    response += `- **Health Score**: ${healthScore}%\n`;
    if (machineDetail) {
      response += `- **Last Reading**: ${machineDetail.lastReading.timestamp}\n`;
      response += `\n**Sensor Readings:**\n`;
      const r = machineDetail.lastReading;
      response += `- airTemp: ${r.airTemp}°C\n`;
      response += `- processTemp: ${r.processTemp}°C\n`;
      response += `- rpm: ${r.rpm}\n`;
      response += `- torque: ${r.torque}\n`;
      response += `- toolWear: ${r.toolWear}\n`;
    }
    return response;
  }

  // Default response
  return `I understand you're asking about: "${query}"\n\nI can help you with:\n- Machine status queries (e.g., "Show status of all machines")\n- Risk assessment (e.g., "Which machines are at risk?")\n- Alert information (e.g., "Show recent alerts")\n- Specific machine details (e.g., "Status of Turbine #1")\n\nPlease try one of these queries!`;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your Maintenance Copilot. I can help you query machine status, check alerts, and provide maintenance recommendations. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (message?: string) => {
    const query = message || input;
    if (!query.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate processing delay
    setTimeout(() => {
      const response = processQuery(query);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
    {/* Header */}
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Copilot</h1>
      <p className="text-muted-foreground">
        Ask questions about your machines and get intelligent insights
      </p>
    </div>

    {/* Chat Container */}
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
      {/* Messages */}
      <ScrollArea className="flex-1 p-6">
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
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 animate-pulse text-primary" />
              </div>
              <div className="max-w-[80%] rounded-lg bg-secondary px-4 py-3">
                <p className="text-sm text-muted-foreground">Analyzing...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggestions (shown when no messages) */}
      {messages.length === 1 && (
        <div className="border-t border-border p-4">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Suggested queries:
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="justify-start text-left"
                onClick={() => handleSend(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about machine status, alerts, or maintenance..."
            disabled={isLoading}
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