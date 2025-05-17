'use client';

import { usePathname } from 'next/navigation';
import { Home, Package, Download, Menu, ArrowLeftRight, Truck } from 'lucide-react';
import { useState } from 'react';






export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

const links = [
  { href: '/', label: 'Inicio', icon: <Home size={20} /> },
  { href: '/productos', label: 'Productos', icon: <Package size={20} /> },
  { href: '/movimientos', label: 'Movimientos', icon: <ArrowLeftRight size={20} /> },
  { href: '/proveedores', label: 'Proveedores', icon: <Truck size={20} /> },
];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 text-white bg-black p-2 rounded shadow"
        onClick={() => setOpen(!open)}
      >
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-black text-white flex flex-col justify-between z-40 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6">
          <h2 className="text-3xl font-bold text-blue-400 mb-10" style={{ fontFamily: 'AdamBold' }}>
            AlmaSoft
          </h2>
          <nav className="space-y-2">
            {links.map((link) => (
              <SidebarLink
                key={link.href}
                href={link.href}
                icon={link.icon}
                label={link.label}
                active={pathname === link.href}
                onClick={() => setOpen(false)}
              />
            ))}
          </nav>
        </div>

        <div className="p-6 text-xs text-gray-400 border-t border-white/10">
          <p>© 2025 AlmaSoft App</p>
        </div>
      </aside>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}
    </>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-white/10 text-blue-400 font-semibold'
          : 'text-white hover:text-blue-400 hover:bg-white/10'
      }`}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}
