import { Sidebar } from './Sidebar';

export function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar/>
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
