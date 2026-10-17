import { useCallback, useState } from 'react';

export interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'error';
}

let nextId = 1;

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notify = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  return { toasts, notify };
}

export function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-[60] md:bottom-4 md:top-auto flex flex-col items-center gap-2 md:inset-x-auto md:left-10 md:items-start" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.tone === 'error' ? 'alert' : 'status'}
          className={`pointer-events-auto flex animate-fade-up items-center gap-3 bg-ink px-5 py-3.5 text-[13px] text-paper ${
            t.tone === 'error' ? 'border-l-2 border-[#e08a7a]' : ''
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
