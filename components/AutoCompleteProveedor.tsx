// components/AutoCompleteProveedor.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function AutoCompleteProveedor({
  proveedores,
  valor,
  onSeleccion,
}: {
  proveedores: string[];
  valor: string;
  onSeleccion: (proveedor: string) => void;
}) {
  const [mostrar, setMostrar] = useState(false);
  const filtrados = proveedores.filter((p) =>
    p.toLowerCase().includes(valor.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="relative">
        <Input
          name="proveedor"
          value={valor}
          onChange={(e) => onSeleccion(e.target.value)}
          onFocus={() => setMostrar(true)}
          onBlur={() => setTimeout(() => setMostrar(false), 100)}
          placeholder="Buscar proveedor..."
          required
        />
        <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
      </div>

      {mostrar && valor && (
        <ul className="absolute z-10 bg-white border rounded mt-1 w-full max-h-40 overflow-y-auto text-sm shadow">
          {filtrados.length > 0 ? (
            filtrados.map((p, i) => (
              <li
                key={i}
                className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                onMouseDown={() => onSeleccion(p)}
              >
                {p}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-gray-500">Sin coincidencias</li>
          )}
        </ul>
      )}
    </div>
  );
}
