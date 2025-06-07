'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface ModalSeleccionarProveedorProps {
  abierto: boolean;
  onClose: () => void;
  proveedores: string[];
  onSeleccionar: (proveedor: string) => void;
}

export default function ModalSeleccionarProveedor({
  abierto,
  onClose,
  proveedores,
  onSeleccionar,
}: ModalSeleccionarProveedorProps) {
  const [busqueda, setBusqueda] = useState('');

  const filtrados = proveedores.filter((prov) =>
    prov.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Dialog open={abierto} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Seleccionar proveedor</DialogTitle>
        </DialogHeader>

        <Input
          type="text"
          placeholder="Buscar proveedor..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="mb-4"
        />

        <div className="max-h-60 overflow-y-auto space-y-2">
          {filtrados.map((proveedor, i) => (
            <div
              key={i}
              className="px-4 py-2 bg-gray-100 rounded hover:bg-blue-100 cursor-pointer transition"
              onClick={() => {
                onSeleccionar(proveedor);
                onClose();
              }}
            >
              {proveedor}
            </div>
          ))}

          {filtrados.length === 0 && (
            <p className="text-center text-gray-500 text-sm">Sin coincidencias</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
