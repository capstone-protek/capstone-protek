import { AppLayout } from "@/components/layout/AppLayout";
import { ChatInterface } from "@/components/chat/ChatInterface";

const Chat = () => {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Maintenance Copilot</h1>
        <p className="text-muted-foreground">
          Ask questions about machine status, alerts, and get maintenance recommendations
        </p>
      </div>
      <ChatInterface />
    </AppLayout>
  );
};

export default Chat;