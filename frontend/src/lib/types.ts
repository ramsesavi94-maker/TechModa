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
}

export type ProductInput = Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>;

export const CATEGORIES = ['Ropa', 'Zapatos', 'Accesorios'] as const;

export interface CartLine {
  product: Product;
  quantity: number;
}
