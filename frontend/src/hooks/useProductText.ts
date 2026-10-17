import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useI18n } from '../lib/i18n';
import type { Product, ProductText } from '../lib/types';

// Caché compartida entre tarjetas, detalle y carrito: una traducción por
// producto, versión y idioma.
const cache = new Map<string, ProductText>();

/** Nombre y descripción del producto en el idioma activo. */
export function useProductText(product: Product): ProductText & { translating: boolean } {
  const { lang } = useI18n();
  const original = { name: product.name, description: product.description };
  const key = `${product.productId}:${product.updatedAt ?? ''}:${lang}`;

  const stored = lang === 'es' ? undefined : (product.translations?.[lang] as (ProductText & { sourceUpdatedAt?: string }) | undefined);
  const fresh = stored && (!stored.sourceUpdatedAt || stored.sourceUpdatedAt === product.updatedAt) ? stored : undefined;
  const ready = lang === 'es' ? original : fresh ?? cache.get(key);
  const [fetched, setFetched] = useState<{ key: string; text: ProductText } | null>(null);

  useEffect(() => {
    if (lang === 'es' || ready) return;
    let cancelled = false;
    api.translateProduct(product, lang).then((text) => {
      cache.set(key, text);
      if (!cancelled) setFetched({ key, text });
    });
    return () => {
      cancelled = true;
    };
    // `product` cambia de identidad en cada render del catálogo; la clave basta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ready]);

  const text = ready ?? (fetched?.key === key ? fetched.text : null);
  return { ...(text ?? original), translating: !text };
}
