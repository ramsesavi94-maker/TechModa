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
        <div className="flex h-full flex-col items-center justify-center gap-4 p-10 text-center">
          <ShoppingBag className="h-12 w-12 text-ink/20" />
          <p className="text-ink/60">Tu carrito está vacío.</p>
          <button onClick={onClose} className="btn-secondary">Seguir comprando</button>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="px-6 py-4">
            {missing > 0 ? (
              <>
                <p className="text-sm text-ink/70">Te faltan <strong>{formatPrice(missing)}</strong> para el envío gratis</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand">
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_FROM) * 100)}%` }} />
                </div>
              </>
            ) : (
              <p className="text-sm text-emerald-700">¡Tu pedido tiene envío gratis!</p>
            )}
          </div>

          <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
            {lines.map(({ product, quantity }) => (
              <li key={product.productId} className="flex gap-4 py-4">
                <ProductImage src={product.imageUrl} alt={product.name} className="h-24 w-20 shrink-0 rounded-lg" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <p className="truncate font-medium text-ink">{product.name}</p>
                    <button onClick={() => onRemove(product.productId)} className="text-ink/40 hover:text-red-600" aria-label={`Quitar ${product.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-ink/50">{formatPrice(product.price)}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-line text-sm">
                      <button onClick={() => onQuantity(product.productId, quantity - 1)} className="p-2" aria-label="Disminuir cantidad">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center tabular-nums">{quantity}</span>
                      <button
                        onClick={() => onQuantity(product.productId, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="p-2 disabled:opacity-30"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="font-medium tabular-nums">{formatPrice(product.price * quantity)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="space-y-2 border-t border-line bg-sand/50 px-6 py-5 text-sm">
            <div className="flex justify-between text-ink/70"><span>Subtotal</span><span className="tabular-nums">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-ink/70"><span>Envío</span><span className="tabular-nums">{shipping ? formatPrice(shipping) : 'Gratis'}</span></div>
            <div className="flex justify-between pt-2 text-base font-medium text-ink"><span>Total</span><span className="tabular-nums">{formatPrice(total)}</span></div>
            <button onClick={onCheckout} className="btn-primary mt-3 w-full">Finalizar compra</button>
            <p className="text-center text-xs text-ink/50">Pago simulado: esta demo no procesa cobros.</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
