import { AppLayout } from "@/components/layout/AppLayout";
import { ChatInterface } from "@/components/chat/ChatInterface";

const Chat = () => {
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Maintenance Copilot
        </h1>
        <p className="text-muted-foreground text-lg">
          Ask questions about machine status, alerts, and get maintenance recommendations
        </p>
      </div>
      <ChatInterface />
    </AppLayout>
  );
};

export default Chat;