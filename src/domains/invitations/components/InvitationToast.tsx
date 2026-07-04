import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useInvitations } from '../hooks/useInvitations';
import type { InvitationEventKind } from '../models/invitation.model';

const AUTO_DISMISS_MS = 9000;

const STYLES: Record<InvitationEventKind, { accent: string; ring: string; icon: ReactNode; labelKey: string }> = {
  created: {
    accent: 'bg-amber-500',
    ring: 'border-amber-200',
    labelKey: 'notifications.invitationToast.newRequest',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 6l-10 7L2 6" />
        <rect x="2" y="4" width="20" height="16" rx="2" />
      </svg>
    ),
  },
  accepted: {
    accent: 'bg-emerald-500',
    ring: 'border-emerald-200',
    labelKey: 'notifications.invitationToast.accepted',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ),
  },
  rejected: {
    accent: 'bg-rose-500',
    ring: 'border-rose-200',
    labelKey: 'notifications.invitationToast.rejected',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    ),
  },
};

export default function InvitationToast() {
  const { t } = useTranslation();
  const { lastEvent, dismissEvent } = useInvitations();
  const navigate = useNavigate();

  useEffect(() => {
    if (!lastEvent) return;
    const timer = window.setTimeout(() => dismissEvent(), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [lastEvent, dismissEvent]);

  if (!lastEvent) return null;

  const style = STYLES[lastEvent.kind] ?? STYLES.created;

  return (
    <div className="fixed bottom-6 right-6 z-[60] w-[360px] max-w-[calc(100vw-3rem)] animate-[slideIn_0.3s_ease-out]">
      <div className={`relative overflow-hidden rounded-2xl bg-white shadow-2xl border ${style.ring}`}>
        <div className={`absolute left-0 top-0 h-full w-1.5 ${style.accent}`} />
        <div className="p-4 pl-5">
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${style.accent} text-white flex items-center justify-center shadow-md`}>
              {style.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{t(style.labelKey)}</p>
              <h4 className="text-sm font-bold text-[#16333F] leading-snug">{lastEvent.title}</h4>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{lastEvent.message}</p>
            </div>
            <button
              type="button"
              onClick={dismissEvent}
              className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
              aria-label={t('common.close')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={dismissEvent}
              className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            >
              {t('common.discard')}
            </button>
            <button
              type="button"
              onClick={() => {
                dismissEvent();
                navigate('/invitaciones');
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg bg-[#16333F] hover:bg-[#0f2630] transition-colors"
            >
              {t('common.viewInvitations')}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
