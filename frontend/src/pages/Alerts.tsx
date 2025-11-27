import { AppLayout } from "@/components/layout/AppLayout";
import { AlertList } from "@/components/alerts/AlertList";

const Alerts = () => {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Alert Center</h1>
        <p className="text-muted-foreground">
          Monitor and manage all maintenance alerts and warnings
        </p>
      </div>
      <AlertList />
    </AppLayout>
  );
};

export default Alerts;