'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const ocultarSidebar = pathname === '/login' || pathname.startsWith('/roadmap');

  return (
    <div className="flex">
      {/* Botón hamburguesa solo en móvil y cuando el sidebar está cerrado */}
      {!ocultarSidebar && !sidebarAbierto && (
        <button
          onClick={() => setSidebarAbierto(true)}
          className="md:hidden fixed top-4 left-4 z-50 bg-black p-2 rounded text-white hover:bg-white/10 transition"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar */}
      {!ocultarSidebar && (
        <Sidebar abierto={sidebarAbierto} setAbierto={setSidebarAbierto} />
      )}

      {/* Contenido principal */}
      <div
        className={`min-h-screen p-4 sm:p-6 w-full ${
          !ocultarSidebar ? 'md:ml-64' : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
}
