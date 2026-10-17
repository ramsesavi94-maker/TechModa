import type { CSSProperties } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { formatPrice, LOW_STOCK } from '../lib/format';
import type { Product } from '../lib/types';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
  onOpen?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  style?: CSSProperties;
}

export function ProductCard({ product, isAdmin, onOpen, onAddToCart, onEdit, onDelete, style }: ProductCardProps) {
  const soldOut = product.stock === 0;
  const lowStock = !soldOut && product.stock <= LOW_STOCK;

  return (
    <article className="group flex animate-fade-up flex-col" style={style} data-testid="product-card">
      <div className="relative overflow-hidden bg-surface">
        <button
          onClick={() => onOpen?.(product)}
          className="block w-full focus-visible:outline-offset-[-3px] focus-visible:outline-paper"
          aria-label={`Ver detalles de ${product.name}`}
        >
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className={`aspect-[4/5] w-full transition duration-[900ms] ease-out-quint group-hover:scale-[1.03] ${soldOut ? 'opacity-60 grayscale' : ''}`}
          />
        </button>

        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
          {soldOut && <span className="badge text-ink">Agotado</span>}
          {lowStock && <span className="badge text-accent">Últimas {product.stock}</span>}
        </div>

        {isAdmin ? (
          <div className="absolute right-2 top-2 flex gap-1">
            <button onClick={() => onEdit?.(product)} className="icon-btn" aria-label={`Editar ${product.name}`}>
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => onDelete?.(product)}
              className="icon-btn hover:!bg-danger"
              aria-label={`Eliminar ${product.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          !soldOut && (
            <button
              onClick={() => onAddToCart?.(product)}
              className="icon-btn absolute bottom-2 right-2 duration-200 md:translate-y-1 md:opacity-0 md:focus-visible:translate-y-0 md:focus-visible:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100"
              aria-label={`Agregar ${product.name} al carrito`}
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
            </button>
          )
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3 text-[13px]">
        <h3 className="min-w-0 truncate text-ink">{product.name}</h3>
        <p className="shrink-0 tabular-nums text-ink">{formatPrice(product.price)}</p>
      </div>
      <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-muted">
        {product.category || 'Sin categoría'}
        {isAdmin && (
          <>
            {' · '}
            <span className={`normal-case tracking-normal ${soldOut ? 'text-danger' : ''}`}>{`${product.stock} en inventario`}</span>
          </>
        )}
      </p>
    </article>
  );
}
