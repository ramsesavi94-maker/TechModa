import type { Product } from './types';

// Fotos de Unsplash (licencia libre) servidas desde su CDN y recortadas a 4:5.
const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&h=1000&q=75`;

export const HERO_IMAGE = `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2000&h=1400&q=75`;

export const CATEGORY_IMAGES: Record<string, string> = {
  Ropa: img('1591047139829-d91aecb6caea'),
  Zapatos: img('1595950653106-6c9ebd614d3a'),
  Accesorios: img('1584917865442-de89df76afd3'),
};

const DAY = 24 * 60 * 60 * 1000;
const at = (daysAgo: number) => new Date(Date.UTC(2026, 9, 15) - daysAgo * DAY).toISOString();

const raw: Array<Omit<Product, 'createdAt' | 'updatedAt'> & { daysAgo: number }> = [
  { productId: 'tm-001', name: 'Vestido largo escarlata', description: 'Vestido maxi de gasa con caída ligera y escote halter. Ideal para eventos de día.', price: 1290, category: 'Ropa', stock: 8, imageUrl: img('1595777457583-95e059d581b8'), daysAgo: 1 },
  { productId: 'tm-002', name: 'Chaqueta bomber terracota', description: 'Bomber de nylon satinado con puños acanalados y forro suave.', price: 1150, category: 'Ropa', stock: 12, imageUrl: img('1591047139829-d91aecb6caea'), daysAgo: 2 },
  { productId: 'tm-003', name: 'Tenis de running rojo', description: 'Tejido transpirable y suela amortiguada para correr a diario.', price: 1890, category: 'Zapatos', stock: 3, imageUrl: img('1542291026-7eec264c27ff'), daysAgo: 3 },
  { productId: 'tm-004', name: 'Bolso de mano charol', description: 'Bolso estructurado de charol rojo con asa superior y cierre metálico.', price: 2450, category: 'Accesorios', stock: 5, imageUrl: img('1584917865442-de89df76afd3'), daysAgo: 4 },
  { productId: 'tm-005', name: 'Camiseta esencial blanca', description: 'Algodón peinado 100%, corte recto. El básico que combina con todo.', price: 349, category: 'Ropa', stock: 40, imageUrl: img('1521572163474-6864f9cf17ab'), daysAgo: 5 },
  { productId: 'tm-006', name: 'Tenis pastel', description: 'Tenis de piel con paneles en tonos pastel y suela plataforma.', price: 1690, category: 'Zapatos', stock: 9, imageUrl: img('1595950653106-6c9ebd614d3a'), daysAgo: 6 },
  { productId: 'tm-007', name: 'Lentes de sol clásicos', description: 'Armazón de acetato negro con lentes polarizados UV400.', price: 690, category: 'Accesorios', stock: 18, imageUrl: img('1572635196237-14b3f281503f'), daysAgo: 7 },
  { productId: 'tm-008', name: 'Chaqueta de mezclilla', description: 'Denim rígido con cuello de pana y botones metálicos.', price: 1390, category: 'Ropa', stock: 6, imageUrl: img('1611312449408-fcece27cdbb7'), daysAgo: 8 },
  { productId: 'tm-009', name: 'Tacones estampado floral', description: 'Stiletto de punta con estampado floral y tacón de 10 cm.', price: 1590, category: 'Zapatos', stock: 2, imageUrl: img('1543163521-1bf539c55dd2'), daysAgo: 9 },
  { productId: 'tm-010', name: 'Sudadera con capucha gris', description: 'Felpa perchada de algodón, bolsillo canguro y capucha ajustable.', price: 799, category: 'Ropa', stock: 22, imageUrl: img('1556821840-3a63f95609a7'), daysAgo: 10 },
  { productId: 'tm-011', name: 'Reloj minimalista blanco', description: 'Caja de 40 mm, carátula negra y correa de silicona.', price: 1990, category: 'Accesorios', stock: 7, imageUrl: img('1523275335684-37898b6baf30'), daysAgo: 11 },
  { productId: 'tm-012', name: 'Poncho tejido crochet', description: 'Poncho artesanal de algodón crudo con flecos.', price: 890, category: 'Ropa', stock: 4, imageUrl: img('1434389677669-e08b4cac3105'), daysAgo: 12 },
  { productId: 'tm-013', name: 'Mochila urbana', description: 'Mochila azul marino resistente al agua con compartimento para laptop de 15".', price: 1190, category: 'Accesorios', stock: 14, imageUrl: img('1553062407-98eeb64c6a62'), daysAgo: 13 },
  { productId: 'tm-014', name: 'Tenis blancos de piel', description: 'Silueta clásica de piel blanca con suela de goma.', price: 1490, category: 'Zapatos', stock: 0, imageUrl: img('1608231387042-66d1773070a5'), daysAgo: 14 },
  { productId: 'tm-015', name: 'Jeans slim deslavados', description: 'Mezclilla elástica con rotos y deslavado medio.', price: 990, category: 'Ropa', stock: 11, imageUrl: img('1541099649105-f69ad21f3246'), daysAgo: 15 },
];

export const SEED_PRODUCTS: Product[] = raw.map(({ daysAgo, ...p }) => ({
  ...p,
  createdAt: at(daysAgo),
  updatedAt: at(daysAgo),
}));
