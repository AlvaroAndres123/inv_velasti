'use client';

import { useState } from 'react';
import { formatearFechaCorta } from '@/lib/utils';
import { ExportButton } from "@/components/ui/ExportButton";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

interface Salida {
  id: number;
  producto: string;
  cantidad: number;
  motivo: string;
  fecha: string;
}

// Función para generar nombre de archivo exportado
function nombreArchivoExportacion(extension: 'xlsx' | 'pdf') {
  const fecha = new Date();
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `AlmaSoft_Salidas_${yyyy}${mm}${dd}.${extension}`;
}

// Exportar a Excel
function exportarSalidasAExcel(salidasExportar: Salida[], nombreArchivo: string) {
  if (!salidasExportar.length) return;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Salidas");
  worksheet.mergeCells("A1:E1");
  const logoCell = worksheet.getCell("A1");
  logoCell.value = "Salidas";
  logoCell.font = { name: "Calibri", bold: true, size: 22, color: { argb: "FF2196F3" } };
  logoCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.addRow([]);
  worksheet.columns = [
    { header: "Fecha", key: "fecha", width: 14 },
    { header: "Producto", key: "producto", width: 24 },
    { header: "Cantidad", key: "cantidad", width: 10 },
    { header: "Motivo", key: "motivo", width: 30 },
  ];
  salidasExportar.forEach((s) => {
    worksheet.addRow({
      fecha: s.fecha,
      producto: s.producto,
      cantidad: s.cantidad,
      motivo: s.motivo,
    });
  });
  const headerRowIdx = 3;
  worksheet.getRow(headerRowIdx).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2196F3" },
    };
    cell.alignment = { horizontal: "center" };
    cell.border = {
      top: { style: "thin", color: { argb: "FFAAAAAA" } },
      bottom: { style: "thin", color: { argb: "FFAAAAAA" } },
      left: { style: "thin", color: { argb: "FFAAAAAA" } },
      right: { style: "thin", color: { argb: "FFAAAAAA" } },
    };
  });
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber < headerRowIdx) return;
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFAAAAAA" } },
        bottom: { style: "thin", color: { argb: "FFAAAAAA" } },
        left: { style: "thin", color: { argb: "FFAAAAAA" } },
        right: { style: "thin", color: { argb: "FFAAAAAA" } },
      };
      cell.font = cell.font || { name: "Calibri", size: 11 };
    });
  });
  const colCount = worksheet.getRow(headerRowIdx).cellCount;
  const lastCol = String.fromCharCode(64 + colCount);
  worksheet.autoFilter = {
    from: `A${headerRowIdx}`,
    to: `${lastCol}${headerRowIdx}`,
  };
  const fecha = new Date().toLocaleDateString();
  const pieRow = worksheet.addRow([]);
  pieRow.getCell(1).value = `Exportado desde AlmaSoft - Fecha: ${fecha}`;
  worksheet.mergeCells(`A${pieRow.number}:D${pieRow.number}`);
  pieRow.getCell(1).alignment = { horizontal: "center" };
  pieRow.getCell(1).font = { color: { argb: "FF888888" }, italic: true, size: 11 };
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, nombreArchivo);
  });
}

// Exportar a PDF
function exportarSalidasAPDF(salidasExportar: Salida[], nombreArchivo: string) {
  if (!salidasExportar.length) return;
  const doc = new jsPDF();
  doc.setFontSize(22);
  doc.setTextColor(33, 150, 243);
  doc.setFont('helvetica', 'bold');
  doc.text('Salidas', doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
  doc.setDrawColor(33, 150, 243);
  doc.setLineWidth(1);
  doc.line(20, 28, doc.internal.pageSize.getWidth() - 20, 28);
  const columns = [
    { header: "Fecha", dataKey: "fecha" },
    { header: "Producto", dataKey: "producto" },
    { header: "Cantidad", dataKey: "cantidad" },
    { header: "Motivo", dataKey: "motivo" },
  ];
  const data = salidasExportar.map((s) => ({
    fecha: s.fecha,
    producto: s.producto,
    cantidad: s.cantidad,
    motivo: s.motivo,
  }));
  autoTable(doc, {
    startY: 34,
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => (row as any)[col.dataKey])),
    styles: { fontSize: 10, cellPadding: 3, font: 'helvetica', textColor: [33, 37, 41] },
    headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: 'bold', fontSize: 11 },
    alternateRowStyles: { fillColor: [240, 248, 255] },
    tableLineColor: [180, 180, 180],
    tableLineWidth: 0.3,
    margin: { left: 14, right: 14 },
    tableWidth: 'auto',
  });
  const fecha = new Date().toLocaleDateString();
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'italic');
  doc.text(
    `Exportado desde AlmaSoft - Fecha: ${fecha}`,
    doc.internal.pageSize.getWidth() / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );
  doc.save(nombreArchivo);
}

export default function SalidasPage() {
  const [form, setForm] = useState({ producto: '', cantidad: '', motivo: '' });
  const [salidas, setSalidas] = useState<Salida[]>([
    {
      id: 1,
      producto: 'Labial Matte',
      cantidad: 5,
      motivo: 'Venta',
      fecha: '2025-05-06',
    },
    {
      id: 2,
      producto: 'Crema Facial',
      cantidad: 2,
      motivo: 'Muestra gratis',
      fecha: '2025-05-04',
    },
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nuevaSalida: Salida = {
      id: salidas.length + 1,
      producto: form.producto,
      cantidad: parseInt(form.cantidad),
      motivo: form.motivo || 'Sin especificar',
      fecha: new Date().toISOString().split('T')[0],
    };

    setSalidas([nuevaSalida, ...salidas]);
    setForm({ producto: '', cantidad: '', motivo: '' });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Registrar salida de producto</h2>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded p-6 max-w-lg space-y-4 mb-10">
        <div>
          <label className="block text-sm font-medium mb-1">Producto</label>
          <input
            type="text"
            name="producto"
            value={form.producto}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Nombre del producto"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cantidad</label>
          <input
            type="number"
            name="cantidad"
            value={form.cantidad}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            min="1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Motivo (opcional)</label>
          <textarea
            name="motivo"
            value={form.motivo}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Ej: Venta, muestra gratis, producto dañado..."
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Registrar salida
        </button>
      </form>

      {/* Historial */}
      <h3 className="text-xl font-semibold mb-4">Historial de salidas</h3>
      <div className="overflow-x-auto">
        <ExportButton
          onClick={() => exportarSalidasAExcel(salidas, nombreArchivoExportacion('xlsx'))}
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M16 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 9h6M7 13h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 7v6m0 0l2-2m-2 2l-2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          title="Exportar historial de salidas a Excel"
        >
          Exportar Excel
        </ExportButton>
        <ExportButton
          onClick={() => exportarSalidasAPDF(salidas, nombreArchivoExportacion('pdf'))}
          icon={<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M16 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 9h6M7 13h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 7v6m0 0l2-2m-2 2l-2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          title="Exportar historial de salidas a PDF"
        >
          Exportar PDF
        </ExportButton>
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left text-sm uppercase text-gray-600">
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Producto</th>
              <th className="px-6 py-3">Cantidad</th>
              <th className="px-6 py-3">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {salidas.map((salida) => (
              <tr key={salida.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{formatearFechaCorta(salida.fecha)}</td>
                <td className="px-6 py-4">{salida.producto}</td>
                <td className="px-6 py-4">{salida.cantidad}</td>
                <td className="px-6 py-4">{salida.motivo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
