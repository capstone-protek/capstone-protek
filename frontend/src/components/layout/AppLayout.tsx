import { Navbar } from "./Navbar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-muted">
      <Navbar />
      <main className="container py-6">{children}</main>
    </div>
  );
}