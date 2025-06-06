'use client';

import { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

export interface AutoCompleteProductoProps {
  productos: string[];
  valor: string;
  onSeleccion: (producto: string) => void;
}

export default function AutoCompleteProducto({
  productos,
  valor,
  onSeleccion,
}: AutoCompleteProductoProps) {
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(-1);
  const listaRef = useRef<HTMLUListElement>(null);

  const filtrados = productos.filter((p) =>
    p.toLowerCase().includes(valor.toLowerCase())
  );

  const manejarTeclas = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!mostrarSugerencias || filtrados.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndiceSeleccionado((prev) =>
        prev < filtrados.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndiceSeleccionado((prev) =>
        prev > 0 ? prev - 1 : filtrados.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (indiceSeleccionado >= 0) {
        onSeleccion(filtrados[indiceSeleccionado]);
        setMostrarSugerencias(false);
        setIndiceSeleccionado(-1);
      }
    } else if (e.key === 'Escape') {
      setMostrarSugerencias(false);
      setIndiceSeleccionado(-1);
    }
  };

  useEffect(() => {
    const el = listaRef.current?.children[indiceSeleccionado] as HTMLLIElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [indiceSeleccionado]);

  return (
    <div className="relative">
      <Input
        name="producto"
        value={valor}
        onChange={(e) => {
          onSeleccion(e.target.value);
          setMostrarSugerencias(true);
          setIndiceSeleccionado(-1);
        }}
        onBlur={() => setTimeout(() => setMostrarSugerencias(false), 100)}
        onKeyDown={manejarTeclas}
        placeholder="Buscar producto..."
        required
        autoComplete="off"
        className="pr-10"
      />

      {/* Icono de limpiar */}
      {valor && (
        <button
          type="button"
          onClick={() => onSeleccion('')}
          className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
        >
          <X size={18} />
        </button>
      )}

      {valor && mostrarSugerencias && (
        <ul
          ref={listaRef}
          className="absolute z-10 bg-white border rounded mt-1 w-full max-h-40 overflow-y-auto text-sm shadow"
        >
          {filtrados.length > 0 ? (
            filtrados.map((p, i) => (
              <li
                key={i}
                className={`px-3 py-2 cursor-pointer ${
                  i === indiceSeleccionado
                    ? 'bg-blue-100 text-blue-800 font-medium'
                    : 'hover:bg-blue-50'
                }`}
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
