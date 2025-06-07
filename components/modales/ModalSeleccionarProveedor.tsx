"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface ModalSeleccionarProveedorProps {
  abierto: boolean;
  onClose: () => void;
  proveedores: { id: number; nombre: string }[];
  onSeleccionar: (proveedorId: number) => void;
}

export default function ModalSeleccionarProveedor({
  abierto,
  onClose,
  proveedores,
  onSeleccionar,
}: ModalSeleccionarProveedorProps) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = proveedores.filter((prov) =>
    prov.nombre.toLowerCase().includes(busqueda.toLowerCase())
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
          {filtrados.map((proveedor) => (
            <div
              key={proveedor.id}
              className="px-4 py-2 bg-gray-100 rounded hover:bg-blue-100 cursor-pointer transition"
              onClick={() => {
                onSeleccionar(proveedor.id); 
                onClose();
              }}
            >
              {proveedor.nombre}
            </div>
          ))}

          {filtrados.length === 0 && (
            <p className="text-center text-gray-500 text-sm">
              Sin coincidencias
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
