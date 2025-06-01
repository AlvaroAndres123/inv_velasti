'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function PerfilPage() {
  const [nombre, setNombre] = useState('');
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const { nombre } = JSON.parse(usuario);
      setNombre(nombre || '');
    }
  }, []);

  const actualizarPerfil = (e: React.FormEvent) => {
    e.preventDefault();
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const data = JSON.parse(usuario);

      // Validar cambio de contraseña solo si el campo está lleno
      if (contrasenaActual || nuevaContrasena || confirmarContrasena) {
        if (data.contrasena && data.contrasena !== contrasenaActual) {
          setError('La contraseña actual no es correcta');
          return;
        }
        if (nuevaContrasena !== confirmarContrasena) {
          setError('Las nuevas contraseñas no coinciden');
          return;
        }
        data.contrasena = nuevaContrasena;
      }

      data.nombre = nombre;
      localStorage.setItem('usuario', JSON.stringify(data));
      setError('');
      setGuardado(true);
      setContrasenaActual('');
      setNuevaContrasena('');
      setConfirmarContrasena('');
      setTimeout(() => setGuardado(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white rounded-lg shadow p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Configuración del perfil</h1>
        <p className="text-gray-500 text-sm mt-1">
          Actualiza tu información personal y tu contraseña de acceso.
        </p>
      </div>

      <form onSubmit={actualizarPerfil} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ejemplo: Jesua Casco"
            className="max-w-md"
            required
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Cambiar contraseña</h3>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
              <Input
                type="password"
                value={contrasenaActual}
                onChange={(e) => setContrasenaActual(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
              <Input
                type="password"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
              <Input
                type="password"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        {guardado && (
          <p className="text-green-600 text-sm text-center">Cambios guardados correctamente ✅</p>
        )}

        <div className="flex justify-end">
          <Button type="submit">Guardar cambios</Button>
        </div>
      </form>
    </div>
  );
}
