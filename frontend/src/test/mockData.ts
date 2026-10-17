import type { Product, ProductInput } from '../lib/types';

export const mockProduct: Product = {
  productId: 'test-product-123',
  name: 'Camisa Blanca Clásica',
  description: 'Camisa blanca elegante perfecta para cualquier ocasión',
  price: 499,
  category: 'Ropa',
  stock: 25,
  imageUrl: 'https://example.com/white-shirt.jpg',
  createdAt: '2026-01-04T00:00:00Z',
  updatedAt: '2026-01-04T00:00:00Z',
};

export const mockProducts: Product[] = [
  mockProduct,
  {
    productId: 'test-product-456',
    name: 'Jeans Azules',
    description: 'Jeans cómodos de mezclilla azul',
    price: 799,
    category: 'Ropa',
    stock: 3,
    imageUrl: 'https://example.com/jeans.jpg',
    createdAt: '2026-01-03T00:00:00Z',
    updatedAt: '2026-01-03T00:00:00Z',
  },
  {
    productId: 'test-product-789',
    name: 'Zapatos Deportivos',
    description: 'Zapatillas deportivas para correr',
    price: 1299,
    category: 'Zapatos',
    stock: 0,
    imageUrl: 'https://example.com/shoes.jpg',
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
  {
    productId: 'test-product-101',
    name: 'Reloj Elegante',
    description: 'Reloj de pulsera elegante',
    price: 1999,
    category: 'Accesorios',
    stock: 10,
    imageUrl: 'https://example.com/watch.jpg',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

export const mockProductInput: ProductInput = {
  name: 'Camisa Blanca Clásica',
  description: 'Camisa blanca elegante perfecta para cualquier ocasión',
  price: 499,
  category: 'Ropa',
  stock: 25,
  imageUrl: 'https://example.com/white-shirt.jpg',
};
