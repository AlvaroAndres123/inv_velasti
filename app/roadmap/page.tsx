'use client';
import { CheckCircle, TrendingUp, Users, BarChart2, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const fases = [
  {
    icon: <TrendingUp size={32} />, color: 'bg-blue-600',
    title: 'Módulo de facturación',
    desc: 'Permitir la gestión de facturas, emisión de comprobantes y control de ventas.'
  },
  {
    icon: <Users size={32} />, color: 'bg-blue-600',
    title: 'Gestión avanzada de usuarios y roles',
    desc: 'Crear, suspender, activar usuarios y definir roles personalizados como vendedor o registrador de productos.'
  },
  {
    icon: <BarChart2 size={32} />, color: 'bg-blue-600',
    title: 'Reportes y estadísticas',
    desc: 'Visualización de reportes de ventas, movimientos y stock con gráficos interactivos.'
  },
  {
    icon: <Smartphone size={32} />, color: 'bg-blue-600',
    title: 'Mejoras de experiencia móvil',
    desc: 'Optimización de la interfaz para dispositivos móviles y tablets.'
  },
  {
    icon: <CheckCircle size={32} />, color: 'bg-green-500',
    title: '¡Y mucho más por venir!',
    desc: '¿Tienes sugerencias? ¡Contáctanos para proponer nuevas funcionalidades!'
  },
];

export default function RoadmapPage() {
  const router = useRouter();
  const pointsRef = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [path, setPath] = useState('');
  const [svgDims, setSvgDims] = useState({ width: 0, height: 0 });

  // Recalcula el path cada vez que cambia el layout o el tamaño
  useEffect(() => {
    function updatePath() {
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const points = pointsRef.current.map((el) => {
        if (!el) return { x: 0, y: 0 };
        const rect = el.getBoundingClientRect();
        return {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
        };
      });
      if (points.length > 1) {
        let d = `M${points[0].x},${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          const mx = (prev.x + curr.x) / 2;
          d += ` Q${mx},${prev.y} ${curr.x},${curr.y}`;
        }
        setPath(d);
        setSvgDims({
          width: containerRect.width,
          height: containerRect.height,
        });
      }
    }
    updatePath();
    window.addEventListener('resize', updatePath);
    window.addEventListener('scroll', updatePath, true);
    return () => {
      window.removeEventListener('resize', updatePath);
      window.removeEventListener('scroll', updatePath, true);
    };
  }, [pointsRef.current.length]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12 overflow-x-hidden">
      <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-2 text-center">Roadmap de Desarrollo</h1>
      <p className="text-gray-700 text-center mb-10 max-w-2xl">Aquí puedes ver las próximas actualizaciones y mejoras planeadas para el Sistema de Inventario de AlmaSoft.</p>
      <div ref={containerRef} className="relative w-full max-w-3xl mx-auto flex flex-col items-center">
        {/* SVG camino dinámico */}
        <svg width={svgDims.width} height={svgDims.height} className="absolute left-0 top-0 z-0" style={{ pointerEvents: 'none' }}>
          <path
            d={path}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="18 18"
            style={{ animation: 'dashmove 2.5s linear infinite' }}
          />
        </svg>
        <style>{`
          @keyframes dashmove {
            to {
              stroke-dashoffset: 36;
            }
          }
        `}</style>
        {/* Fases del roadmap */}
        <div className="relative z-10 w-full flex flex-col gap-24 pt-8">
          {fases.map((fase, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className={`flex items-center gap-8 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} w-full`}
              style={{ minHeight: 180 }}
            >
              <div className="flex flex-col items-center min-w-[80px] relative z-10">
                <div
                  ref={el => {
                    pointsRef.current[i] = el;
                  }}
                  className={`${fase.color} text-white rounded-full p-4 shadow-lg border-4 border-white z-10 flex items-center justify-center`}
                >
                  {fase.icon}
                </div>
              </div>
              <div className={`bg-blue-50 border-l-4 border-blue-400 rounded-xl p-8 shadow-md w-full max-w-xl ${i === fases.length - 1 ? 'bg-green-50 border-green-400' : ''}`}> 
                <span className={`font-semibold ${i === fases.length - 1 ? 'text-green-700' : 'text-blue-700'} text-xl`}>{fase.title}</span>
                <p className="text-gray-600 text-base mt-2">{fase.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-16">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md px-8 py-3 text-lg font-semibold transition-all duration-200 focus:ring-2 focus:ring-blue-300 focus:outline-none"
          onClick={() => router.push('/login')}
        >
          Regresar al Inicio de Sesión
        </button>
      </div>
    </div>
  );
} 