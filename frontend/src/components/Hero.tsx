import { ArrowRight } from 'lucide-react';
import { HERO_IMAGE } from '../lib/seed';
import { formatPrice, FREE_SHIPPING_FROM } from '../lib/format';

export function Hero({ onShop }: { onShop: () => void }) {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-12 pt-8 sm:px-6 md:grid-cols-2 md:gap-12 md:pt-14 lg:px-8">
      <div className="animate-fade-up">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Colección Otoño 2026</p>
        <h1 className="mt-4 font-display text-5xl leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl">
          Moda que se <em className="text-accent">mueve</em> contigo
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/60">
          Básicos atemporales y piezas de temporada, seleccionados para vestir bien sin complicarte.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button onClick={onShop} className="btn-primary group">
            Ver colección <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </button>
          <span className="text-sm text-ink/50">Envío gratis desde {formatPrice(FREE_SHIPPING_FROM)}</span>
        </div>
      </div>

      <div className="relative animate-fade-in">
        <img
          src={HERO_IMAGE}
          alt="Perchero con prendas de la nueva colección"
          className="aspect-[4/5] w-full rounded-2xl object-cover md:aspect-[5/6]"
        />
        <div className="absolute -bottom-4 left-4 rounded-xl bg-paper px-5 py-4 shadow-xl sm:-left-6">
          <p className="font-display text-3xl text-ink">Otoño '26</p>
          <p className="text-xs text-ink/60">Nuevos ingresos cada semana</p>
        </div>
      </div>
    </section>
  );
}
