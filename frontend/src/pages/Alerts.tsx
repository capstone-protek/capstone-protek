import { AppLayout } from "@/components/layout/AppLayout";
import { AlertList } from "@/components/alerts/AlertList";

const Alerts = () => {
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Alert Center
        </h1>
        <p className="text-muted-foreground text-lg">
          Monitor and manage all maintenance alerts and warnings
        </p>
      </div>
      <AlertList />
    </AppLayout>
  );
};

export default Alerts;