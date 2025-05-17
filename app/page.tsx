'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LabelList
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
const años = ['2023', '2024', '2025'];

const colores = ['#3b82f6', '#10b981', '#f97316', '#ef4444', '#8b5cf6'];

export default function Home() {
  const [mesSeleccionado, setMesSeleccionado] = useState('Mayo');
  const [añoSeleccionado, setAñoSeleccionado] = useState('2025');

  const resumenMovimientos = [
    { mes: 'Ene', entradas: 120, salidas: 80 },
    { mes: 'Feb', entradas: 150, salidas: 100 },
    { mes: 'Mar', entradas: 170, salidas: 130 },
    { mes: 'Abr', entradas: 200, salidas: 160 },
    { mes: 'May', entradas: 220, salidas: 190 },
    { mes: 'Jun', entradas: 180, salidas: 150 },
  ];

  const ventasMensuales = [
    { mes: 'Ene', ventas: 2400 },
    { mes: 'Feb', ventas: 1398 },
    { mes: 'Mar', ventas: 9800 },
    { mes: 'Abr', ventas: 3908 },
    { mes: 'May', ventas: 4800 },
    { mes: 'Jun', ventas: 3800 },
  ];

  const productosMasVendidos = [
    { name: 'Labial Mate', visitors: 450 },
    { name: 'Base HD', visitors: 320 },
    { name: 'Serum Facial', visitors: 210 },
    { name: 'Rubor Compacto', visitors: 160 },
    { name: 'Delineador Líquido', visitors: 120 },
  ];

  return (
    <main className="p-4 sm:p-6 md:p-8 max-w-screen-xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">Dashboard</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center md:justify-start">
        <select
          value={mesSeleccionado}
          onChange={(e) => setMesSeleccionado(e.target.value)}
          className="border rounded px-3 py-2 text-sm md:text-base"
        >
          {meses.map((mes) => (
            <option key={mes} value={mes}>{mes}</option>
          ))}
        </select>
        <select
          value={añoSeleccionado}
          onChange={(e) => setAñoSeleccionado(e.target.value)}
          className="border rounded px-3 py-2 text-sm md:text-base"
        >
          {años.map((año) => (
            <option key={año} value={año}>{año}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        <InfoCard title="Total de productos" value="120" color="text-blue-600" />
        <InfoCard title="Stock bajo" value="5" color="text-red-500" />
        <InfoCard title="Última entrada" value="10/05/2025" color="text-green-600" />
        <InfoCard title="Ventas del día" value="C$ 2,340" color="text-purple-600" />
        <InfoCard title="Ingresos del mes" value="C$ 18,200" color="text-emerald-600" />
        <InfoCard title="Productos más vendidos" value="Labial Mate, Serum Facial, Base HD" color="text-orange-500 text-sm" />
      </div>

      <h3 className="text-lg md:text-xl font-semibold mb-4 text-center md:text-left">Ventas por Mes</h3>
      <div className="bg-white p-4 rounded-xl shadow-md w-full h-[250px] sm:h-[300px] mb-10">
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

      <h3 className="text-lg md:text-xl font-semibold mb-4 text-center md:text-left">Top 5 productos más vendidos</h3>
      <Card className="mb-10">
        <CardHeader className="items-center pb-0">
          <CardTitle>Distribución por producto</CardTitle>
          <CardDescription>Últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <ChartContainer
            config={{}}
            className="mx-auto aspect-square max-h-[350px] md:max-h-[300px]"
          >
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={productosMasVendidos}
                dataKey="visitors"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                fill="#8884d8"
              >
                <LabelList
                  dataKey="name"
                  position="inside"
                />
                {productosMasVendidos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none">
            En aumento un 5.2% este mes <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Mostrando productos más vendidos en los últimos 6 meses
          </div>
        </CardFooter>
      </Card>

      <h3 className="text-lg md:text-xl font-semibold mb-4 text-center md:text-left">Entradas vs Salidas por Mes</h3>
      <div className="bg-white p-4 rounded-xl shadow-md w-full h-[250px] sm:h-[300px] mb-10">
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

function InfoCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 md:p-6 hover:shadow-lg transition min-w-0">
      <h3 className="text-sm md:text-base font-semibold mb-2 text-gray-600 break-words whitespace-normal">{title}</h3>
      <p className={`text-2xl md:text-3xl font-bold ${color} break-words whitespace-normal`}>{value}</p>
    </div>
  );
}
