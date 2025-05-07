'use client';

export default function Home() {
  return (
    <div>
    <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white shadow rounded p-6">
        <h3 className="text-lg font-semibold">Total de productos</h3>
        <p className="text-3xl font-bold text-blue-600">120</p>
      </div>
      <div className="bg-white shadow rounded p-6">
        <h3 className="text-lg font-semibold">Stock bajo</h3>
        <p className="text-3xl font-bold text-red-500">5</p>
      </div>
      <div className="bg-white shadow rounded p-6">
        <h3 className="text-lg font-semibold">Última entrada</h3>
        <p className="text-3xl font-bold text-green-600">10/05/2025</p>
      </div>
    </div>
  </div>
  );
}
