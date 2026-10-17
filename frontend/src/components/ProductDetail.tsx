import { useEffect, useState } from 'react';
import { Minus, Plus, RotateCcw, Truck } from 'lucide-react';
import { formatPrice, FREE_SHIPPING_FROM, LOW_STOCK } from '../lib/format';
import type { Product } from '../lib/types';
import { Modal } from './Modal';
import { ProductImage } from './ProductImage';

interface ProductDetailProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductDetail({ product, onClose, onAddToCart }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => setQuantity(1), [product?.productId]);

  if (!product) return null;
  const soldOut = product.stock === 0;

  return (
    <Modal open onClose={onClose} title={product.name} size="lg" hideTitle>
      <div className="grid md:grid-cols-2">
        <div className="p-3 md:p-4">
          <ProductImage src={product.imageUrl} alt={product.name} className="aspect-[4/5] w-full rounded-2xl bg-surface max-md:max-h-[55svh]" />
        </div>

        <div className="flex flex-col p-5 md:p-10 md:pl-6">
          <span className="badge self-start bg-surface text-ink">{product.category}</span>
          <h2 className="display mt-4 text-[clamp(2.5rem,5vw,3.75rem)] text-ink">{product.name}</h2>
          <p className="mt-3 text-2xl font-bold tabular-nums text-ink">{formatPrice(product.price)}</p>

          <p className="mt-6 text-[15px] leading-6 text-muted">{product.description || 'Sin descripción.'}</p>

          <p className="mt-6 flex items-center gap-2 text-[13px] font-semibold">
            <span className={`h-2.5 w-2.5 rounded-full ${soldOut ? 'bg-danger' : product.stock <= LOW_STOCK ? 'bg-coral' : 'bg-success'}`} aria-hidden="true" />
            {soldOut ? 'Agotado por ahora' : product.stock <= LOW_STOCK ? `¡Solo quedan ${product.stock}!` : 'Disponible'}
          </p>

          {!soldOut && (
            <div className="mt-4 flex gap-3">
              <div className="flex h-12 items-center rounded-full border-2 border-ink">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-full w-11 items-center justify-center disabled:opacity-30"
                  disabled={quantity <= 1}
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center font-semibold tabular-nums" aria-live="polite">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="flex h-full w-11 items-center justify-center disabled:opacity-30"
                  disabled={quantity >= product.stock}
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => {
                  onAddToCart(product, quantity);
                  onClose();
                }}
                className="btn-primary flex-1"
              >
                Agregar a la bolsa
              </button>
            </div>
          )}

          <ul className="mt-8 grid gap-2 text-[13px]">
            <li className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
              <Truck className="h-4 w-4 shrink-0" /> Envío gratis desde {formatPrice(FREE_SHIPPING_FROM)}
            </li>
            <li className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
              <RotateCcw className="h-4 w-4 shrink-0" /> Devoluciones gratis durante 30 días
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
