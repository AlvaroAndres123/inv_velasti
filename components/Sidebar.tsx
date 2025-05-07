import { Home, Package, Download, Upload } from "lucide-react"; 

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen fixed bg-black text-white flex flex-col justify-between shadow-lg">
      <div className="p-6">
      <h2 className="text-3xl font-bold text-blue-400 mb-8" style={{ fontFamily: 'AdamBold' }}>
  AlmaSoft
</h2>

        <nav className="space-y-4">
          <SidebarLink href="/" icon={<Home size={18} />} label="Inicio" />
          <SidebarLink href="/productos" icon={<Package size={18} />} label="Productos" />
          <SidebarLink href="/entradas" icon={<Download size={18} />} label="Entradas" />
          <SidebarLink href="/salidas" icon={<Upload size={18} />} label="Salidas" />
        </nav>
      </div>
      <div className="p-6 text-sm text-gray-400">
        <p>© 2025 AlmaSoft App</p>
      </div>
    </aside>
  );
}

function SidebarLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center space-x-3 text-white hover:text-blue-400 transition-colors px-2 py-2 rounded hover:bg-white/10"
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}
