import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePerfil } from '../hooks/usePerfil';
import { useNotifications } from '../../../domains/notifications/hooks/useNotifications';
import { useInvitations } from '../../../domains/invitations/hooks/useInvitations';
import { apiClient } from '../../../shared/api/client';
import { API_CONFIG } from '../../../shared/api/config';

// Íconos SVG
const IdCardIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2" ry="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h2M15 12h2M7 16h5"/></svg>;
const LockIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const BellIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
const AlertIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
const SaveIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;

function DeleteAccountModal({
  isOpen,
  title,
  step,
  password,
  onClose,
  onConfirmStep,
  onPasswordChange,
  onDeleteAccount,
  t,
}: {
  isOpen: boolean;
  title: string;
  step: 'confirm' | 'verify';
  password: string;
  onClose: () => void;
  onConfirmStep: () => void;
  onPasswordChange: (value: string) => void;
  onDeleteAccount: () => void;
  t: (key: string) => string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-red-200 bg-white shadow-[0_28px_90px_-30px_rgba(127,29,29,0.42)]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-center gap-3 border-b border-red-100 bg-gradient-to-r from-[#FFF3F1] via-white to-white px-6 py-5 text-center">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FDECEC] text-[#D92D20] ring-8 ring-[#FFF5F4]">
            <AlertIcon />
          </span>
          <h3 className="text-2xl font-extrabold tracking-tight text-[#B42318] leading-tight text-center">{title}</h3>
        </div>

        <div className="space-y-5 bg-white px-6 py-6">
          {step === 'confirm' ? (
            <>
              <p className="text-sm leading-relaxed text-[#7A271A]">
                  {t('perfil.deleteAccountConfirmText')}
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 inline-flex items-center justify-center rounded-2xl border border-red-200 bg-white px-6 py-3.5 text-sm font-bold text-[#B42318] transition-colors hover:bg-[#FFF5F4] cursor-pointer"
                >
                  {t('common.cancel')}
                </button>

                <button
                  type="button"
                  onClick={onConfirmStep}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D92D20] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_28px_-12px_rgba(217,45,32,0.75)] transition-colors hover:bg-[#B42318] cursor-pointer"
                >
                  {t('common.confirm')}
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                  {t('perfil.deleteAccountPasswordLabel')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => onPasswordChange(e.target.value)}
                  placeholder={t('perfil.deleteAccountPasswordPlaceholder')}
                  className="w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-[#16333F] outline-none transition-colors placeholder:text-gray-400 focus:border-[#B42318]"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 inline-flex items-center justify-center rounded-2xl border border-red-200 bg-white px-6 py-3.5 text-sm font-bold text-[#B42318] transition-colors hover:bg-[#FFF5F4] cursor-pointer"
                >
                  {t('common.cancel')}
                </button>

                <button
                  type="button"
                  onClick={onDeleteAccount}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D92D20] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_28px_-12px_rgba(217,45,32,0.75)] transition-colors hover:bg-[#B42318] cursor-pointer"
                >
                  {t('common.confirm')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente Toggle Switch de Tailwind
const Toggle = ({ isOn, onClick }: { isOn: boolean; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${isOn ? 'bg-[#3A5664]' : 'bg-gray-200'}`}
  >
    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${isOn ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

export default function Perfil() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logoutNotifications } = useNotifications();
  const { logoutInvitations } = useInvitations();
  const { perfil, isLoading, formularios, handlers } = usePerfil();
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [deleteAccountStep, setDeleteAccountStep] = useState<'confirm' | 'verify'>('confirm');
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('');

  if (isLoading || !perfil) return <div className="h-full flex items-center justify-center font-bold text-[#16333F]">{t('perfil.loading')}</div>;

  const { formDatos, setFormDatos, formPreferencias, handleCambiarPreferencia, formPasswords, setFormPasswords } = formularios;

  const openDeleteAccountModal = () => {
    setDeleteAccountStep('confirm');
    setDeleteAccountPassword('');
    setIsDeleteAccountModalOpen(true);
  };

  const closeDeleteAccountModal = () => {
    setIsDeleteAccountModalOpen(false);
    setDeleteAccountStep('confirm');
    setDeleteAccountPassword('');
  };

  const handleDeleteAccountConfirm = () => {
    setDeleteAccountStep('verify');
  };

  const handleDeleteAccount = async () => {
    try {
      await apiClient.request<void>(API_CONFIG.AUTH.DELETE_ACCOUNT, {
        method: 'DELETE',
        body: { password: deleteAccountPassword },
      });

      await Promise.all([logoutNotifications(), logoutInvitations()]);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');

      window.alert(t('perfil.deleteAccountFarewell'));
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error eliminando la cuenta:', error);
      window.alert(t('perfil.deleteAccountError'));
    }
  };

  const deleteAccountModalTitle =
    deleteAccountStep === 'confirm'
      ? t('perfil.deleteAccountConfirmTitle')
      : t('perfil.deleteAccountVerificationTitle');

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-10">
      
      {/* Cabecera */}
      <div>
        <h1 className="text-3xl font-bold text-[#16333F] mb-2">{t('perfil.title')}</h1>
        <p className="text-sm text-gray-500">{t('perfil.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* --- PANEL IZQUIERDO (Info y Seguridad) --- */}
        <div className="lg:col-span-3 bg-gradient-to-br from-white to-[#F9FBFB] rounded-3xl p-8 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.06)] border border-gray-50">
          
          {/* Header del Perfil */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[#16333F] mb-1">{formDatos.nombres} {formDatos.apellidos}</h2>
            <p className="text-sm text-gray-500 mb-3">{perfil.rol}</p>
            <span className="inline-flex items-center gap-1.5 bg-[#E0F2E9] text-[#2E7D32] px-3 py-1 rounded-full text-[10px] font-bold">
              <span className="w-1.5 h-1.5 bg-[#2E7D32] rounded-full"></span>
              {perfil.estado}
            </span>
          </div>

          {/* Sección: Datos Personales */}
          <div className="mb-10">
            <h3 className="flex items-center gap-2 text-[#16333F] font-bold text-sm mb-6">
              <IdCardIcon /> {t('perfil.personalData')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">{t('perfil.firstName')}</label>
                <input type="text" value={formDatos.nombres} onChange={e => setFormDatos({...formDatos, nombres: e.target.value})} className="w-full bg-transparent border-b border-gray-200 py-1.5 text-sm text-[#16333F] font-semibold outline-none focus:border-[#16333F] transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">{t('perfil.lastName')}</label>
                <input type="text" value={formDatos.apellidos} onChange={e => setFormDatos({...formDatos, apellidos: e.target.value})} className="w-full bg-transparent border-b border-gray-200 py-1.5 text-sm text-[#16333F] font-semibold outline-none focus:border-[#16333F] transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">{t('perfil.email')}</label>
                <input type="email" value={formDatos.correo} onChange={e => setFormDatos({...formDatos, correo: e.target.value})} className="w-full bg-transparent border-b border-gray-200 py-1.5 text-sm text-[#16333F] font-semibold outline-none focus:border-[#16333F] transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">{t('perfil.mobilePhone')}</label>
                <input type="tel" value={formDatos.telefono} onChange={e => setFormDatos({...formDatos, telefono: e.target.value})} className="w-full bg-transparent border-b border-gray-200 py-1.5 text-sm text-[#16333F] font-semibold outline-none focus:border-[#16333F] transition-colors" />
              </div>
            </div>
          </div>

          {/* Sección: Seguridad y Contraseña */}
          <div className="mb-10">
            <h3 className="flex items-center gap-2 text-[#16333F] font-bold text-sm mb-6">
              <LockIcon /> {t('perfil.securityPassword')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 mb-1">{t('perfil.currentPassword')}</label>
                <input type="password" placeholder={t('auth.passwordPlaceholder')} value={formPasswords.actual} onChange={e => setFormPasswords({...formPasswords, actual: e.target.value})} className="w-full md:w-1/2 bg-transparent border-b border-gray-200 py-1.5 text-sm text-[#16333F] font-semibold outline-none focus:border-[#16333F] transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">{t('perfil.newPassword')}</label>
                <input type="password" placeholder={t('auth.passwordPlaceholder')} value={formPasswords.nueva} onChange={e => setFormPasswords({...formPasswords, nueva: e.target.value})} className="w-full bg-transparent border-b border-gray-200 py-1.5 text-sm text-[#16333F] font-semibold outline-none focus:border-[#16333F] transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">{t('perfil.confirmNewPassword')}</label>
                <input type="password" placeholder={t('auth.passwordPlaceholder')} value={formPasswords.confirmar} onChange={e => setFormPasswords({...formPasswords, confirmar: e.target.value})} className="w-full bg-transparent border-b border-gray-200 py-1.5 text-sm text-[#16333F] font-semibold outline-none focus:border-[#16333F] transition-colors" />
              </div>
            </div>
          </div>

          {/* Sección: Eliminar Cuenta */}
          <div className="mb-10">
            <h3 className="flex items-center gap-2 text-[#B42318] font-bold text-sm mb-6">
              <AlertIcon /> {t('perfil.deleteAccount')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={openDeleteAccountModal}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#D92D20] hover:bg-[#B42318] text-white rounded-xl text-sm font-bold transition-colors shadow-md cursor-pointer"
                >
                  <AlertIcon /> {t('perfil.deleteAccountButton')}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* --- PANEL DERECHO (Notificaciones y Guardar) --- */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <div className="bg-gradient-to-b from-[#F2F8F7] to-white rounded-3xl p-8 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.06)] border border-gray-50 flex-1">
            <h3 className="flex items-center gap-2 text-[#16333F] font-bold text-sm mb-8">
              <BellIcon /> {t('perfil.notificationPreferences')}
            </h3>

            <div className="space-y-8">
              {/* Opción 1 */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-[#16333F] font-bold text-sm mb-1">{t('perfil.immediateFallAlerts')}</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed pr-4">{t('perfil.immediateFallAlertsDesc')}</p>
                </div>
                <Toggle isOn={formPreferencias.alertasInmediatas} onClick={() => handleCambiarPreferencia('alertasInmediatas')} />
              </div>

              {/* Opción 2 */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-[#16333F] font-bold text-sm mb-1">{t('perfil.dailyActivitySummary')}</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed pr-4">{t('perfil.dailyActivitySummaryDesc')}</p>
                </div>
                <Toggle isOn={formPreferencias.resumenDiario} onClick={() => handleCambiarPreferencia('resumenDiario')} />
              </div>

              {/* Opción 3 */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-[#16333F] font-bold text-sm mb-1">{t('perfil.systemUpdates')}</h4>{/* Sección: Seguridad y Contraseña */}
          <div>
            <h3 className="flex items-center gap-2 text-[#16333F] font-bold text-sm mb-6">
              <LockIcon /> {t('perfil.securityPassword')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 mb-1">{t('perfil.currentPassword')}</label>
                <input type="password" placeholder={t('auth.passwordPlaceholder')} value={formPasswords.actual} onChange={e => setFormPasswords({...formPasswords, actual: e.target.value})} className="w-full md:w-1/2 bg-transparent border-b border-gray-200 py-1.5 text-sm text-[#16333F] font-semibold outline-none focus:border-[#16333F] transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">{t('perfil.newPassword')}</label>
                <input type="password" placeholder={t('auth.passwordPlaceholder')} value={formPasswords.nueva} onChange={e => setFormPasswords({...formPasswords, nueva: e.target.value})} className="w-full bg-transparent border-b border-gray-200 py-1.5 text-sm text-[#16333F] font-semibold outline-none focus:border-[#16333F] transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">{t('perfil.confirmNewPassword')}</label>
                <input type="password" placeholder={t('auth.passwordPlaceholder')} value={formPasswords.confirmar} onChange={e => setFormPasswords({...formPasswords, confirmar: e.target.value})} className="w-full bg-transparent border-b border-gray-200 py-1.5 text-sm text-[#16333F] font-semibold outline-none focus:border-[#16333F] transition-colors" />
              </div>
            </div>
          </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed pr-4">{t('perfil.systemUpdatesDesc')}</p>
                </div>
                <Toggle isOn={formPreferencias.actualizacionesSistema} onClick={() => handleCambiarPreferencia('actualizacionesSistema')} />
              </div>
            </div>
          </div>

          {/* Botones de Acción Globales */}
          <div className="flex gap-4 justify-end">
            <button className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors bg-white">
              {t('common.cancel')}
            </button>
            <button 
              onClick={handlers.handleGuardarCambios}
              className="px-6 py-3 bg-[#3A5664] hover:bg-[#16333F] text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-md"
            >
              <SaveIcon /> {t('common.saveChanges')}
            </button>
          </div>

        </div>

        <DeleteAccountModal
          isOpen={isDeleteAccountModalOpen}
          title={deleteAccountModalTitle}
          step={deleteAccountStep}
          password={deleteAccountPassword}
          onClose={closeDeleteAccountModal}
          onConfirmStep={handleDeleteAccountConfirm}
          onPasswordChange={setDeleteAccountPassword}
          onDeleteAccount={handleDeleteAccount}
          t={t}
        />

      </div>
    </div>
  );
}