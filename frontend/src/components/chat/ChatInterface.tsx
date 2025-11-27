import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { machines, alerts } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickCommands = [
  "Show status of all machines",
  "Which machines are at risk this week?",
  "Show recent alerts",
  "Status of Turbine #1",
];

function processQuery(query: string): string {
  const lowerQuery = query.toLowerCase();

  // Status of all machines
  if (lowerQuery.includes("status") && (lowerQuery.includes("all") || lowerQuery.includes("machines"))) {
    const critical = machines.filter(m => m.status === "critical").length;
    const warning = machines.filter(m => m.status === "warning").length;
    const normal = machines.filter(m => m.status === "normal").length;
    
    let response = `📊 **Machine Status Overview**\n\n`;
    response += `- 🔴 **Critical**: ${critical} machine(s)\n`;
    response += `- 🟡 **At Risk**: ${warning} machine(s)\n`;
    response += `- 🟢 **Normal**: ${normal} machine(s)\n\n`;
    
    if (critical > 0) {
      const criticalMachines = machines.filter(m => m.status === "critical");
      response += `⚠️ **Critical Machines:**\n`;
      criticalMachines.forEach(m => {
        response += `- ${m.name}: Health ${m.healthScore}%, predicted failure in ${m.nextPredictedFailure}\n`;
      });
    }
    return response;
  }

  // Machines at risk
  if (lowerQuery.includes("risk") || lowerQuery.includes("at risk")) {
    const atRisk = machines.filter(m => m.status === "warning" || m.status === "critical");
    if (atRisk.length === 0) {
      return "✅ Great news! No machines are currently at risk.";
    }
    let response = `⚠️ **Machines at Risk This Week:**\n\n`;
    atRisk.forEach(m => {
      response += `**${m.name}**\n`;
      response += `- Status: ${m.status === "critical" ? "🔴 Critical" : "🟡 Warning"}\n`;
      response += `- Health Score: ${m.healthScore}%\n`;
      response += `- Failure Type: ${m.failureType}\n`;
      if (m.nextPredictedFailure) {
        response += `- Predicted Failure: ${m.nextPredictedFailure}\n`;
      }
      response += `\n`;
    });
    return response;
  }

  // Recent alerts
  if (lowerQuery.includes("alert") || lowerQuery.includes("alerts")) {
    const recentAlerts = alerts.slice(0, 3);
    let response = `🔔 **Recent Alerts:**\n\n`;
    recentAlerts.forEach(a => {
      const priorityEmoji = a.priority === "critical" ? "🔴" : a.priority === "high" ? "🟠" : a.priority === "medium" ? "🟡" : "🟢";
      response += `${priorityEmoji} **${a.type}**\n`;
      response += `- Machine: ${a.machineName}\n`;
      response += `- Message: ${a.message}\n`;
      response += `- Action: ${a.recommendedAction}\n\n`;
    });
    return response;
  }

  // Specific machine status
  const machineMatch = machines.find(m => 
    lowerQuery.includes(m.name.toLowerCase()) || 
    lowerQuery.includes(m.id.toLowerCase())
  );
  
  if (machineMatch) {
    const statusEmoji = machineMatch.status === "critical" ? "🔴" : machineMatch.status === "warning" ? "🟡" : "🟢";
    let response = `**${machineMatch.name}** ${statusEmoji}\n\n`;
    response += `- **Location**: ${machineMatch.location}\n`;
    response += `- **Status**: ${machineMatch.status.charAt(0).toUpperCase() + machineMatch.status.slice(1)}\n`;
    response += `- **Health Score**: ${machineMatch.healthScore}%\n`;
    response += `- **Last Maintenance**: ${machineMatch.lastMaintenance}\n`;
    if (machineMatch.nextPredictedFailure) {
      response += `- **⚠️ Predicted Failure**: ${machineMatch.nextPredictedFailure}\n`;
      response += `- **Failure Type**: ${machineMatch.failureType}\n`;
    }
    response += `\n**Sensor Readings:**\n`;
    machineMatch.sensors.forEach(s => {
      const trendIcon = s.trend === "up" ? "📈" : s.trend === "down" ? "📉" : "➡️";
      response += `- ${s.name}: ${s.value} ${s.unit} ${trendIcon}\n`;
    });
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
    <Card className="shadow-card h-[calc(100vh-180px)] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Maintenance Copilot
        </CardTitle>
      </CardHeader>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3 text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
              {message.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <CardContent className="p-4 border-t">
        {/* Quick Commands */}
        <div className="flex flex-wrap gap-2 mb-3">
          {quickCommands.map((cmd) => (
            <Button
              key={cmd}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleSend(cmd)}
            >
              {cmd}
            </Button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask about machine status, alerts, or maintenance..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
          />
          <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}