import type { CSSProperties } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { formatPrice, LOW_STOCK } from '../lib/format';
import type { Product } from '../lib/types';
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
  const soldOut = product.stock === 0;
  const lowStock = !soldOut && product.stock <= LOW_STOCK;

  return (
    <article className="group flex animate-fade-up flex-col" style={style} data-testid="product-card">
      <div className="relative overflow-hidden rounded-2xl bg-surface">
        <button
          onClick={() => onOpen?.(product)}
          className="block w-full focus-visible:outline-offset-[-4px]"
          aria-label={`Ver detalles de ${product.name}`}
        >
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className={`aspect-[4/5] w-full transition duration-700 ease-out-quint group-hover:scale-105 ${soldOut ? 'opacity-60 grayscale' : ''}`}
          />
        </button>

        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {soldOut && <span className="badge bg-ink text-paper">Agotado</span>}
          {lowStock && <span className="badge bg-coral text-ink">Últimas {product.stock}</span>}
          {isNew && !soldOut && <span className="badge bg-lime text-ink">Nuevo</span>}
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
              onClick={() => onAddToCart?.(product)}
              className="absolute bottom-2.5 right-2.5 flex h-10 items-center gap-1.5 rounded-full bg-ink pl-3 pr-4 text-[12px] font-semibold uppercase tracking-[0.04em] text-paper shadow-lg transition duration-300 ease-out-quint hover:bg-lime hover:text-ink md:translate-y-2 md:opacity-0 md:focus-visible:translate-y-0 md:focus-visible:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100"
              aria-label={`Agregar ${product.name} al carrito`}
            >
              <Plus className="h-4 w-4" /> <span className="max-sm:hidden">Añadir</span>
            </button>
          )
        )}
      </div>

      <div className="mt-3 px-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-[14px] font-medium leading-snug text-ink">{product.name}</h3>
          <p className="shrink-0 text-[14px] font-bold tabular-nums text-ink">{formatPrice(product.price)}</p>
        </div>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
          {product.category || 'Sin categoría'}
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
