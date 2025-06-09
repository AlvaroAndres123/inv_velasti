"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Proveedor {
  id: number;
  nombre: string;
  contacto: string;
  telefono: string;
  correo: string;
  direccion: string;
}

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [proveedorActual, setProveedorActual] = useState<Proveedor | null>(
    null
  );
  const [busqueda, setBusqueda] = useState("");
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("usuario");
    if (!user) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
  fetch("/api/proveedores")
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setProveedores(data);
      } else {
        console.error("La respuesta no es un array:", data);
      }
    })
    .catch((err) => {
      console.error("Error al cargar proveedores", err);
    });
}, []);


  const abrirModalAgregar = () => {
    setProveedorActual(null);
    setModoEdicion(false);
    setModalAbierto(true);
  };

  const abrirModalEditar = (prov: Proveedor) => {
    setProveedorActual(prov);
    setModoEdicion(true);
    setModalAbierto(true);
  };

const guardarProveedor = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const form = e.currentTarget;

  const proveedor = {
    nombre: (form.nombre as any).value,
    contacto: (form.contacto as any).value,
    telefono: (form.telefono as any).value,
    correo: (form.correo as any).value,
    direccion: (form.direccion as any).value,
  };

  try {
    const res = await fetch(
      proveedorActual
        ? `/api/proveedores/${proveedorActual.id}` // PUT necesita el ID en la URL
        : '/api/proveedores',                     // POST es como siempre
      {
        method: proveedorActual ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proveedor),
      }
    );

    const data = await res.json();

    if (res.ok) {
      if (proveedorActual) {
        setProveedores((prev) =>
          prev.map((p) => (p.id === data.id ? data : p))
        );
      } else {
        setProveedores((prev) => [...prev, data]);
      }

      setModalAbierto(false);
    } else {
      alert(data.error || 'Error al guardar proveedor');
    }
  } catch (error) {
    console.error('Error al guardar proveedor:', error);
    alert('Error al guardar proveedor');
  }
};



 const eliminarProveedor = async (id: number) => {
  try {
    const res = await fetch(`/api/proveedores/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProveedores((prev) => prev.filter((p) => p.id !== id));
    } else {
      const data = await res.json();
      alert(data.error || 'Error al eliminar proveedor');
    }
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    alert('Error al eliminar proveedor');
  }
};


  const proveedoresFiltrados = proveedores.filter((p) =>
  `${p.nombre} ${p.contacto}`.toLowerCase().includes(busqueda.toLowerCase())
);


  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Proveedores</h2>
        <Button
          onClick={abrirModalAgregar}
          className="flex gap-2 whitespace-nowrap"
        >
          <Plus size={18} /> Agregar proveedor
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Buscar por nombre o contacto"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full text-sm text-left text-gray-700 bg-white">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4">Teléfono</th>
              <th className="px-6 py-4">Correo</th>
              <th className="px-6 py-4">Dirección</th>
              <th className="px-6 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresFiltrados.map((prov) => (
              <tr key={prov.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{prov.nombre}</td>
                <td className="px-6 py-4">{prov.contacto}</td>
                <td className="px-6 py-4">{prov.telefono}</td>
                <td className="px-6 py-4">{prov.correo}</td>
                <td className="px-6 py-4">{prov.direccion}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => abrirModalEditar(prov)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => eliminarProveedor(prov.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modoEdicion ? "Editar Proveedor" : "Agregar Proveedor"}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={guardarProveedor}>
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                defaultValue={proveedorActual?.nombre}
                required
              />
            </div>
            <div>
              <Label htmlFor="contacto">Contacto</Label>
              <Input
                id="contacto"
                name="contacto"
                defaultValue={proveedorActual?.contacto}
                required
              />
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                defaultValue={proveedorActual?.telefono}
                required
              />
            </div>
            <div>
              <Label htmlFor="correo">Correo</Label>
              <Input
                id="correo"
                name="correo"
                type="email"
                defaultValue={proveedorActual?.correo}
                required
              />
            </div>
            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                name="direccion"
                defaultValue={proveedorActual?.direccion}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {modoEdicion ? "Actualizar" : "Guardar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );

}
