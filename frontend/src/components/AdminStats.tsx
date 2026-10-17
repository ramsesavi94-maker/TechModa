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
    { label: 'Productos', value: products.length, tone: 'bg-lime' },
    { label: 'Unidades en inventario', value: units, tone: 'bg-surface' },
    { label: 'Valor del inventario', value: formatPrice(value), tone: 'bg-surface' },
    { label: 'Agotados / stock bajo', value: `${soldOut} / ${low}`, tone: 'bg-coral' },
  ];

  return (
    <section aria-label="Resumen de inventario" className="animate-fade-up pb-6 pt-8 md:pt-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">Modo administrador</p>
          <h2 className="display mt-2 text-5xl text-ink md:text-6xl">Panel de administración</h2>
        </div>
        <button onClick={onCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Nuevo producto
        </button>
      </div>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl p-5 ${s.tone}`}>
            <dt className="eyebrow text-ink/80">{s.label}</dt>
            <dd className="display mt-3 text-4xl tabular-nums text-ink">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
