import { useEffect, useState, type CSSProperties } from 'react';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { useProductText } from '../hooks/useProductText';
import { formatPrice, LOW_STOCK } from '../lib/format';
import { useI18n } from '../lib/i18n';
import { CATEGORIES, type Product } from '../lib/types';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
  isNew?: boolean;
  onOpen?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  style?: CSSProperties;
}

export function ProductCard({ product, isAdmin, isNew, onOpen, onAddToCart, onEdit, onDelete, style }: ProductCardProps) {
  const { t } = useI18n();
  const { name } = useProductText(product);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock === 0;
  const lowStock = !soldOut && product.stock <= LOW_STOCK;
  const knownCategory = (CATEGORIES as readonly string[]).includes(product.category);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1500);
    return () => clearTimeout(timer);
  }, [added]);

  return (
    <article className="group flex animate-fade-up flex-col" style={style} data-testid="product-card">
      <div className="relative overflow-hidden rounded-2xl bg-surface">
        <button
          onClick={() => onOpen?.(product)}
          className="block w-full focus-visible:outline-offset-[-4px]"
          aria-label={t('card.details', { name })}
        >
          <ProductImage
            src={product.imageUrl}
            alt={name}
            className={`aspect-[4/5] w-full transition duration-700 ease-out-quint group-hover:scale-105 ${soldOut ? 'opacity-60 grayscale' : ''}`}
          />
        </button>

        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {soldOut && <span className="badge bg-ink text-paper">{t('badge.soldOut')}</span>}
          {lowStock && <span className="badge bg-coral text-ink">{t('badge.last', { n: product.stock })}</span>}
          {isNew && !soldOut && <span className="badge bg-lime text-ink">{t('badge.new')}</span>}
        </div>

        {isAdmin ? (
          <div className="absolute right-2.5 top-2.5 flex gap-1.5">
            <button onClick={() => onEdit?.(product)} className="icon-btn" aria-label={`Editar ${product.name}`}>
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => onDelete?.(product)} className="icon-btn hover:!bg-danger" aria-label={`Eliminar ${product.name}`}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          !soldOut && (
            <button
              onClick={() => {
                onAddToCart?.(product);
                setAdded(true);
              }}
              className={`absolute bottom-2.5 right-2.5 flex h-10 items-center gap-1.5 rounded-full pl-3 pr-4 text-[12px] font-semibold uppercase tracking-[0.04em] shadow-lg transition duration-300 ease-out-quint md:translate-y-2 md:opacity-0 md:focus-visible:translate-y-0 md:focus-visible:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100 ${
                added ? 'bg-lime text-ink md:translate-y-0 md:opacity-100' : 'bg-ink text-paper hover:bg-lime hover:text-ink'
              }`}
              aria-label={t('card.addLabel', { name })}
            >
              {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span className="max-sm:hidden">{added ? t('card.added') : t('card.add')}</span>
            </button>
          )
        )}
      </div>

      <div className="mt-3 px-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-[14px] font-medium leading-snug text-ink">{name}</h3>
          <p className="shrink-0 text-[14px] font-bold tabular-nums text-ink">{formatPrice(product.price)}</p>
        </div>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
          {knownCategory ? t(`cat.${product.category as (typeof CATEGORIES)[number]}`) : product.category || 'Sin categoría'}
          {isAdmin && (
            <>
              {' · '}
              <span className={`normal-case tracking-normal ${soldOut ? 'text-danger' : ''}`}>{`${product.stock} en inventario`}</span>
            </>
          )}
        </p>
      </div>
    </article>
  );
}
