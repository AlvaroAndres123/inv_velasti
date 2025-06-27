'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Lock, CheckCircle, Clock } from 'lucide-react';
import { useToast, ToastContainer } from '@/components/ui/toast';

interface Actividad {
  fecha: string;
  accion: string;
  ip: string;
}

export default function PerfilPage() {
  const [nombre, setNombre] = useState('');
  const [nombreOriginal, setNombreOriginal] = useState('');
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const { toasts, success, error: showError, removeToast } = useToast();

  // Obtener usuario de localStorage y cargar datos reales
  useEffect(() => {
    const usuarioLS = localStorage.getItem('usuario');
    if (usuarioLS) {
      const { nombre } = JSON.parse(usuarioLS);
      if (nombre) {
        fetch(`/api/perfil?nombre=${encodeURIComponent(nombre)}`)
          .then(res => res.json())
          .then(data => {
            if (data && !data.error) {
              setNombre(data.nombre);
              setNombreOriginal(data.nombre);
              // Cargar historial de actividad
              fetch(`/api/perfil/actividad?nombre=${encodeURIComponent(data.nombre)}`)
                .then(res => res.json())
                .then(hist => {
                  if (Array.isArray(hist)) setActividades(hist);
                });
            }
          })
          .finally(() => setCargando(false));
      }
    } else {
      setCargando(false);
    }
  }, []);

  const actualizarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGuardado(false);
    if (nuevaContrasena && nuevaContrasena !== confirmarContrasena) {
      showError('Error', 'Las nuevas contraseñas no coinciden');
      return;
    }
    try {
      const res = await fetch('/api/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombreOriginal,
          nuevoNombre: nombre,
          contrasenaActual: contrasenaActual || undefined,
          nuevaContrasena: nuevaContrasena || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showError('Error', data.error || 'Error al actualizar perfil');
        return;
      }
      setGuardado(true);
      setNombreOriginal(data.nombre);
      localStorage.setItem('usuario', JSON.stringify({ nombre: data.nombre }));
      setContrasenaActual('');
      setNuevaContrasena('');
      setConfirmarContrasena('');
      // Recargar historial
      fetch(`/api/perfil/actividad?nombre=${encodeURIComponent(data.nombre)}`)
        .then(res => res.json())
        .then(hist => {
          if (Array.isArray(hist)) setActividades(hist);
        });
      success('Perfil actualizado', 'Los cambios se guardaron correctamente.');
      setTimeout(() => setGuardado(false), 2000);
    } catch (err) {
      showError('Error', 'Error al actualizar perfil');
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl w-full mx-auto mt-8 bg-white rounded-2xl shadow-xl p-10 space-y-10 border border-blue-100 flex flex-col">
      <div className="flex items-center gap-3 mb-2">
        <User className="text-blue-500" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-gray-800 leading-tight">Configuración del perfil</h1>
          <p className="text-gray-500 text-sm mt-1">Actualiza tu información personal y contraseña de acceso.</p>
        </div>
      </div>
      <form onSubmit={actualizarPerfil} className="space-y-8">
        <div className="flex flex-col gap-6 md:flex-row md:gap-12">
          <div className="flex-1 space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none"><User size={20} /></span>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ejemplo: Jesua Casco"
                className="max-w-md pl-10"
                required
              />
            </div>
          </div>
          <div className="flex-1 border-l md:border-l border-t md:border-t-0 border-blue-100 pl-0 md:pl-8 pt-6 md:pt-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2"><Lock className="text-blue-400" size={20}/> Cambiar contraseña</h3>
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
                {nuevaContrasena && (
                  <PasswordStrengthMeter password={nuevaContrasena} />
                )}
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
        </div>
        {(error || guardado) && (
          <div className="flex items-center justify-center gap-2">
            {guardado && <CheckCircle className="text-green-500" size={18} />}
            <p className={`text-sm text-center ${error ? 'text-red-600' : 'text-green-600'}`}>{error || (guardado && 'Cambios guardados correctamente ✅')}</p>
          </div>
        )}
        <div className="flex justify-end">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md flex items-center gap-2 px-6 py-2 text-base font-semibold">
            Guardar cambios
          </Button>
        </div>
      </form>
      {/* Historial de actividad */}
      <div className="mt-2">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="text-blue-500" size={22} />
          <h2 className="text-xl font-bold text-gray-800">Historial de actividad</h2>
        </div>
        <div className="overflow-x-auto rounded-lg border border-blue-100 bg-white shadow-sm">
          <table className="min-w-full text-sm text-left text-gray-700 bg-white border-separate border-spacing-0">
            <thead className="bg-gray-100 text-xs uppercase text-gray-500 sticky top-0">
              <tr>
                <th className="px-4 py-3">Fecha y hora</th>
                <th className="px-4 py-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {actividades.length === 0 ? (
                <tr><td colSpan={2} className="text-center py-4 text-gray-400">Sin actividad reciente</td></tr>
              ) : (
                actividades.map((item, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="px-4 py-2 whitespace-nowrap">{item.fecha}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{item.accion}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = calcularFuerza(password);
  return (
    <div className="mt-2">
      <div className="h-2 rounded bg-gray-200 overflow-hidden">
        <div className={`h-2 ${strength.color} ${strength.width} transition-all duration-300 rounded`} />
      </div>
      <p className={`text-xs mt-1 ${strength.textColor}`}>{`Fuerza: ${strength.label}`}</p>
    </div>
  );
}

function calcularFuerza(pass: string) {
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  if (score <= 1) return { label: 'Débil', color: 'bg-red-500', width: 'w-1/4', textColor: 'text-red-500' };
  if (score === 2) return { label: 'Regular', color: 'bg-yellow-500', width: 'w-2/4', textColor: 'text-yellow-600' };
  if (score === 3) return { label: 'Buena', color: 'bg-blue-500', width: 'w-3/4', textColor: 'text-blue-600' };
  return { label: 'Fuerte', color: 'bg-green-500', width: 'w-full', textColor: 'text-green-600' };
}
