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

const sizes = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'md:max-w-5xl' };

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
      ? 'ml-auto h-full w-full max-w-[440px] animate-slide-in sm:rounded-l-3xl'
      : `w-full ${sizes[size]} mt-auto max-h-[92svh] rounded-t-3xl sm:m-auto sm:rounded-3xl animate-fade-up`;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 animate-fade-in bg-ink/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label={title} className={`relative flex flex-col overflow-hidden bg-paper shadow-2xl ${panel}`}>
        <div className={`flex items-center justify-between px-6 ${hideTitle ? 'absolute right-0 top-0 z-10 pt-4' : 'h-16 border-b border-line'}`}>
          {!hideTitle && <h2 className="display text-[28px] text-ink">{title}</h2>}
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full bg-paper text-ink transition hover:bg-ink hover:text-paper"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
