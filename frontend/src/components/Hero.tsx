import { HERO_IMAGE } from '../lib/seed';
import { formatPrice, FREE_SHIPPING_FROM } from '../lib/format';

export function Hero({ onShop }: { onShop: () => void }) {
  return (
    <section className="relative h-[78svh] min-h-[460px] overflow-hidden bg-surface md:h-[88vh]">
      <img
        src={HERO_IMAGE.replace('w=800&h=1000', 'w=2000&h=1300')}
        alt="Perchero con prendas de la nueva colección"
        className="absolute inset-0 h-full w-full animate-fade-in object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/0" aria-hidden="true" />

      <div className="absolute inset-x-4 bottom-8 max-w-2xl animate-fade-up text-paper md:bottom-14 md:left-10">
        <p className="eyebrow text-paper/85">Colección Otoño 2026 · Envío gratis desde {formatPrice(FREE_SHIPPING_FROM)}</p>
        <h1 className="mt-4 font-display text-[2.75rem] font-normal leading-[0.95] tracking-[-0.02em] sm:text-7xl lg:text-[5.5rem]">
          Moda que se <span className="italic">mueve</span> contigo
        </h1>
        <button
          onClick={onShop}
          className="mt-8 border-b border-paper pb-1 text-[13px] font-medium uppercase tracking-[0.16em] transition-opacity hover:opacity-75 focus-visible:outline-paper"
        >
          Ver colección →
        </button>
      </div>
    </section>
  );
}
