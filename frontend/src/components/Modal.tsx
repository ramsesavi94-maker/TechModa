import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** 'center' para diálogos, 'right' para paneles laterales (carrito). */
  variant?: 'center' | 'right';
  size?: 'sm' | 'md' | 'lg';
  hideTitle?: boolean;
}

const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-4xl' };

export function Modal({ open, onClose, title, children, variant = 'center', size = 'md', hideTitle }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const panel =
    variant === 'right'
      ? 'ml-auto h-full w-full max-w-md animate-slide-in rounded-none'
      : `m-auto w-full ${sizes[size]} max-h-[92vh] animate-pop-in rounded-2xl`;

  return (
    <div className="fixed inset-0 z-50 flex p-0 sm:p-4" data-variant={variant}>
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex flex-col overflow-hidden bg-paper shadow-2xl ${panel} ${variant === 'right' ? 'sm:-my-4 sm:-mr-4' : ''}`}
      >
        <div className={`flex items-center justify-between px-6 pt-5 ${hideTitle ? 'absolute right-0 top-0 z-10' : 'pb-4 border-b border-line'}`}>
          {!hideTitle && <h2 className="font-display text-2xl text-ink">{title}</h2>}
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-2 text-ink/60 transition hover:bg-ink/5 hover:text-ink bg-paper/80"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
