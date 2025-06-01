'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ocultarSidebar = pathname === '/login';

  return (
    <div className="flex">
      {!ocultarSidebar && <Sidebar />}
      <main className="flex-1 min-h-screen bg-gray-50">{children}</main>
    </div>
  );
}
