import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useCart } from './useCart';
import { SHIPPING_COST } from '../lib/format';
import { mockProducts } from '../test/mockData';

const [shirt, jeans, soldOut] = mockProducts;

describe('useCart', () => {
  it('suma cantidades y da envío gratis desde el mínimo', () => {
    const { result } = renderHook(() => useCart(mockProducts));

    act(() => result.current.add(shirt));
    act(() => result.current.add(shirt));
    act(() => result.current.add(jeans));

    expect(result.current.count).toBe(3);
    expect(result.current.subtotal).toBe(shirt.price * 2 + jeans.price);
    expect(result.current.shipping).toBe(0);
  });

  it('cobra envío por debajo del mínimo', () => {
    const { result } = renderHook(() => useCart(mockProducts));
    act(() => result.current.add(shirt));
    expect(result.current.shipping).toBe(SHIPPING_COST);
    expect(result.current.total).toBe(shirt.price + SHIPPING_COST);
  });

  it('no deja pasar del inventario disponible', () => {
    const { result } = renderHook(() => useCart(mockProducts));
    act(() => result.current.add(jeans, 10));
    expect(result.current.lines[0].quantity).toBe(jeans.stock);
  });

  it('ignora productos agotados o eliminados del catálogo', () => {
    const { result, rerender } = renderHook(({ products }) => useCart(products), {
      initialProps: { products: mockProducts },
    });
    act(() => {
      result.current.add(soldOut);
      result.current.add(jeans);
    });
    expect(result.current.lines.map((l) => l.product.productId)).toEqual([jeans.productId]);

    rerender({ products: mockProducts.filter((p) => p.productId !== jeans.productId) });
    expect(result.current.count).toBe(0);
  });

  it('quita la línea al llegar a cantidad 0', () => {
    const { result } = renderHook(() => useCart(mockProducts));
    act(() => result.current.add(shirt));
    act(() => result.current.setQuantity(shirt.productId, 0));
    expect(result.current.lines).toHaveLength(0);
  });
});
