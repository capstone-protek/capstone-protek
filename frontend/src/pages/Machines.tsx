import { AppLayout } from "@/components/layout/AppLayout";
import { MachineStatusGrid } from "@/components/dashboard/MachineStatusGrid";

const Machines = () => {
  return (
    <AppLayout>
      <MachineStatusGrid />
    </AppLayout>
  );
};

export default Machines;

