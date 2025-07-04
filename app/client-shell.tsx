'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const rutasPublicas = ['/login', '/roadmap'];
  const esRutaPublica = rutasPublicas.includes(pathname) || pathname.startsWith('/roadmap');
  const ocultarSidebar = esRutaPublica;

  // Validación inmediata y agresiva
  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    
    // Si no es ruta pública y no hay usuario, redirigir inmediatamente
    if (!esRutaPublica && !usuario) {
      router.replace('/login');
      return;
    }
    
    // Si es login y ya hay usuario autenticado, redirigir al dashboard
    if (esRutaPublica && usuario && pathname === '/login') {
      router.replace('/');
      return;
    }
    
    // Solo mostrar contenido si pasa todas las validaciones
    setIsLoading(false);
  }, [pathname, esRutaPublica, router]);

  // Mostrar loading mientras valida - esto evita el parpadeo
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
