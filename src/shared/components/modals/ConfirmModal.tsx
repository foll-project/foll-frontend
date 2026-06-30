import { Modal } from "./Modal";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDestructive = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col space-y-6">
        <p className="text-sm text-gray-600 text-center px-4">
          {message}
        </p>
        
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 bg-white border border-gray-300 text-gray-600 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 text-white py-2.5 rounded-xl font-bold text-sm transition-colors ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#3D5665] hover:bg-[#16333F]"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
