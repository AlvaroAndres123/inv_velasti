'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Home, Package, ArrowLeftRight, Truck, LogOut, UserCircle } from 'lucide-react';

const links = [
  { href: '/', label: 'Inicio', icon: <Home size={20} /> },
  { href: '/productos', label: 'Productos', icon: <Package size={20} /> },
  { href: '/movimientos', label: 'Movimientos', icon: <ArrowLeftRight size={20} /> },
  { href: '/proveedores', label: 'Proveedores', icon: <Truck size={20} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<{ nombre: string } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('usuario');
    if (userData) {
      try {
        setUsuario(JSON.parse(userData));
      } catch (err) {
        console.error('Error al leer el usuario:', err);
      }
    }
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-black text-white flex flex-col justify-between z-40">
      <div className="p-6">
        <h2 className="text-3xl font-bold text-blue-400 mb-10">AlmaSoft</h2>
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

      {/* Footer con datos del usuario */}
      <div className="p-6 text-sm border-t border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <UserCircle size={20} />
          <span>{usuario?.nombre ?? 'Usuario'}</span>
        </div>
        <button
          onClick={cerrarSesion}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-xs"
        >
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>
    </aside>
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
