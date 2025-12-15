import { AppLayout } from "@/components/layout/AppLayout";
import { MachineStatusGrid } from "@/components/dashboard/MachineStatusGrid";

const Machines = () => {
  return (
    <AppLayout>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            All Machines
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Monitor real-time status and health of all industrial assets.
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <MachineStatusGrid />
    </AppLayout>
  );
};

export default Machines;