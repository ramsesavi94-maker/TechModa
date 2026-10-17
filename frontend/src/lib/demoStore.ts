import { SEED_PRODUCTS } from './seed';
import type { Product, ProductInput } from './types';

// Backend simulado para la demo pública (GitHub Pages): imita las respuestas
// de las Lambdas, pero guarda los productos en el localStorage del visitante.
const STORAGE_KEY = 'techmoda.demo.products.v1';
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
    save(load().map((p) => (p.productId === productId ? updated : p)));
    return delay(structuredClone(updated));
  },

  async deleteProduct(productId: string): Promise<void> {
    save(load().filter((p) => p.productId !== productId));
    return delay(undefined);
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
