import { useMemo, useState } from 'react';
import { useInvitations } from '../hooks/useInvitations';
import type { Invitation, InvitationStatus } from '../models/invitation.model';

const RELATIONSHIP_OPTIONS = [
  { id: 1, label: 'Hijo(a)' },
  { id: 2, label: 'Vecino(a)' },
  { id: 3, label: 'Enfermero(a)' },
  { id: 4, label: 'Familiar' },
];

const STATUS_BADGE: Record<InvitationStatus, { text: string; className: string }> = {
  Pending: { text: 'Pendiente', className: 'bg-amber-100 text-amber-700' },
  Accepted: { text: 'Aceptada', className: 'bg-emerald-100 text-emerald-700' },
  Rejected: { text: 'Rechazada', className: 'bg-rose-100 text-rose-700' },
};

const initials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

function StatusBadge({ status }: { status: InvitationStatus }) {
  const badge = STATUS_BADGE[status] ?? STATUS_BADGE.Pending;
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${badge.className}`}>
      {badge.text}
    </span>
  );
}

export default function Invitaciones() {
  const {
    received,
    sent,
    pendingReceivedCount,
    isLoading,
    isConnected,
    accept,
    reject,
    createInvitation,
  } = useInvitations();

  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [actionId, setActionId] = useState<number | null>(null);

  // Formulario de solicitud
  const [dni, setDni] = useState('');
  const [relationshipTypeId, setRelationshipTypeId] = useState(4);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const pendingReceived = useMemo(
    () => received.filter((invitation) => invitation.status === 'Pending'),
    [received],
  );
  const resolvedReceived = useMemo(
    () => received.filter((invitation) => invitation.status !== 'Pending'),
    [received],
  );

  const handleAction = async (id: number, action: 'accept' | 'reject') => {
    setActionId(id);
    try {
      if (action === 'accept') await accept(id);
      else await reject(id);
    } catch (error) {
      console.error('Error procesando invitación:', error);
    } finally {
      setActionId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const cleanDni = dni.trim();
    if (cleanDni.length < 6) {
      setFormError('Ingresa un DNI válido.');
      return;
    }

    setCreating(true);
    try {
      await createInvitation(cleanDni, relationshipTypeId);
      setFormSuccess('Solicitud enviada. El cuidador principal recibirá tu invitación en tiempo real.');
      setDni('');
      setTab('sent');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'No se pudo enviar la solicitud.';
      setFormError(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Encabezado */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#16333F]">Invitaciones</h1>
          <p className="text-gray-500 mt-1">
            Gestiona las solicitudes de acceso a tus abuelitos y el estado de las que enviaste.
          </p>
        </div>
        <span
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
            isConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
          {isConnected ? 'En tiempo real' : 'Desconectado'}
        </span>
      </div>

      {/* Formulario de solicitud */}
      <div className="bg-[#FCF9F0] border border-[#16333F]/10 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold text-[#16333F] mb-1">Solicitar acceso a un abuelito</h2>
        <p className="text-sm text-gray-500 mb-4">
          Ingresa el DNI del abuelito. Su cuidador principal deberá aprobar tu solicitud.
        </p>
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1">DNI del abuelito</label>
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Ej. 70123456"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#16333F] focus:outline-none focus:ring-2 focus:ring-[#16333F]/10 transition"
            />
          </div>
          <div className="min-w-[160px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Relación</label>
            <select
              value={relationshipTypeId}
              onChange={(e) => setRelationshipTypeId(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#16333F] focus:outline-none focus:ring-2 focus:ring-[#16333F]/10 transition bg-white"
            >
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="px-6 py-2.5 rounded-xl bg-[#16333F] text-white font-semibold hover:bg-[#0f2630] transition disabled:opacity-60"
          >
            {creating ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </form>
        {formError && <p className="text-sm text-rose-600 mt-3">{formError}</p>}
        {formSuccess && <p className="text-sm text-emerald-600 mt-3">{formSuccess}</p>}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-100">
        <button
          type="button"
          onClick={() => setTab('received')}
          className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
            tab === 'received' ? 'text-[#16333F]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Recibidas
          {pendingReceivedCount > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
              {pendingReceivedCount}
            </span>
          )}
          {tab === 'received' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#16333F] rounded-full" />}
        </button>
        <button
          type="button"
          onClick={() => setTab('sent')}
          className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
            tab === 'sent' ? 'text-[#16333F]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Enviadas
          {sent.length > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-600">
              {sent.length}
            </span>
          )}
          {tab === 'sent' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#16333F] rounded-full" />}
        </button>
      </div>

      {isLoading && received.length === 0 && sent.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Cargando invitaciones...</div>
      ) : tab === 'received' ? (
        <ReceivedTab
          pending={pendingReceived}
          resolved={resolvedReceived}
          actionId={actionId}
          onAccept={(id) => handleAction(id, 'accept')}
          onReject={(id) => handleAction(id, 'reject')}
        />
      ) : (
        <SentTab invitations={sent} />
      )}
    </div>
  );
}

function ReceivedTab({
  pending,
  resolved,
  actionId,
  onAccept,
  onReject,
}: {
  pending: Invitation[];
  resolved: Invitation[];
  actionId: number | null;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}) {
  if (pending.length === 0 && resolved.length === 0) {
    return (
      <EmptyState
        title="No tienes invitaciones recibidas"
        subtitle="Cuando alguien solicite acceso a un abuelito tuyo, aparecerá aquí en tiempo real."
      />
    );
  }

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div className="space-y-3">
          {pending.map((invitation) => (
            <div
              key={invitation.invitationId}
              className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm flex flex-wrap items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold flex-shrink-0">
                {initials(invitation.requesterName)}
              </div>
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm font-bold text-[#16333F]">
                  {invitation.requesterName}{' '}
                  <span className="font-normal text-gray-500">quiere cuidar a</span>{' '}
                  {invitation.patientName}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Relación: {invitation.relationshipName} · DNI {invitation.patientDni}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={actionId === invitation.invitationId}
                  onClick={() => onReject(invitation.invitationId)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-rose-600 border border-rose-200 hover:bg-rose-50 transition disabled:opacity-50"
                >
                  Rechazar
                </button>
                <button
                  type="button"
                  disabled={actionId === invitation.invitationId}
                  onClick={() => onAccept(invitation.invitationId)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {actionId === invitation.invitationId ? '...' : 'Aprobar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Historial</h3>
          <div className="space-y-2">
            {resolved.map((invitation) => (
              <div
                key={invitation.invitationId}
                className="bg-white border border-gray-100 rounded-xl p-4 flex flex-wrap items-center gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {initials(invitation.requesterName)}
                </div>
                <div className="flex-1 min-w-[180px]">
                  <p className="text-sm font-semibold text-[#16333F]">{invitation.requesterName}</p>
                  <p className="text-xs text-gray-400">{invitation.patientName} · {invitation.relationshipName}</p>
                </div>
                <StatusBadge status={invitation.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SentTab({ invitations }: { invitations: Invitation[] }) {
  if (invitations.length === 0) {
    return (
      <EmptyState
        title="No has enviado invitaciones"
        subtitle="Usa el formulario de arriba para solicitar acceso a un abuelito por su DNI."
      />
    );
  }

  return (
    <div className="space-y-3">
      {invitations.map((invitation) => (
        <div
          key={invitation.invitationId}
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-wrap items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-[#16333F]/5 text-[#16333F] flex items-center justify-center font-bold flex-shrink-0">
            {initials(invitation.patientName)}
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="text-sm font-bold text-[#16333F]">{invitation.patientName || 'Abuelito'}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              DNI {invitation.patientDni} · Solicitaste ser {invitation.relationshipName}
            </p>
          </div>
          <StatusBadge status={invitation.status} />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FCF9F0] flex items-center justify-center text-[#16333F]/40 mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M22 6l-10 7L2 6" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-[#16333F]">{title}</h3>
      <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">{subtitle}</p>
    </div>
  );
}
