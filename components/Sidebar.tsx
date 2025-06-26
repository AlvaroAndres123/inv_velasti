'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home,
  Package,
  ArrowLeftRight,
  Truck,
  LogOut,
  UserCircle,
  Settings,
  X,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Inicio', icon: <Home size={20} /> },
  { href: '/productos', label: 'Productos', icon: <Package size={20} /> },
  { href: '/movimientos', label: 'Movimientos', icon: <ArrowLeftRight size={20} /> },
  { href: '/proveedores', label: 'Proveedores', icon: <Truck size={20} /> },
  { href: '/perfil', label: 'Configuración', icon: <Settings size={20} /> },
];

export default function Sidebar({
  abierto,
  setAbierto,
}: {
  abierto: boolean;
  setAbierto: (value: boolean) => void;
}) {
  const router = useRouter();
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
    router.push('/login');
  };

  return (
    <>
      {/* Overlay en móvil */}
      {abierto && (
        <div
          onClick={() => setAbierto(false)}
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-black text-white flex flex-col justify-start z-40 transform transition-transform duration-300 ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2
            className="text-2xl font-bold text-blue-400"
            style={{ fontFamily: 'AdamBold' }}
          >
            AlmaSoft
          </h2>
          {abierto && (
            <button
              onClick={() => setAbierto(false)}
              className="md:hidden text-white p-2 rounded hover:bg-white/10 transition"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Navegación arriba */}
        <nav className="space-y-2 px-6 mt-2">
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

        {/* Footer usuario */}
        <div className="mt-auto p-6 text-sm border-t border-white/10">
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
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
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
