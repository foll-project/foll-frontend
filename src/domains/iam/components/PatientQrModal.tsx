import { Modal } from "../../../shared/components/modals/Modal";

interface PatientQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
}

export function PatientQrModal({ isOpen, onClose, patientId, patientName }: PatientQrModalProps) {
  // Aseguramos el formato estricto que espera la App Móvil
  const qrValue = `foll:patient:${patientId}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Código QR - ${patientName}`}>
      <div className="flex flex-col items-center justify-center p-4">
        <p className="text-sm text-gray-500 mb-6 text-center">
          Pide a otro usuario que escanee este código desde la app móvil para unirse al equipo de cuidado.
        </p>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center justify-center w-64 h-64 overflow-hidden">
           <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrValue)}`} 
              alt="Código QR del Paciente" 
              className="w-full h-full object-contain"
           />
        </div>
        <p className="text-xs font-bold text-gray-400">
          ID del Paciente: {patientId}
        </p>
      </div>
    </Modal>
  );
}
