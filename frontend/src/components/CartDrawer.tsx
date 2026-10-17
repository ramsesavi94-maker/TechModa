import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { formatPrice, FREE_SHIPPING_FROM } from '../lib/format';
import type { CartLine } from '../lib/types';
import { Modal } from './Modal';
import { ProductImage } from './ProductImage';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  lines: CartLine[];
  subtotal: number;
  shipping: number;
  total: number;
  onQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({ open, onClose, lines, subtotal, shipping, total, onQuantity, onRemove, onCheckout }: CartDrawerProps) {
  const missing = FREE_SHIPPING_FROM - subtotal;

  return (
    <Modal open={open} onClose={onClose} title="Tu carrito" variant="right">
      {lines.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-5 p-10 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-lime">
            <ShoppingBag className="h-8 w-8" />
          </span>
          <p className="display text-4xl text-ink">Tu bolsa está vacía</p>
          <button onClick={onClose} className="btn-primary">Seguir comprando</button>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="m-4 rounded-2xl bg-surface p-4">
            <p className="text-[13px] font-medium">
              {missing > 0 ? (
                <>Te faltan <strong>{formatPrice(missing)}</strong> para el envío gratis</>
              ) : (
                '¡Tu pedido tiene envío gratis! 🎉'
              )}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper">
              <div
                className="h-full rounded-full bg-lime transition-[width] duration-500 ease-out-quint"
                style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_FROM) * 100)}%` }}
              />
            </div>
          </div>

          <ul className="flex-1 divide-y divide-line overflow-y-auto px-4">
            {lines.map(({ product, quantity }) => (
              <li key={product.productId} className="flex gap-4 py-4">
                <ProductImage src={product.imageUrl} alt={product.name} className="h-28 w-[90px] shrink-0 rounded-xl bg-surface" />
                <div className="flex min-w-0 flex-1 flex-col text-[14px]">
                  <div className="flex justify-between gap-2">
                    <p className="line-clamp-2 font-medium text-ink">{product.name}</p>
                    <button onClick={() => onRemove(product.productId)} className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-danger" aria-label={`Quitar ${product.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-[13px] text-muted">{formatPrice(product.price)} c/u</p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex h-11 items-center rounded-full border border-line bg-white">
                      <button onClick={() => onQuantity(product.productId, quantity - 1)} className="flex h-full w-11 items-center justify-center" aria-label="Disminuir cantidad">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center font-semibold tabular-nums">{quantity}</span>
                      <button
                        onClick={() => onQuantity(product.productId, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="flex h-full w-11 items-center justify-center disabled:opacity-30"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="font-bold tabular-nums">{formatPrice(product.price * quantity)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="space-y-2 border-t border-line px-6 py-5 text-[14px]">
            <div className="flex justify-between text-muted"><span>Subtotal</span><span className="tabular-nums">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-muted"><span>Envío</span><span className="tabular-nums">{shipping ? formatPrice(shipping) : 'Gratis'}</span></div>
            <div className="flex items-baseline justify-between pt-1 text-ink">
              <span className="display text-2xl">Total</span>
              <span className="text-xl font-bold tabular-nums">{formatPrice(total)}</span>
            </div>
            <button onClick={onCheckout} className="btn-lime mt-3 w-full">Finalizar compra</button>
            <p className="pt-1 text-center text-[11px] text-muted">Pago simulado: esta demo no procesa cobros.</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
