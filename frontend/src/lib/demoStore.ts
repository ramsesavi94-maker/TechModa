import { localAssistant, type AssistantReply } from './assistant';
import type { Lang } from './i18n';
import { localInsights } from './insights';
import { SEED_PRODUCTS } from './seed';
import type { AssistantMessage, Product, ProductInput, ProductInsights, ProductText } from './types';

// Backend simulado para la demo pública (GitHub Pages): imita las respuestas
// de las Lambdas, pero guarda los productos en el localStorage del visitante.
const STORAGE_KEY = 'techmoda.demo.products.v2';
const LATENCY_MS = 250;

let memory: Product[] | null = null;

function load(): Product[] {
  if (memory) return memory;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    memory = saved ? (JSON.parse(saved) as Product[]) : structuredClone(SEED_PRODUCTS);
  } catch {
    memory = structuredClone(SEED_PRODUCTS);
  }
  return memory;
}

function save(products: Product[]) {
  memory = products;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    // Sin almacenamiento (modo privado): los cambios viven solo en memoria.
  }
}

const delay = <T,>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

function notFound(): never {
  throw new Error('Producto no encontrado');
}

export const demoApi = {
  async listProducts(): Promise<Product[]> {
    return delay(structuredClone(load()));
  },

  async getProduct(productId: string): Promise<Product> {
    const product = load().find((p) => p.productId === productId) ?? notFound();
    return delay(structuredClone(product));
  },

  async createProduct(input: ProductInput): Promise<Product> {
    const now = new Date().toISOString();
    const product: Product = { ...input, productId: crypto.randomUUID(), createdAt: now, updatedAt: now };
    save([product, ...load()]);
    return delay(structuredClone(product));
  },

  async updateProduct(productId: string, updates: Partial<ProductInput>): Promise<Product> {
    const current = load().find((p) => p.productId === productId) ?? notFound();
    const updated: Product = { ...current, ...updates, updatedAt: new Date().toISOString() };
    // Si cambia el texto, las traducciones precargadas ya no aplican.
    if ((updates.name ?? current.name) !== current.name || (updates.description ?? current.description) !== current.description) {
      delete updated.translations;
    }
    save(load().map((p) => (p.productId === productId ? updated : p)));
    return delay(structuredClone(updated));
  },

  async deleteProduct(productId: string): Promise<void> {
    save(load().filter((p) => p.productId !== productId));
    return delay(undefined);
  },

  // En la demo no hay Amazon Translate: se usan las traducciones precargadas
  // y, si el producto es nuevo, se queda en español.
  async translateProduct(product: Product, lang: Exclude<Lang, 'es'>): Promise<ProductText> {
    return product.translations?.[lang] ?? { name: product.name, description: product.description };
  },

  // Sin Polly: el componente usa la voz del navegador (Web Speech API).
  async speakProduct(): Promise<string | null> {
    return null;
  },

  async productInsights(product: Product, lang: Lang): Promise<ProductInsights> {
    return localInsights(product, lang);
  },

  async askAssistant(
    message: string,
    _history: AssistantMessage[],
    lang: Lang,
    products: Product[],
  ): Promise<AssistantReply & { ai: boolean }> {
    await delay(undefined);
    return { ...localAssistant(message, products, lang), ai: false };
  },
};

export function resetDemoData() {
  memory = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignorado
  }
}
