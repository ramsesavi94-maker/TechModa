import { demoApi } from './demoStore';
import type { Product, ProductInput } from './types';

// Runtime environment configuration (injected at deployment time)
declare global {
  interface Window {
    __ENV?: {
      VITE_API_URL?: string;
    };
  }
}

// Prioridad: window.__ENV (runtime, lo genera scripts/inject-env.sh)
// > import.meta.env (build). Un placeholder sin reemplazar cuenta como vacío.
function resolveApiUrl(): string {
  const candidates = [window.__ENV?.VITE_API_URL, import.meta.env.VITE_API_URL];
  const url = candidates.find((value) => value && !value.includes('%%')) ?? '';
  return url.replace(/\/+$/, '');
}

export const API_URL = resolveApiUrl();

// Sin URL de API (p. ej. GitHub Pages) la tienda funciona con datos de ejemplo.
export const isDemoMode = !API_URL || import.meta.env.VITE_DEMO === 'true';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
  });

  if (!response.ok) {
    // Las Lambdas responden { error, message }; usamos ese texto si existe.
    let detail = '';
    try {
      const body = await response.json();
      detail = body.message || body.error || '';
    } catch {
      // cuerpo vacío o no JSON
    }
    throw new Error(detail || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const httpApi = {
  async listProducts(): Promise<Product[]> {
    const data = await request<{ products?: Product[] }>('/products');
    return data.products ?? [];
  },

  getProduct(productId: string): Promise<Product> {
    return request<Product>(`/products/${encodeURIComponent(productId)}`);
  },

  createProduct(product: ProductInput): Promise<Product> {
    return request<Product>('/products', { method: 'POST', body: JSON.stringify(product) });
  },

  updateProduct(productId: string, updates: Partial<ProductInput>): Promise<Product> {
    return request<Product>(`/products/${encodeURIComponent(productId)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteProduct(productId: string): Promise<void> {
    await request<unknown>(`/products/${encodeURIComponent(productId)}`, { method: 'DELETE' });
  },
};

export const api = isDemoMode ? demoApi : httpApi;
