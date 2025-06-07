'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { ReactNode, useState } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ocultarSidebar = pathname === '/login';

  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  return (
    <div className="flex">
      {!ocultarSidebar && (
        <Sidebar
          abierto={sidebarAbierto}
          setAbierto={setSidebarAbierto}
        />
      )}
      <main className="flex-1 min-h-screen bg-gray-50">{children}</main>
    </div>
  );
}
