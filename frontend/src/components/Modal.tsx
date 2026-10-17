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

const sizes = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'md:max-w-6xl' };

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
      ? 'ml-auto h-full w-full max-w-[440px] animate-slide-in border-l border-line'
      : `w-full ${sizes[size]} h-full sm:m-auto sm:h-auto sm:max-h-[92vh] animate-fade-up`;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 animate-fade-in bg-black/30" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label={title} className={`relative flex flex-col overflow-hidden bg-paper ${panel}`}>
        <div className={`flex items-center justify-between px-6 ${hideTitle ? 'absolute right-0 top-0 z-10 pt-3' : 'h-16 border-b border-line'}`}>
          {!hideTitle && <h2 className="font-display text-[28px] leading-none text-ink">{title}</h2>}
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-2 flex h-11 w-11 items-center justify-center text-ink transition-opacity hover:opacity-60"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
