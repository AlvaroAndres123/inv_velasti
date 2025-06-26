'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Limpiar localStorage al cargar la página de login
  useEffect(() => {
    localStorage.removeItem('usuario');
  }, []);

  // Animación de estrellas
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationId: number;
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.5,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.5 + 0.5,
    }));
    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        ctx.globalAlpha = s.opacity;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        s.x += s.dx;
        s.y += s.dy;
        if (s.x < 0) s.x = canvas.width;
        if (s.x > canvas.width) s.x = 0;
        if (s.y < 0) s.y = canvas.height;
        if (s.y > canvas.height) s.y = 0;
      }
      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animationId);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre: username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        router.push('/');
      } else {
        setError(data.error || 'Error al iniciar sesión');
        setShake(true);
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error en login:', err);
      setShake(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shake) {
      const timer = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(timer);
    }
  }, [shake]);

  return (
    <div className="min-h-screen flex">
      {/* Lado izquierdo: formulario */}
      <div className="flex flex-col justify-center items-center w-full max-w-lg px-8 bg-white shadow-2xl z-10 relative">
        <div className="w-full max-w-sm mx-auto">
          <div className="flex flex-col items-center gap-2 mb-8 mt-4">
            <User className="text-blue-500" size={40} />
            <h2 className="text-3xl font-bold text-center text-gray-800">Iniciar sesión</h2>
            <p className="text-gray-500 text-center text-base">Accede a tu panel de inventario</p>
          </div>
          <form onSubmit={handleLogin} className={`space-y-6 ${shake ? 'animate-shake' : ''}`}> 
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none"><User size={20} /></span>
              <Input
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                required
                autoFocus
                autoComplete="username"
              />
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none"><Lock size={20} /></span>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-12 appearance-none"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 focus:outline-none bg-white"
                onClick={() => setShowPassword((v) => !v)}
                style={{ padding: 0, border: 'none', background: 'none' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <AnimatePresence>
              {error && (
                <motion.p
                  className="text-red-500 text-sm text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            <motion.button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md flex items-center justify-center gap-2 px-6 py-2 text-base font-semibold transition-all duration-200 focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:opacity-60"
              whileTap={{ scale: 0.97 }}
              disabled={loading}
            >
              {loading ? (
                <motion.span
                  className="inline-block animate-spin mr-2"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                </motion.span>
              ) : null}
              {loading ? 'Iniciando sesión...' : 'Ingresar'}
            </motion.button>
          </form>
          <button
            type="button"
            className="w-full mt-6 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg shadow-sm px-6 py-2 text-base font-semibold transition-all duration-200 focus:ring-2 focus:ring-blue-300 focus:outline-none"
            onClick={() => router.push('/roadmap')}
          >
            Ver Roadmap de Desarrollo
          </button>
        </div>
      </div>
      {/* Lado derecho: animación de estrellas */}
      <div className="flex-1 relative bg-gradient-to-br from-black via-blue-900 to-blue-700 overflow-hidden">
        <canvas ref={canvasRef} width={900} height={900} className="w-full h-full absolute inset-0" style={{ pointerEvents: 'none' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-blue-900/60 to-blue-700/60 mix-blend-lighten" />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <motion.h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center drop-shadow-lg shadow-black/80 mb-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Bienvenido al<br />Sistema de Inventario de AlmaSoft
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-blue-100 text-center font-medium drop-shadow mt-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Controla tu inventario de forma fácil, segura y moderna
          </motion.p>
        </div>
      </div>
      <style>{`
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-8px); }
          40%, 60% { transform: translateX(8px); }
        }
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear,
        input[type="password"]::-webkit-credentials-auto-fill-button,
        input[type="password"]::-webkit-input-password-toggle-button {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
