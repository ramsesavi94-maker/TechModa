import { useEffect, useMemo, useState } from 'react';
import { FREE_SHIPPING_FROM, SHIPPING_COST } from '../lib/format';
import type { CartLine, Product } from '../lib/types';

// El carrito es solo del lado del cliente: la API del capstone no tiene pedidos.
const STORAGE_KEY = 'techmoda.cart.v1';
type StoredLine = { productId: string; quantity: number };

function loadCart(): StoredLine[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as StoredLine[]) : [];
  } catch {
    return [];
  }
}

export function useCart(products: Product[]) {
  const [stored, setStored] = useState<StoredLine[]>(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // sin almacenamiento: el carrito vive solo en memoria
    }
  }, [stored]);

  // Se resuelve contra el catálogo actual: si un producto se borra o cambia
  // de precio/stock, el carrito lo refleja.
  const lines: CartLine[] = useMemo(
    () =>
      stored.flatMap(({ productId, quantity }) => {
        const product = products.find((p) => p.productId === productId);
        if (!product || product.stock === 0) return [];
        return [{ product, quantity: Math.min(quantity, product.stock) }];
      }),
    [stored, products],
  );

  const setQuantity = (productId: string, quantity: number) =>
    setStored((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) => (l.productId === productId ? { ...l, quantity } : l)),
    );

  const add = (product: Product, quantity = 1) =>
    setStored((prev) => {
      const existing = prev.find((l) => l.productId === product.productId);
      if (!existing) return [...prev, { productId: product.productId, quantity: Math.min(quantity, product.stock) }];
      return prev.map((l) =>
        l.productId === product.productId ? { ...l, quantity: Math.min(l.quantity + quantity, product.stock) } : l,
      );
    });

  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.product.price, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;

  return {
    lines,
    count,
    subtotal,
    shipping,
    total: subtotal + shipping,
    add,
    setQuantity,
    remove: (productId: string) => setQuantity(productId, 0),
    clear: () => setStored([]),
  };
}
