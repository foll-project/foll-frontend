import { useTranslation } from 'react-i18next';
import { Modal } from "../../../shared/components/modals/Modal";

interface PatientQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
}

export function PatientQrModal({ isOpen, onClose, patientId, patientName }: PatientQrModalProps) {
  const { t } = useTranslation();
  // Aseguramos el formato estricto que espera la App Móvil
  const qrValue = `foll:patient:${patientId}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('abuelitos.modals.qrTitle', { name: patientName })}>
      <div className="flex flex-col items-center justify-center p-4">
        <p className="text-sm text-gray-500 mb-6 text-center">
          {t('abuelitos.modals.qrDescription')}
        </p>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center justify-center w-64 h-64 overflow-hidden">
           <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrValue)}`} 
              alt={t('abuelitos.modals.qrAlt')} 
              className="w-full h-full object-contain"
           />
        </div>
        <p className="text-xs font-bold text-gray-400">
          {t('common.patientId', { id: patientId })}
        </p>
      </div>
    </Modal>
  );
}
