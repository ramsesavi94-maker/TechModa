import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, httpApi, isDemoMode } from './api';
import { mockProduct, mockProducts, mockProductInput } from '../test/mockData';

const BASE = 'https://test-api.example.com/Prod';

function mockFetch(response: { ok: boolean; status?: number; statusText?: string; body?: unknown }) {
  const fn = vi.fn().mockResolvedValueOnce({
    ok: response.ok,
    status: response.status ?? 200,
    statusText: response.statusText ?? 'OK',
    json: async () => {
      if (response.body === undefined) throw new SyntaxError('Unexpected end of JSON input');
      return response.body;
    },
  });
  globalThis.fetch = fn;
  return fn;
}

describe('api (cliente HTTP)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('usa el cliente HTTP cuando hay URL de API configurada', () => {
    expect(isDemoMode).toBe(false);
    expect(api).toBe(httpApi);
  });

  it('lista productos desde GET /products', async () => {
    const fetchFn = mockFetch({ ok: true, body: { products: mockProducts } });
    await expect(httpApi.listProducts()).resolves.toEqual(mockProducts);
    expect(fetchFn).toHaveBeenCalledWith(`${BASE}/products`, expect.objectContaining({}));
  });

  it('devuelve [] si la respuesta no trae products', async () => {
    mockFetch({ ok: true, body: {} });
    await expect(httpApi.listProducts()).resolves.toEqual([]);
  });

  it('obtiene un producto por ID codificando la ruta', async () => {
    const fetchFn = mockFetch({ ok: true, body: mockProduct });
    await httpApi.getProduct('a/b');
    expect(fetchFn.mock.calls[0][0]).toBe(`${BASE}/products/a%2Fb`);
  });

  it('crea con POST y cuerpo JSON en camelCase', async () => {
    const fetchFn = mockFetch({ ok: true, status: 201, body: mockProduct });
    await httpApi.createProduct(mockProductInput);
    const [, init] = fetchFn.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(init.body)).toEqual(mockProductInput);
    expect(JSON.parse(init.body)).toHaveProperty('imageUrl');
  });

  it('actualiza con PUT /products/{id}', async () => {
    const fetchFn = mockFetch({ ok: true, body: { ...mockProduct, price: 10 } });
    const result = await httpApi.updateProduct(mockProduct.productId, { price: 10 });
    expect(fetchFn.mock.calls[0][0]).toBe(`${BASE}/products/${mockProduct.productId}`);
    expect(fetchFn.mock.calls[0][1].method).toBe('PUT');
    expect(result.price).toBe(10);
  });

  it('elimina con DELETE /products/{id}', async () => {
    const fetchFn = mockFetch({ ok: true, body: { message: 'ok' } });
    await httpApi.deleteProduct(mockProduct.productId);
    expect(fetchFn.mock.calls[0][1].method).toBe('DELETE');
  });

  it('usa el mensaje de error de la Lambda cuando existe', async () => {
    mockFetch({ ok: false, status: 404, statusText: 'Not Found', body: { error: 'Producto no encontrado' } });
    await expect(httpApi.getProduct('x')).rejects.toThrow('Producto no encontrado');
  });

  it('cae a "Error <status>" si el cuerpo no es JSON', async () => {
    mockFetch({ ok: false, status: 500, statusText: 'Internal Server Error' });
    await expect(httpApi.listProducts()).rejects.toThrow('Error 500: Internal Server Error');
  });
});
