import { useEffect, useState } from 'react';
import { Minus, Plus, ShoppingBag, Truck } from 'lucide-react';
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
        <ProductImage src={product.imageUrl} alt={product.name} className="aspect-[4/3] w-full md:aspect-auto md:h-full md:min-h-[32rem]" />
        <div className="flex flex-col gap-6 p-6 md:p-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink/50">{product.category}</p>
            <h2 className="mt-2 font-display text-3xl leading-tight text-ink md:text-4xl">{product.name}</h2>
            <p className="mt-3 text-2xl tabular-nums text-ink">{formatPrice(product.price)}</p>
          </div>

          <p className="leading-relaxed text-ink/70">{product.description || 'Sin descripción.'}</p>

          <p className={`text-sm ${soldOut ? 'text-red-600' : product.stock <= LOW_STOCK ? 'text-accent' : 'text-emerald-700'}`}>
            {soldOut
              ? 'Agotado por ahora'
              : product.stock <= LOW_STOCK
                ? `¡Solo quedan ${product.stock}!`
                : 'Disponible'}
          </p>

          {!soldOut && (
            <div className="flex gap-3">
              <div className="flex items-center rounded-full border border-line">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 text-ink/70 hover:text-ink disabled:opacity-30"
                  disabled={quantity <= 1}
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center tabular-nums" aria-live="polite">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-3 text-ink/70 hover:text-ink disabled:opacity-30"
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
                <ShoppingBag className="h-4 w-4" /> Agregar al carrito
              </button>
            </div>
          )}

          <div className="mt-auto flex items-center gap-3 rounded-xl bg-sand px-4 py-3 text-sm text-ink/70">
            <Truck className="h-5 w-5 shrink-0" />
            Envío gratis en pedidos desde {formatPrice(FREE_SHIPPING_FROM)}
          </div>
        </div>
      </div>
    </Modal>
  );
}
