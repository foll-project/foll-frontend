import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useReportes } from '../hooks/useReportes';
import { useAbuelitos } from '../../iam/hooks/useAbuelitos';

const MESES = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1];

export default function Reportes() {
  const { abuelitos, isLoading: isLoadingPacientes } = useAbuelitos();
  const { incidents, isLoading: isLoadingReportes, error, fetchMonthlyFalls } = useReportes();

  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [hasSearched, setHasSearched] = useState(false);

  // Seleccionar automáticamente el primer paciente cuando cargan
  useEffect(() => {
    if (abuelitos.length > 0 && !selectedPatient) {
      setSelectedPatient(String(abuelitos[0].id));
    }
  }, [abuelitos, selectedPatient]);

  const handleGenerarVistaPrevia = async () => {
    if (!selectedPatient) return;
    await fetchMonthlyFalls(Number(selectedPatient), selectedMonth, selectedYear);
    setHasSearched(true);
  };

  const descargarPDF = () => {
    const paciente = abuelitos.find(a => String(a.id) === selectedPatient);
    const nombrePaciente = paciente ? paciente.nombre : 'Paciente Desconocido';
    const nombreMes = MESES.find(m => m.value === selectedMonth)?.label || '';
    const fechaGeneracion = new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });

    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(18);
    doc.text('Reporte Clínico de Caídas - FOLL', 14, 22);
    
    // Información general
    doc.setFontSize(12);
    doc.text(`Paciente: ${nombrePaciente}`, 14, 32);
    doc.text(`Periodo: ${nombreMes} ${selectedYear}`, 14, 38);
    doc.text(`Total de Caídas Registradas: ${incidents.length}`, 14, 44);
    doc.text(`Reporte generado el: ${fechaGeneracion}`, 14, 50);

    if (incidents.length === 0) {
      doc.setFontSize(12);
      doc.text('No hubo reportes de caídas registrados durante este mes.', 105, 70, { align: 'center' });
    } else {
      // Preparar datos para autoTable
      const tableColumn = ["Fecha y Hora", "Tipo de Caída", "Estado", "Ubicación (Lat, Lng)"];
      const tableRows = incidents.map(inc => {
        const fecha = new Date(inc.openedAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
        const tipo = inc.fallType ? inc.fallType.name : 'Desconocido';
        const estado = inc.status === 'Open' ? 'Abierto' : inc.status === 'Resolved' ? 'Resuelto' : 'Cerrado/Falsa Alarma';
        const ubicacion = (inc.latitude && inc.longitude) ? `${inc.latitude.toFixed(4)}, ${inc.longitude.toFixed(4)}` : 'Sin GPS';
        return [fecha, tipo, estado, ubicacion];
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 56,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [22, 51, 63] }, // Color corporativo FOLL #16333F
      });
    }

    // Guardar
    doc.save(`reporte_caidas_${nombrePaciente.replace(/\s+/g, '_')}_${nombreMes}_${selectedYear}.pdf`);
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#16333F] mb-2">Reportes Clínicos</h1>
          <p className="text-sm text-gray-500">Genera reportes mensuales de caídas para el personal médico.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
          <select 
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            disabled={isLoadingPacientes}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#16333F]/20"
          >
            {isLoadingPacientes ? (
              <option>Cargando pacientes...</option>
            ) : abuelitos.length === 0 ? (
              <option>No hay pacientes registrados</option>
            ) : (
              abuelitos.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))
            )}
          </select>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#16333F]/20"
          >
            {MESES.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-32">
          <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#16333F]/20"
          >
            {YEARS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerarVistaPrevia}
          disabled={!selectedPatient || isLoadingReportes}
          className="w-full md:w-auto bg-[#16333F] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#204959] transition-colors disabled:opacity-50 h-[46px]"
        >
          {isLoadingReportes ? 'Cargando...' : 'Generar Vista Previa'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      {hasSearched && !isLoadingReportes && !error && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-lg font-bold text-[#16333F]">Vista Previa del Reporte</h2>
              <p className="text-sm text-gray-500">Se encontraron {incidents.length} incidentes en este periodo.</p>
            </div>
              <button
                onClick={descargarPDF}
                className="bg-[#FDECA6] text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#FCE07B] transition-colors shadow-sm flex items-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Descargar PDF
              </button>
          </div>
          
          {incidents.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No se registraron caídas en este periodo.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 text-gray-700 font-medium">
                  <tr>
                    <th className="px-6 py-4 border-b border-gray-100">Fecha y Hora</th>
                    <th className="px-6 py-4 border-b border-gray-100">Tipo de Caída</th>
                    <th className="px-6 py-4 border-b border-gray-100">Estado</th>
                    <th className="px-6 py-4 border-b border-gray-100">Ubicación (Lat, Lng)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {incidents.map((inc) => (
                    <tr key={inc.incidentId} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4">
                        {new Date(inc.openedAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {inc.fallType ? inc.fallType.name : 'Desconocido'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          inc.status === 'Open' ? 'bg-red-100 text-red-700' : 
                          inc.status === 'Resolved' ? 'bg-green-100 text-green-700' : 
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {inc.status === 'Open' ? 'Abierto' : inc.status === 'Resolved' ? 'Resuelto' : 'Falsa Alarma'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        {(inc.latitude && inc.longitude) ? `${inc.latitude.toFixed(4)}, ${inc.longitude.toFixed(4)}` : 'Sin datos GPS'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
