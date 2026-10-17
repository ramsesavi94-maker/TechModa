import { Minus, Plus } from 'lucide-react';
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
        <div className="flex h-full flex-col items-center justify-center gap-6 p-10 text-center">
          <p className="font-display text-2xl text-ink">Tu bolsa está vacía</p>
          <button onClick={onClose} className="btn-secondary">Seguir comprando</button>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="px-6 py-5">
            <p className="text-[13px] text-muted">
              {missing > 0 ? (
                <>Te faltan <span className="text-ink">{formatPrice(missing)}</span> para el envío gratis</>
              ) : (
                'Tu pedido tiene envío gratis'
              )}
            </p>
            <div className="mt-3 h-0.5 bg-line">
              <div
                className="h-full bg-ink transition-[width] duration-500 ease-out-quint"
                style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_FROM) * 100)}%` }}
              />
            </div>
          </div>

          <ul className="flex-1 divide-y divide-line overflow-y-auto border-t border-line px-6">
            {lines.map(({ product, quantity }) => (
              <li key={product.productId} className="flex gap-4 py-5">
                <ProductImage src={product.imageUrl} alt={product.name} className="h-28 w-[90px] shrink-0 bg-surface" />
                <div className="flex min-w-0 flex-1 flex-col text-[13px]">
                  <div className="flex justify-between gap-3">
                    <p className="truncate text-ink">{product.name}</p>
                    <p className="shrink-0 tabular-nums">{formatPrice(product.price * quantity)}</p>
                  </div>
                  <p className="mt-0.5 text-muted">{formatPrice(product.price)} c/u</p>
                  <div className="mt-auto flex items-end justify-between">
                    <div className="flex h-11 items-center border border-line">
                      <button onClick={() => onQuantity(product.productId, quantity - 1)} className="flex h-full w-11 items-center justify-center" aria-label="Disminuir cantidad">
                        <Minus className="h-3 w-3" strokeWidth={1.5} />
                      </button>
                      <span className="w-5 text-center tabular-nums">{quantity}</span>
                      <button
                        onClick={() => onQuantity(product.productId, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="flex h-full w-11 items-center justify-center disabled:opacity-30"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="h-3 w-3" strokeWidth={1.5} />
                      </button>
                    </div>
                    <button
                      onClick={() => onRemove(product.productId)}
                      className="text-[11px] uppercase tracking-[0.12em] text-muted underline underline-offset-4 hover:text-ink"
                      aria-label={`Quitar ${product.name}`}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="space-y-2 border-t border-line px-6 py-6 text-[13px]">
            <div className="flex justify-between text-muted"><span>Subtotal</span><span className="tabular-nums">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-muted"><span>Envío</span><span className="tabular-nums">{shipping ? formatPrice(shipping) : 'Gratis'}</span></div>
            <div className="flex justify-between pt-2 text-[15px] text-ink"><span>Total</span><span className="tabular-nums">{formatPrice(total)}</span></div>
            <button onClick={onCheckout} className="btn-primary mt-4 w-full">Finalizar compra</button>
            <p className="pt-1 text-center text-[11px] text-muted">Pago simulado: esta demo no procesa cobros.</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
