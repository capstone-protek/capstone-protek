import { AppLayout } from "@/components/layout/AppLayout";

const Integration = () => {
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Integrations
        </h1>
        <p className="text-muted-foreground">
          Connect with third-party services and manage API integrations.
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Coming Soon</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Integration features are under development.
        </p>
      </div>
    </AppLayout>
  );
};

export default Integration;