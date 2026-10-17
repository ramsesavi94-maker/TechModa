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
    <section aria-label="Resumen de inventario" className="animate-fade-up py-10 md:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">Modo administrador</p>
          <h2 className="mt-2 font-display text-[2.5rem] leading-none text-ink md:text-5xl">Panel de administración</h2>
        </div>
        <button onClick={onCreate} className="btn-primary">
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Nuevo producto
        </button>
      </div>
      <dl className="grid grid-cols-2 border-y border-line lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className={`px-4 py-5 md:px-6 ${i % 2 ? 'border-l border-line' : ''} ${i === 2 ? 'max-lg:border-t lg:border-l' : ''} ${i === 3 ? 'max-lg:border-t' : ''}`}>
            <dt className="eyebrow text-muted">{s.label}</dt>
            <dd className="mt-2 font-display text-[2rem] leading-none tabular-nums text-ink">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
