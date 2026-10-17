import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useProducts } from './useProducts';
import { api } from '../lib/api';
import { mockProduct, mockProducts, mockProductInput } from '../test/mockData';

vi.mock('../lib/api');

async function renderLoaded() {
  const hook = renderHook(() => useProducts());
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
}

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.listProducts).mockResolvedValue(mockProducts);
  });

  it('carga los productos al montar', async () => {
    const { result } = await renderLoaded();
    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.error).toBeNull();
  });

  it('expone el error si falla la carga', async () => {
    vi.mocked(api.listProducts).mockRejectedValueOnce(new Error('Failed to fetch'));
    const { result } = await renderLoaded();
    expect(result.current.error).toBe('Failed to fetch');
  });

  it('agrega el producto creado al inicio', async () => {
    const created = { ...mockProduct, productId: 'nuevo' };
    vi.mocked(api.createProduct).mockResolvedValueOnce(created);
    const { result } = await renderLoaded();

    let outcome;
    await act(async () => {
      outcome = await result.current.createProduct(mockProductInput);
    });

    expect(outcome).toEqual({ success: true });
    expect(result.current.products[0]).toEqual(created);
  });

  it('reemplaza el producto actualizado usando productId', async () => {
    vi.mocked(api.updateProduct).mockResolvedValueOnce({ ...mockProduct, price: 1 });
    const { result } = await renderLoaded();

    await act(async () => {
      await result.current.updateProduct(mockProduct.productId, { price: 1 });
    });

    expect(api.updateProduct).toHaveBeenCalledWith(mockProduct.productId, { price: 1 });
    expect(result.current.products.find((p) => p.productId === mockProduct.productId)?.price).toBe(1);
  });

  it('quita el producto eliminado', async () => {
    vi.mocked(api.deleteProduct).mockResolvedValueOnce();
    const { result } = await renderLoaded();

    await act(async () => {
      await result.current.deleteProduct(mockProduct.productId);
    });

    expect(api.deleteProduct).toHaveBeenCalledWith(mockProduct.productId);
    expect(result.current.products).toHaveLength(mockProducts.length - 1);
  });

  it('devuelve el mensaje de error si la API falla', async () => {
    vi.mocked(api.deleteProduct).mockRejectedValueOnce(new Error('Producto no encontrado'));
    const { result } = await renderLoaded();

    let outcome;
    await act(async () => {
      outcome = await result.current.deleteProduct('x');
    });

    expect(outcome).toEqual({ success: false, error: 'Producto no encontrado' });
  });
});
