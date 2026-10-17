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
}

export function ProductCard({ product, isAdmin, onOpen, onAddToCart, onEdit, onDelete }: ProductCardProps) {
  const soldOut = product.stock === 0;
  const lowStock = !soldOut && product.stock <= LOW_STOCK;

  return (
    <article className="group flex flex-col" data-testid="product-card">
      <div className="relative overflow-hidden rounded-xl bg-sand">
        <button
          onClick={() => onOpen?.(product)}
          className="block w-full"
          aria-label={`Ver detalles de ${product.name}`}
        >
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className={`aspect-[4/5] w-full transition duration-700 ease-out group-hover:scale-105 ${soldOut ? 'opacity-60 grayscale' : ''}`}
          />
        </button>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {soldOut && <span className="badge bg-ink text-paper">Agotado</span>}
          {lowStock && <span className="badge bg-accent text-paper">Últimas {product.stock}</span>}
        </div>

        {isAdmin ? (
          <div className="absolute right-3 top-3 flex gap-2">
            <button onClick={() => onEdit?.(product)} className="icon-btn" aria-label={`Editar ${product.name}`}>
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete?.(product)}
              className="icon-btn hover:!bg-red-600 hover:!text-white"
              aria-label={`Eliminar ${product.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          !soldOut && (
            <button
              onClick={() => onAddToCart?.(product)}
              className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-full bg-paper/95 py-2.5 text-sm font-medium text-ink shadow-lg backdrop-blur transition duration-300 hover:bg-ink hover:text-paper md:translate-y-2 md:opacity-0 md:focus-visible:translate-y-0 md:focus-visible:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100"
              aria-label={`Agregar ${product.name} al carrito`}
            >
              <Plus className="h-4 w-4" /> Agregar
            </button>
          )
        )}
      </div>

      <div className="mt-3 px-0.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/50">{product.category || 'Sin categoría'}</p>
        <h3 className="mt-0.5 line-clamp-2 font-medium leading-snug text-ink">{product.name}</h3>
        <p className="mt-1 text-ink/80 tabular-nums">{formatPrice(product.price)}</p>
        {isAdmin && (
          <p className={`mt-0.5 text-xs ${soldOut ? 'text-red-600' : 'text-ink/50'}`}>
            {product.stock} en inventario
          </p>
        )}
      </div>
    </article>
  );
}
