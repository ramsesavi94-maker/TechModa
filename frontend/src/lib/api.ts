import { localAssistant, type AssistantReply } from './assistant';
import { demoApi } from './demoStore';
import type { Lang } from './i18n';
import { localInsights } from './insights';
import type { AssistantMessage, Product, ProductInput, ProductInsights, ProductText } from './types';

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

  // Amazon Translate vía translate-item; si falla, se muestra el texto original.
  async translateProduct(product: Product, lang: Exclude<Lang, 'es'>): Promise<ProductText> {
    // translate-item guarda la fecha del texto original; si cambió, se retraduce.
    const cached = product.translations?.[lang] as (ProductText & { sourceUpdatedAt?: string }) | undefined;
    if (cached && (!cached.sourceUpdatedAt || cached.sourceUpdatedAt === product.updatedAt)) return cached;
    try {
      const { name, description } = await request<ProductText>(
        `/products/${encodeURIComponent(product.productId)}/translate`,
        { method: 'POST', body: JSON.stringify({ language: lang }) },
      );
      return { name, description };
    } catch {
      return { name: product.name, description: product.description };
    }
  },

  // Amazon Polly vía speak-item. null => el componente usa la voz del navegador.
  async speakProduct(productId: string, lang: Lang): Promise<string | null> {
    try {
      const { audioBase64, contentType } = await request<{ audioBase64: string; contentType: string }>(
        `/products/${encodeURIComponent(productId)}/speech`,
        { method: 'POST', body: JSON.stringify({ language: lang }) },
      );
      return `data:${contentType};base64,${audioBase64}`;
    } catch {
      return null;
    }
  },

  // Claude en Bedrock vía ai-assistant; con EnableAI=false responde 503 y se usa la guía local.
  async productInsights(product: Product, lang: Lang): Promise<ProductInsights> {
    try {
      const data = await request<Omit<ProductInsights, 'ai'>>(
        `/products/${encodeURIComponent(product.productId)}/insights`,
        { method: 'POST', body: JSON.stringify({ language: lang }) },
      );
      return { features: data.features, season: data.season, tip: data.tip, ai: true };
    } catch {
      return localInsights(product, lang);
    }
  },

  async askAssistant(
    message: string,
    history: AssistantMessage[],
    lang: Lang,
    products: Product[],
  ): Promise<AssistantReply & { ai: boolean }> {
    try {
      const data = await request<AssistantReply>('/assistant', {
        method: 'POST',
        body: JSON.stringify({
          message,
          language: lang,
          history: history.map(({ role, content }) => ({ role, content })),
        }),
      });
      return { ...data, ai: true };
    } catch {
      return { ...localAssistant(message, products, lang), ai: false };
    }
  },
};

export const api = isDemoMode ? demoApi : httpApi;
