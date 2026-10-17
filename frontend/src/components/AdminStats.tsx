import { Plus } from 'lucide-react';
import { formatPrice, LOW_STOCK } from '../lib/format';
import type { Product } from '../lib/types';

interface AdminStatsProps {
  products: Product[];
  onCreate: () => void;
}

export function AdminStats({ products, onCreate }: AdminStatsProps) {
  const units = products.reduce((sum, p) => sum + p.stock, 0);
  const value = products.reduce((sum, p) => sum + p.stock * p.price, 0);
  const soldOut = products.filter((p) => p.stock === 0).length;
  const low = products.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK).length;

  const stats = [
    { label: 'Productos', value: products.length },
    { label: 'Unidades en inventario', value: units },
    { label: 'Valor del inventario', value: formatPrice(value) },
    { label: 'Agotados / stock bajo', value: `${soldOut} / ${low}` },
  ];

  return (
    <section aria-label="Resumen de inventario" className="mb-8 animate-fade-up rounded-2xl border border-line bg-white/60 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-ink">Panel de administración</h2>
          <p className="text-sm text-ink/50">Crea, edita y elimina productos del catálogo.</p>
        </div>
        <button onClick={onCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Nuevo producto
        </button>
      </div>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-sand/70 px-4 py-3">
            <dt className="text-xs text-ink/50">{s.label}</dt>
            <dd className="mt-1 text-xl font-medium tabular-nums text-ink">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
