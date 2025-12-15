import { AppLayout } from "@/components/layout/AppLayout";
import { MachineStatusGrid } from "@/components/dashboard/MachineStatusGrid";

const Machines = () => {
  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-5xl font-extrabold text-foreground mb-3 tracking-tight">
            All Machines
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            View and monitor all machines in the system
          </p>
        </div>
      </div>

      <MachineStatusGrid />
    </AppLayout>
  );
};

export default Machines;

