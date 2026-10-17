import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <div className="space-y-6 p-6">
        <p className="text-[15px] leading-6 text-muted">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={onConfirm} className="btn-primary flex-1 !bg-danger">{confirmLabel}</button>
        </div>
      </div>
    </Modal>
  );
}
