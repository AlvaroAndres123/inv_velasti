'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  

  useEffect(() => {
    const user = localStorage.getItem('usuario');
    if (user) router.replace('/productos');
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Usuario de prueba
    if (usuario === 'jesua123' && clave === '1234') {
      const usuarioDemo = {
        usuario,
        nombre: 'Jesua Casco',
      };
      localStorage.setItem('usuario', JSON.stringify(usuarioDemo));
      router.push('/');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold text-center">Iniciar sesión</h2>
        <Input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Contraseña"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          required
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <Button type="submit" className="w-full">Ingresar</Button>
      </form>
    </div>
  );
}
