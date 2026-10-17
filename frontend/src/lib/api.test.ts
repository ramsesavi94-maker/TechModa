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

describe('api (servicios de IA con respaldo local)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('traduce con POST /products/{id}/translate', async () => {
    const fetchFn = mockFetch({ ok: true, body: { name: 'Classic shirt', description: 'Elegant' } });
    const text = await httpApi.translateProduct(mockProduct, 'en');
    expect(fetchFn.mock.calls[0][0]).toBe(`${BASE}/products/${mockProduct.productId}/translate`);
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({ language: 'en' });
    expect(text).toEqual({ name: 'Classic shirt', description: 'Elegant' });
  });

  it('usa la traducción guardada si sigue vigente y no llama a la API', async () => {
    const fetchFn = mockFetch({ ok: true, body: {} });
    const product = { ...mockProduct, translations: { en: { name: 'Cached', description: 'x', sourceUpdatedAt: mockProduct.updatedAt } } };
    expect((await httpApi.translateProduct(product, 'en')).name).toBe('Cached');
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('si Translate falla muestra el texto original', async () => {
    mockFetch({ ok: false, status: 500, body: { error: 'x' } });
    expect((await httpApi.translateProduct(mockProduct, 'ja')).name).toBe(mockProduct.name);
  });

  it('devuelve el audio de Polly como data URL, o null si falla', async () => {
    mockFetch({ ok: true, body: { audioBase64: 'QUJD', contentType: 'audio/mpeg' } });
    expect(await httpApi.speakProduct('p1', 'es')).toBe('data:audio/mpeg;base64,QUJD');
    mockFetch({ ok: false, status: 500, body: {} });
    expect(await httpApi.speakProduct('p1', 'es')).toBeNull();
  });

  it('con Bedrock apagado (503) el asistente responde con el motor local', async () => {
    mockFetch({ ok: false, status: 503, body: { error: 'IA deshabilitada' } });
    const result = await httpApi.askAssistant('tenis', [], 'es', mockProducts);
    expect(result.ai).toBe(false);
    // El único calzado de los datos de prueba está agotado: sugiere novedades disponibles.
    expect(result.reply).toMatch(/No encontré algo exacto/);
    expect(result.productIds).not.toContain('test-product-789');
  });

  it('con Bedrock activo marca la respuesta como IA', async () => {
    const fetchFn = mockFetch({ ok: true, body: { reply: 'Hola', productIds: ['a'] } });
    const result = await httpApi.askAssistant('hola', [{ role: 'user', content: 'x', productIds: ['b'] }], 'en', mockProducts);
    expect(result).toEqual({ reply: 'Hola', productIds: ['a'], ai: true });
    expect(JSON.parse(fetchFn.mock.calls[0][1].body).history).toEqual([{ role: 'user', content: 'x' }]);
  });

  it('las fichas usan Bedrock o la guía local', async () => {
    mockFetch({ ok: true, body: { features: ['a'], season: 's', tip: 't' } });
    expect((await httpApi.productInsights(mockProduct, 'es')).ai).toBe(true);
    mockFetch({ ok: false, status: 503, body: {} });
    expect((await httpApi.productInsights(mockProduct, 'es')).ai).toBe(false);
  });
});
