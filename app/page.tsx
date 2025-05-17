'use client';

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
const años = ['2023', '2024', '2025'];

export default function Home() {
  const [mesSeleccionado, setMesSeleccionado] = useState('Mayo');
  const [añoSeleccionado, setAñoSeleccionado] = useState('2025');

  // Datos filtrados (simulados)
  const ventasMensuales = [
    { mes: 'Ene', ventas: 2400 },
    { mes: 'Feb', ventas: 1398 },
    { mes: 'Mar', ventas: 9800 },
    { mes: 'Abr', ventas: 3908 },
    { mes: 'May', ventas: 4800 },
    { mes: 'Jun', ventas: 3800 },
  ];

  const productosMasVendidos = [
    { nombre: 'Labial Mate', ventas: 450 },
    { nombre: 'Base HD', ventas: 320 },
    { nombre: 'Serum Facial', ventas: 210 },
    { nombre: 'Rubor Compacto', ventas: 160 },
    { nombre: 'Delineador Líquido', ventas: 120 },
  ];

  const resumenMovimientos = [
    { mes: 'Ene', entradas: 120, salidas: 80 },
    { mes: 'Feb', entradas: 150, salidas: 100 },
    { mes: 'Mar', entradas: 170, salidas: 130 },
    { mes: 'Abr', entradas: 200, salidas: 160 },
    { mes: 'May', entradas: 220, salidas: 190 },
    { mes: 'Jun', entradas: 180, salidas: 150 },
  ];

  const colores = ['#3b82f6', '#10b981', '#f97316', '#ef4444', '#8b5cf6'];

  return (
    <main className="p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {/* Filtros */}
      <div className="flex gap-4 mb-8">
        <select
          value={mesSeleccionado}
          onChange={(e) => setMesSeleccionado(e.target.value)}
          className="border rounded px-3 py-2"
        >
          {meses.map((mes) => (
            <option key={mes} value={mes}>{mes}</option>
          ))}
        </select>
        <select
          value={añoSeleccionado}
          onChange={(e) => setAñoSeleccionado(e.target.value)}
          className="border rounded px-3 py-2"
        >
          {años.map((año) => (
            <option key={año} value={año}>{año}</option>
          ))}
        </select>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Card title="Total de productos" value="120" color="text-blue-600" />
        <Card title="Stock bajo" value="5" color="text-red-500" />
        <Card title="Última entrada" value="10/05/2025" color="text-green-600" />
        <Card title="Ventas del día" value="C$ 2,340" color="text-purple-600" />
        <Card title="Ingresos del mes" value="C$ 18,200" color="text-emerald-600" />
        <Card title="Productos más vendidos" value="Labial Mate, Serum Facial, Base HD" color="text-orange-500 text-base" />
      </div>

      {/* Gráfica de barras */}
      <h3 className="text-xl font-semibold mb-4">Ventas por Mes</h3>
      <div className="bg-white p-4 rounded-xl shadow-md w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ventasMensuales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="ventas" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfica de pastel */}
      <h3 className="text-xl font-semibold mb-4 mt-10">Top 5 productos más vendidos</h3>
      <div className="bg-white p-4 rounded-xl shadow-md w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={productosMasVendidos}
              dataKey="ventas"
              nameKey="nombre"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {productosMasVendidos.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

       {/* Gráfico de barras - Entradas vs Salidas */}
      <h3 className="text-xl font-semibold mb-4">Entradas vs Salidas por Mes</h3>
      <div className="bg-white p-4 rounded-xl shadow-md w-full h-[300px] mb-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={resumenMovimientos}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="entradas" fill="#10b981" name="Entradas" />
            <Bar dataKey="salidas" fill="#ef4444" name="Salidas" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}

function Card({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}