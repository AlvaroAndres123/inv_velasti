'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, Package, ArrowLeftRight, Truck, Menu, LogOut, UserCircle } from 'lucide-react';

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Inicio', icon: <Home size={20} /> },
    { href: '/productos', label: 'Productos', icon: <Package size={20} /> },
    { href: '/movimientos', label: 'Movimientos', icon: <ArrowLeftRight size={20} /> },
    { href: '/proveedores', label: 'Proveedores', icon: <Truck size={20} /> },
  ];

  // Cierra el sidebar móvil al cambiar de ruta
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Botón hamburguesa visible solo en móvil */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 text-white bg-black p-2 rounded shadow"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu size={20} />
      </button>

      {/* Overlay móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-black text-white z-50 transition-transform duration-300 w-64 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col justify-between h-full">
          {/* Logo + navegación */}
          <div className="p-6 pt-8">
            {/* Logo + cerrar botón en móvil */}
            <div className="flex items-center justify-between mb-8 md:mb-10">
              <h2 className="text-3xl font-bold text-blue-400 " style={{ fontFamily: 'AdamBold' }}>AlmaSoft</h2>
              <button
                className="md:hidden text-white"
                onClick={() => setMobileOpen(false)}
              >
                <Menu size={20} />
              </button>
            </div>

            {/* Navegación */}
            <nav className="space-y-2">
              {links.map((link) => (
                <SidebarLink
                  key={link.href}
                  href={link.href}
                  icon={link.icon}
                  label={link.label}
                  active={pathname === link.href}
                />
              ))}
            </nav>
          </div>

          {/* Footer usuario */}
          <div className="p-6 text-sm border-t border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <UserCircle size={20} />
              <span>Jesua Casco</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-white">
              <LogOut size={16} />
              <span>Cerrar sesión</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-blue-600 text-white font-semibold'
          : 'text-white hover:text-blue-300 hover:bg-white/10'
      }`}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}
