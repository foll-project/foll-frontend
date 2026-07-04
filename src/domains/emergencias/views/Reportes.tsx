import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useReportes } from '../hooks/useReportes';
import { useAbuelitos } from '../../iam/hooks/useAbuelitos';
import { getDateLocale } from '../../../shared/i18n';

const MONTH_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1];

export default function Reportes() {
  const { t } = useTranslation();
  const { abuelitos, isLoading: isLoadingPacientes } = useAbuelitos();
  const { incidents, isLoading: isLoadingReportes, error, fetchMonthlyFalls } = useReportes();

  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [hasSearched, setHasSearched] = useState(false);

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

  const getMonthLabel = (month: number) => t(`months.${month}`);

  const getStatusLabel = (status: string) => {
    if (status === 'Open') return t('status.incidentOpen');
    if (status === 'Resolved') return t('status.incidentResolved');
    return t('status.incidentClosedFalseAlarm');
  };

  const descargarPDF = () => {
    const paciente = abuelitos.find(a => String(a.id) === selectedPatient);
    const nombrePaciente = paciente ? paciente.nombre : t('common.unknownPatient');
    const nombreMes = getMonthLabel(selectedMonth);
    const dateLocale = getDateLocale();
    const fechaGeneracion = new Date().toLocaleString(dateLocale, { dateStyle: 'short', timeStyle: 'short' });

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(t('pdf.title'), 14, 22);

    doc.setFontSize(12);
    doc.text(t('pdf.patient', { name: nombrePaciente }), 14, 32);
    doc.text(t('pdf.period', { month: nombreMes, year: selectedYear }), 14, 38);
    doc.text(t('pdf.totalFalls', { count: incidents.length }), 14, 44);
    doc.text(t('pdf.generatedAt', { date: fechaGeneracion }), 14, 50);

    if (incidents.length === 0) {
      doc.setFontSize(12);
      doc.text(t('pdf.noFallsInMonth'), 105, 70, { align: 'center' });
    } else {
      const tableColumn = [
        t('pdf.columns.dateTime'),
        t('pdf.columns.fallType'),
        t('pdf.columns.status'),
        t('pdf.columns.location'),
      ];
      const tableRows = incidents.map(inc => {
        const fecha = new Date(inc.openedAt).toLocaleString(dateLocale, { dateStyle: 'short', timeStyle: 'short' });
        const tipo = inc.fallType ? inc.fallType.name : t('common.unknown');
        const estado = getStatusLabel(inc.status);
        const ubicacion = (inc.latitude && inc.longitude)
          ? `${inc.latitude.toFixed(4)}, ${inc.longitude.toFixed(4)}`
          : t('pdf.noGps');
        return [fecha, tipo, estado, ubicacion];
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 56,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [22, 51, 63] },
      });
    }

    doc.save(`${t('pdf.filenamePrefix')}_${nombrePaciente.replace(/\s+/g, '_')}_${nombreMes}_${selectedYear}.pdf`);
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#16333F] mb-2">{t('reportes.title')}</h1>
          <p className="text-sm text-gray-500">{t('reportes.subtitle')}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('reportes.patient')}</label>
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            disabled={isLoadingPacientes}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#16333F]/20"
          >
            {isLoadingPacientes ? (
              <option>{t('common.loadingPatients')}</option>
            ) : abuelitos.length === 0 ? (
              <option>{t('common.noPatientsRegistered')}</option>
            ) : (
              abuelitos.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))
            )}
          </select>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('reportes.month')}</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#16333F]/20"
          >
            {MONTH_VALUES.map(m => (
              <option key={m} value={m}>{getMonthLabel(m)}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-32">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('reportes.year')}</label>
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
          {isLoadingReportes ? t('common.loading') : t('reportes.generatePreview')}
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
              <h2 className="text-lg font-bold text-[#16333F]">{t('reportes.previewTitle')}</h2>
              <p className="text-sm text-gray-500">{t('reportes.incidentsFound', { count: incidents.length })}</p>
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
              {t('reportes.downloadPdf')}
            </button>
          </div>

          {incidents.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {t('reportes.noFallsInPeriod')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 text-gray-700 font-medium">
                  <tr>
                    <th className="px-6 py-4 border-b border-gray-100">{t('reportes.columns.dateTime')}</th>
                    <th className="px-6 py-4 border-b border-gray-100">{t('reportes.columns.fallType')}</th>
                    <th className="px-6 py-4 border-b border-gray-100">{t('reportes.columns.status')}</th>
                    <th className="px-6 py-4 border-b border-gray-100">{t('reportes.columns.location')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {incidents.map((inc) => (
                    <tr key={inc.incidentId} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4">
                        {new Date(inc.openedAt).toLocaleString(getDateLocale(), { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {inc.fallType ? inc.fallType.name : t('common.unknown')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          inc.status === 'Open' ? 'bg-red-100 text-red-700' :
                          inc.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {inc.status === 'Open'
                            ? t('status.incidentOpen')
                            : inc.status === 'Resolved'
                              ? t('status.incidentResolved')
                              : t('status.incidentFalseAlarm')}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        {(inc.latitude && inc.longitude)
                          ? `${inc.latitude.toFixed(4)}, ${inc.longitude.toFixed(4)}`
                          : t('common.noData')}
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
