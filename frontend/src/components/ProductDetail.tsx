import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { formatPrice, FREE_SHIPPING_FROM, LOW_STOCK, SHIPPING_COST } from '../lib/format';
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
        <ProductImage src={product.imageUrl} alt={product.name} className="aspect-[4/5] w-full bg-surface max-md:max-h-[60svh]" />

        <div className="flex flex-col p-6 md:p-14">
          <p className="eyebrow text-muted">Inicio / {product.category}</p>
          <h2 className="mt-4 font-display text-[2.5rem] leading-[1] tracking-[-0.01em] text-ink">{product.name}</h2>
          <p className="mt-4 text-[15px] tabular-nums text-ink">{formatPrice(product.price)}</p>

          <p className="mt-8 text-[15px] leading-6 text-muted">{product.description || 'Sin descripción.'}</p>

          <p className={`mt-6 text-[13px] ${soldOut ? 'text-danger' : product.stock <= LOW_STOCK ? 'text-accent' : 'text-success'}`}>
            {soldOut ? 'Agotado por ahora' : product.stock <= LOW_STOCK ? `Solo quedan ${product.stock} piezas` : 'Disponible'}
          </p>

          {!soldOut && (
            <div className="mt-4 flex gap-3">
              <div className="flex h-12 items-center border border-ink">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-full w-11 items-center justify-center disabled:opacity-30"
                  disabled={quantity <= 1}
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <span className="w-6 text-center text-[13px] tabular-nums" aria-live="polite">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="flex h-full w-11 items-center justify-center disabled:opacity-30"
                  disabled={quantity >= product.stock}
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
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

          <div className="mt-10 divide-y divide-line border-y border-line text-[13px]">
            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between uppercase tracking-[0.12em]">
                Composición y cuidados <Plus className="h-3.5 w-3.5 transition-transform group-open:rotate-45" strokeWidth={1.5} />
              </summary>
              <p className="mt-3 leading-6 text-muted">Lavar a máquina en frío con colores similares. No usar secadora. Planchar a temperatura baja.</p>
            </details>
            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between uppercase tracking-[0.12em]">
                Envíos y devoluciones <Plus className="h-3.5 w-3.5 transition-transform group-open:rotate-45" strokeWidth={1.5} />
              </summary>
              <p className="mt-3 leading-6 text-muted">
                Envío gratis desde {formatPrice(FREE_SHIPPING_FROM)}; si no, {formatPrice(SHIPPING_COST)}. Devoluciones sin costo durante 30 días.
              </p>
            </details>
          </div>
        </div>
      </div>
    </Modal>
  );
}
