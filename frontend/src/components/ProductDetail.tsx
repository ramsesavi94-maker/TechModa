import { useEffect, useRef, useState } from 'react';
import { Loader2, Minus, Plus, RotateCcw, Sparkles, Square, Truck, Volume2 } from 'lucide-react';
import { useProductText } from '../hooks/useProductText';
import { api } from '../lib/api';
import { formatPrice, FREE_SHIPPING_FROM, LOW_STOCK } from '../lib/format';
import { LANGUAGES, useI18n } from '../lib/i18n';
import { CATEGORIES, type Product, type ProductInsights } from '../lib/types';
import { Modal } from './Modal';
import { ProductImage } from './ProductImage';

interface ProductDetailProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onError?: (message: string) => void;
}

export function ProductDetail({ product, onClose, onAddToCart, onError }: ProductDetailProps) {
  if (!product) return null;
  return <ProductDetailView key={product.productId} product={product} onClose={onClose} onAddToCart={onAddToCart} onError={onError} />;
}

type AudioState = 'idle' | 'loading' | 'playing';

function ProductDetailView({ product, onClose, onAddToCart, onError }: ProductDetailProps & { product: Product }) {
  const { t, lang } = useI18n();
  const { name, description, translating } = useProductText(product);
  const [quantity, setQuantity] = useState(1);
  const [insights, setInsights] = useState<ProductInsights | null>(null);
  const [audio, setAudio] = useState<AudioState>('idle');
  const player = useRef<HTMLAudioElement | null>(null);
  const soldOut = product.stock === 0;
  const category = (CATEGORIES as readonly string[]).includes(product.category)
    ? t(`cat.${product.category as (typeof CATEGORIES)[number]}`)
    : product.category;

  useEffect(() => {
    let cancelled = false;
    setInsights(null);
    api.productInsights(product, lang).then((data) => !cancelled && setInsights(data));
    return () => {
      cancelled = true;
    };
    // Solo depende del producto (por id) y del idioma.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.productId, lang]);

  const stopAudio = () => {
    player.current?.pause();
    player.current = null;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setAudio('idle');
  };

  // Al cerrar o cambiar de idioma no debe seguir sonando.
  useEffect(() => stopAudio, [lang]);

  const playDescription = async () => {
    if (audio !== 'idle') return stopAudio();
    setAudio('loading');

    // 1) Amazon Polly (si hay backend). 2) Voz del navegador como respaldo gratuito.
    const url = await api.speakProduct(product.productId, lang);
    if (url) {
      const el = new Audio(url);
      player.current = el;
      el.onended = () => setAudio('idle');
      el.onerror = () => setAudio('idle');
      try {
        await el.play();
        setAudio('playing');
      } catch {
        setAudio('idle');
      }
      return;
    }

    if (!('speechSynthesis' in window)) {
      setAudio('idle');
      onError?.(t('toast.audioError'));
      return;
    }
    const utterance = new SpeechSynthesisUtterance(`${name}. ${description}`);
    utterance.lang = LANGUAGES.find((l) => l.code === lang)?.speech ?? 'es-MX';
    utterance.onend = () => setAudio('idle');
    utterance.onerror = () => setAudio('idle');
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setAudio('playing');
  };

  return (
    <Modal
      open
      onClose={() => {
        stopAudio();
        onClose();
      }}
      title={name}
      size="lg"
      hideTitle
    >
      <div className="grid md:grid-cols-2">
        <div className="p-3 md:p-4">
          <ProductImage src={product.imageUrl} alt={name} className="aspect-[4/5] w-full rounded-2xl bg-surface max-md:max-h-[55svh] md:sticky md:top-4" />
        </div>

        <div className="flex flex-col p-5 md:p-10 md:pl-6">
          <span className="badge self-start bg-surface text-ink">{category}</span>
          <h2 className="display mt-4 text-[clamp(2.5rem,5vw,3.75rem)] text-ink">{name}</h2>
          <p className="mt-3 text-2xl font-bold tabular-nums text-ink">{formatPrice(product.price)}</p>

          <p className="mt-6 text-[15px] leading-6 text-muted">
            {translating ? t('detail.translating') : description || t('detail.noDescription')}
          </p>

          <button
            onClick={playDescription}
            className="mt-4 flex h-10 items-center gap-2 self-start rounded-full border-2 border-ink px-4 text-[12px] font-semibold uppercase tracking-[0.06em] transition hover:bg-ink hover:text-paper"
            aria-pressed={audio === 'playing'}
          >
            {audio === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : audio === 'playing' ? (
              <Square className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
            {audio === 'idle' ? t('detail.listen') : t('detail.stop')}
          </button>

          <p className="mt-6 flex items-center gap-2 text-[13px] font-semibold">
            <span className={`h-2.5 w-2.5 rounded-full ${soldOut ? 'bg-danger' : product.stock <= LOW_STOCK ? 'bg-coral' : 'bg-success'}`} aria-hidden="true" />
            {soldOut ? t('detail.soldOut') : product.stock <= LOW_STOCK ? t('detail.lastN', { n: product.stock }) : t('detail.available')}
          </p>

          {!soldOut && (
            <div className="mt-4 flex gap-3">
              <div className="flex h-12 items-center rounded-full border-2 border-ink">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-full w-11 items-center justify-center disabled:opacity-30"
                  disabled={quantity <= 1}
                  aria-label={t('detail.decrease')}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center font-semibold tabular-nums" aria-live="polite">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="flex h-full w-11 items-center justify-center disabled:opacity-30"
                  disabled={quantity >= product.stock}
                  aria-label={t('detail.increase')}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => {
                  stopAudio();
                  onAddToCart(product, quantity);
                  onClose();
                }}
                className="btn-primary flex-1"
              >
                {t('detail.addToBag')}
              </button>
            </div>
          )}

          <section aria-label={t('detail.insightsTitle')} className="mt-8 rounded-3xl bg-ink p-5 text-paper">
            <div className="flex items-center justify-between gap-3">
              <h3 className="display text-2xl">{t('detail.insightsTitle')}</h3>
              {insights && (
                <span className={`badge flex items-center gap-1 ${insights.ai ? 'bg-lime text-ink' : 'bg-paper/15 text-paper'}`}>
                  {insights.ai && <Sparkles className="h-3 w-3" />}
                  {insights.ai ? t('detail.aiBadge') : t('detail.localBadge')}
                </span>
              )}
            </div>
            {!insights ? (
              <p className="mt-4 flex items-center gap-2 text-[13px] text-paper/80">
                <Loader2 className="h-4 w-4 animate-spin" /> {t('detail.loadingInsights')}
              </p>
            ) : (
              <dl className="mt-4 space-y-4 text-[14px]">
                <div>
                  <dt className="eyebrow text-lime">{t('detail.features')}</dt>
                  <dd>
                    <ul className="mt-2 space-y-1.5">
                      {insights.features.map((f) => (
                        <li key={f} className="flex gap-2 text-paper/90">
                          <span className="text-lime" aria-hidden="true">✦</span> {f}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-lime">{t('detail.season')}</dt>
                  <dd className="mt-1 text-paper/90">{insights.season}</dd>
                </div>
                <div>
                  <dt className="eyebrow text-lime">{t('detail.tip')}</dt>
                  <dd className="mt-1 text-paper/90">{insights.tip}</dd>
                </div>
              </dl>
            )}
          </section>

          <ul className="mt-4 grid gap-2 text-[13px]">
            <li className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
              <Truck className="h-4 w-4 shrink-0" /> {t('detail.freeShipping', { amount: formatPrice(FREE_SHIPPING_FROM) })}
            </li>
            <li className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
              <RotateCcw className="h-4 w-4 shrink-0" /> {t('detail.returns')}
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
