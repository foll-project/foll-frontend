import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { fetchMyPatients } from '../../iam/services/patientsApi';
import type { Notification } from '../models/notification.model';

interface FallData {
  fallTypeName?: string;
  confidence?: string;
  latitude?: string;
  longitude?: string;
}

const parseFallData = (dataJson?: string | null): FallData => {
  if (!dataJson) return {};
  try {
    const d = JSON.parse(dataJson);
    return {
      fallTypeName: d.fallTypeName || d.fall_type || undefined,
      confidence: d.aiConfidenceScore || undefined,
      latitude: d.latitude || undefined,
      longitude: d.longitude || undefined,
    };
  } catch {
    return {};
  }
};

const formatTime = (createdAt: string): string => {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export default function FallAlertOverlay() {
  const { notifications, acknowledge } = useNotifications();
  const navigate = useNavigate();
  const [patientNames, setPatientNames] = useState<Record<number, string>>({});
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);

  // Caídas sin confirmar (más reciente primero)
  const activeFalls = useMemo<Notification[]>(() => {
    return notifications
      .filter((n) => n.notificationType === 'FallDetected' && !n.acknowledgedAt)
      .filter((n) => !dismissedIds.includes(n.notificationLogId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, dismissedIds]);

  const currentFall = activeFalls[0] || null;

  // Cargar nombres de pacientes cuando aparece una caída de un paciente desconocido
  useEffect(() => {
    if (!currentFall || currentFall.patientId == null) return;
    if (patientNames[currentFall.patientId]) return;

    let active = true;
    fetchMyPatients()
      .then((pacientes) => {
        if (!active) return;
        const mapa: Record<number, string> = {};
        pacientes.forEach((p) => {
          mapa[p.patientId] = p.fullName;
        });
        setPatientNames((prev) => ({ ...prev, ...mapa }));
      })
      .catch((err) => console.warn('No se pudieron cargar nombres de pacientes para la alerta.', err));

    return () => {
      active = false;
    };
  }, [currentFall, patientNames]);

  if (!currentFall) return null;

  const fallData = parseFallData(currentFall.dataJson);
  const patientName =
    currentFall.patientId != null && patientNames[currentFall.patientId]
      ? patientNames[currentFall.patientId]
      : currentFall.patientId != null
        ? `Paciente #${currentFall.patientId}`
        : 'Paciente';

  const confidencePct = fallData.confidence
    ? `${Math.round(parseFloat(fallData.confidence) * 100)}%`
    : null;
  const hasLocation = fallData.latitude && fallData.longitude;

  const handleConfirmar = async () => {
    await acknowledge(currentFall.notificationLogId);
  };

  const handleVerHistorial = () => {
    setDismissedIds((prev) => [...prev, currentFall.notificationLogId]);
    navigate('/historial');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-red-500">
        {/* Encabezado rojo pulsante */}
        <div className="bg-red-600 px-6 py-5 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-red-500 animate-pulse opacity-40" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest opacity-90">
                Alerta de Emergencia
              </p>
              <h2 className="text-2xl font-black leading-tight">¡Caída detectada!</h2>
            </div>
          </div>
          {activeFalls.length > 1 && (
            <span className="absolute top-4 right-5 bg-white text-red-700 text-[11px] font-black px-2.5 py-1 rounded-full">
              +{activeFalls.length - 1} más
            </span>
          )}
        </div>

        {/* Cuerpo */}
        <div className="px-6 py-6 space-y-5">
          <div className="text-center">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Adulto mayor
            </p>
            <p className="text-2xl font-black text-[#16333F]">{patientName}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F9F7F1] rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Hora</p>
              <p className="text-xs font-bold text-[#16333F]">{formatTime(currentFall.createdAt)}</p>
            </div>
            <div className="bg-[#F9F7F1] rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Tipo de caída</p>
              <p className="text-xs font-bold text-[#16333F]">{fallData.fallTypeName || 'No especificado'}</p>
            </div>
            {confidencePct && (
              <div className="bg-[#F9F7F1] rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Confianza IA</p>
                <p className="text-xs font-bold text-[#16333F]">{confidencePct}</p>
              </div>
            )}
            {hasLocation && (
              <div className="bg-[#F9F7F1] rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Ubicación</p>
                <p className="text-[10px] font-bold text-[#16333F] font-mono">
                  {parseFloat(fallData.latitude!).toFixed(4)}, {parseFloat(fallData.longitude!).toFixed(4)}
                </p>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center leading-relaxed">
            {currentFall.body}
          </p>

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleVerHistorial}
              className="flex-1 border border-[#16333F] text-[#16333F] hover:bg-[#16333F] hover:text-white rounded-xl py-3 text-sm font-bold transition-colors"
            >
              Ver historial
            </button>
            <button
              onClick={handleConfirmar}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 text-sm font-bold transition-colors shadow-md"
            >
              Confirmar atención
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
