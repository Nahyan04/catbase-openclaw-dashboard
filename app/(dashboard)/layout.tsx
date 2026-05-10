import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-bg-parchment">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-bg-parchment dotted-pixel-bg">
        {children}
      </main>
    </div>
  );
}
