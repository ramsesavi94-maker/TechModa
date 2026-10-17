// Contrato de la API (ver docs/specs): los campos van en camelCase,
// igual que los guardan las funciones Lambda en DynamoDB.
export interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
  /** Traducciones cacheadas por translate-item (Amazon Translate). */
  translations?: ProductTranslations;
}

export interface ProductText {
  name: string;
  description: string;
}

export type ProductTranslations = Partial<Record<'en' | 'zh' | 'ja', ProductText>>;

export type ProductInput = Omit<Product, 'productId' | 'createdAt' | 'updatedAt' | 'translations'>;

export interface ProductInsights {
  features: string[];
  season: string;
  tip: string;
  /** true si la ficha la generó Claude en Bedrock; false si es la guía local. */
  ai: boolean;
}

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  productIds?: string[];
  ai?: boolean;
}

export const CATEGORIES = ['Ropa', 'Zapatos', 'Accesorios'] as const;

export interface CartLine {
  product: Product;
  quantity: number;
}
