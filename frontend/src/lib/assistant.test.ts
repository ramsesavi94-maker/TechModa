import { describe, it, expect } from 'vitest';
import { localAssistant } from './assistant';
import { SEED_PRODUCTS } from './seed';

const byId = (id: string) => SEED_PRODUCTS.find((p) => p.productId === id)!;

describe('localAssistant', () => {
  it('filtra por categoría y presupuesto', () => {
    const { reply, productIds } = localAssistant('tenis por menos de $1,700', SEED_PRODUCTS, 'es');
    expect(reply).toContain('$1,700');
    expect(productIds.length).toBeGreaterThan(0);
    for (const id of productIds) {
      expect(byId(id).category).toBe('Zapatos');
      expect(byId(id).price).toBeLessThanOrEqual(1700);
    }
  });

  it('prioriza el color pedido', () => {
    const { productIds } = localAssistant('quiero algo rojo', SEED_PRODUCTS, 'es');
    expect(productIds.length).toBeGreaterThan(0);
    const first = byId(productIds[0]);
    expect(`${first.name} ${first.description}`.toLowerCase()).toMatch(/roj|escarlata/);
  });

  it('entiende otros idiomas', () => {
    const { reply, productIds } = localAssistant('red sneakers under 2000', SEED_PRODUCTS, 'en');
    expect(reply).toMatch(/within/i);
    expect(byId(productIds[0]).productId).toBe('tm-003');
  });

  it('nunca recomienda productos agotados', () => {
    const { productIds } = localAssistant('tenis blancos', SEED_PRODUCTS, 'es');
    expect(productIds).not.toContain('tm-014');
  });

  it('responde saludos y temas fuera de la tienda sin productos', () => {
    expect(localAssistant('hola', SEED_PRODUCTS, 'es').productIds).toEqual([]);
    const offTopic = localAssistant('¿cuál es la capital de Francia?', SEED_PRODUCTS, 'es');
    expect(offTopic.productIds).toEqual([]);
    expect(offTopic.reply).toMatch(/clóset/);
  });
});
