import { useEffect, useRef, useState, type FormEvent } from 'react';
import { MessageCircle, Plus, Send, Sparkles, X } from 'lucide-react';
import { useProductText } from '../hooks/useProductText';
import { api } from '../lib/api';
import { formatPrice } from '../lib/format';
import { useI18n } from '../lib/i18n';
import type { AssistantMessage, Product } from '../lib/types';
import { ProductImage } from './ProductImage';

interface AssistantWidgetProps {
  products: Product[];
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

function Suggestion({ product, onOpen, onAdd }: { product: Product; onOpen: () => void; onAdd: () => void }) {
  const { t } = useI18n();
  const { name } = useProductText(product);
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-white p-2 pr-3">
      <button onClick={onOpen} className="shrink-0" aria-label={t('card.details', { name })}>
        <ProductImage src={product.imageUrl} alt={name} className="h-16 w-14 rounded-xl" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium">{name}</p>
        <p className="text-[13px] font-bold tabular-nums">{formatPrice(product.price)}</p>
      </div>
      <button onClick={onOpen} className="text-[12px] font-semibold underline underline-offset-2">{t('assistant.view')}</button>
      <button
        onClick={onAdd}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-paper hover:bg-lime hover:text-ink"
        aria-label={t('card.addLabel', { name })}
      >
        <Plus className="h-4 w-4" />
      </button>
    </li>
  );
}

export function AssistantWidget({ products, onOpenProduct, onAddToCart }: AssistantWidgetProps) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, thinking]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || thinking) return;
    setInput('');
    const history = messages;
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setThinking(true);
    const result = await api.askAssistant(message, history, lang, products);
    setMessages((prev) => [...prev, { role: 'assistant', content: result.reply, productIds: result.productIds, ai: result.ai }]);
    setThinking(false);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const byId = (id: string) => products.find((p) => p.productId === id);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex h-14 items-center gap-2 rounded-full bg-lime pl-4 pr-5 text-[13px] font-bold uppercase tracking-[0.04em] text-ink shadow-xl ring-2 ring-ink transition hover:-translate-y-0.5 md:bottom-6 md:right-6"
        aria-label={t('assistant.open')}
      >
        <MessageCircle className="h-5 w-5" />
        <span className="max-sm:hidden">Vale</span>
      </button>
    );
  }

  return (
    <section
      role="dialog"
      aria-label={t('assistant.title')}
      className="fixed inset-x-3 bottom-3 z-50 flex max-h-[80svh] animate-fade-up flex-col overflow-hidden rounded-3xl bg-paper shadow-2xl ring-2 ring-ink sm:inset-x-auto sm:right-6 sm:w-[400px] md:bottom-6"
    >
      <header className="flex items-center gap-3 bg-ink px-4 py-3 text-paper">
        <span className="display flex h-10 w-10 items-center justify-center rounded-full bg-lime text-xl text-ink">V</span>
        <div className="min-w-0 flex-1">
          <p className="display text-xl leading-none">{t('assistant.title')}</p>
          <p className="mt-1 text-[12px] text-paper/70">{t('assistant.subtitle')}</p>
        </div>
        <button onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-paper/10" aria-label={t('assistant.close')}>
          <X className="h-5 w-5" />
        </button>
      </header>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto scroll-smooth bg-surface/60 p-4" aria-live="polite">
        <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-[14px] leading-6">{t('assistant.greeting')}</p>

        {messages.map((m, i) =>
          m.role === 'user' ? (
            <p key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-ink px-4 py-3 text-[14px] leading-6 text-paper">
              {m.content}
            </p>
          ) : (
            <div key={i} className="max-w-[92%] space-y-2">
              <p className="rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-[14px] leading-6">
                {m.content}
                {m.ai && (
                  <span className="badge ml-2 inline-flex items-center gap-1 bg-lime align-middle text-ink">
                    <Sparkles className="h-3 w-3" /> {t('assistant.ai')}
                  </span>
                )}
              </p>
              {!!m.productIds?.length && (
                <ul className="space-y-2">
                  {m.productIds.map(byId).filter((p): p is Product => !!p).map((p) => (
                    <Suggestion
                      key={p.productId}
                      product={p}
                      onOpen={() => {
                        // Se minimiza para no tapar el detalle; la conversación se conserva.
                        setOpen(false);
                        onOpenProduct(p);
                      }}
                      onAdd={() => onAddToCart(p)}
                    />
                  ))}
                </ul>
              )}
            </div>
          ),
        )}

        {thinking && <p className="text-[13px] italic text-muted">{t('assistant.typing')}</p>}
      </div>

      {messages.length === 0 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-line px-4 py-3">
          {(['assistant.suggest1', 'assistant.suggest2', 'assistant.suggest3'] as const).map((key) => (
            <button
              key={key}
              onClick={() => send(t(key))}
              className="shrink-0 rounded-full border border-ink bg-white px-3 py-1.5 text-[12px] font-semibold hover:bg-lime"
            >
              {t(key)}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-line bg-paper p-3">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('assistant.placeholder')}
          aria-label={t('assistant.placeholder')}
          maxLength={500}
          className="h-11 min-w-0 flex-1 rounded-full border border-line bg-white px-4 text-[14px] outline-none focus:border-ink focus:ring-2 focus:ring-lime focus-visible:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || thinking}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition hover:bg-lime hover:text-ink disabled:opacity-40"
          aria-label={t('assistant.send')}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}
