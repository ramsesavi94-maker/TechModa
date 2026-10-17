import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { demoApi, resetDemoData } from './demoStore';
import { SEED_PRODUCTS } from './seed';
import { mockProductInput } from '../test/mockData';

describe('demoApi (modo demo)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetDemoData();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const run = async <T,>(promise: Promise<T>) => {
    await vi.runAllTimersAsync();
    return promise;
  };

  it('empieza con el catálogo de ejemplo', async () => {
    const products = await run(demoApi.listProducts());
    expect(products).toHaveLength(SEED_PRODUCTS.length);
  });

  it('crea, actualiza y elimina persistiendo en localStorage', async () => {
    const created = await run(demoApi.createProduct(mockProductInput));
    expect(created.productId).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('techmoda.demo.products.v2')!)[0].productId).toBe(created.productId);

    const updated = await run(demoApi.updateProduct(created.productId, { stock: 2 }));
    expect(updated.stock).toBe(2);
    expect(updated.name).toBe(mockProductInput.name);

    await run(demoApi.deleteProduct(created.productId));
    const after = await run(demoApi.listProducts());
    expect(after.find((p) => p.productId === created.productId)).toBeUndefined();
  });

  it('responde "Producto no encontrado" como la Lambda', async () => {
    await expect(demoApi.getProduct('no-existe')).rejects.toThrow('Producto no encontrado');
    await expect(demoApi.updateProduct('no-existe', { price: 1 })).rejects.toThrow('Producto no encontrado');
  });

  it('resetDemoData restablece el catálogo', async () => {
    await run(demoApi.deleteProduct(SEED_PRODUCTS[0].productId));
    resetDemoData();
    expect(await run(demoApi.listProducts())).toHaveLength(SEED_PRODUCTS.length);
  });
});
