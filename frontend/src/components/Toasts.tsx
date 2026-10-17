import { useCallback, useState } from 'react';
import { AlertCircle, Check } from 'lucide-react';

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
    <div className="pointer-events-none fixed inset-x-3 top-3 z-[60] flex flex-col items-center gap-2 md:inset-x-auto md:bottom-6 md:left-6 md:top-auto md:items-start" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.tone === 'error' ? 'alert' : 'status'}
          className="pointer-events-auto flex animate-fade-up items-center gap-3 rounded-full bg-ink py-2 pl-2 pr-5 text-[13px] font-medium text-paper shadow-xl"
        >
          <span className={`flex h-7 w-7 items-center justify-center rounded-full ${t.tone === 'error' ? 'bg-coral' : 'bg-lime'} text-ink`}>
            {t.tone === 'error' ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
