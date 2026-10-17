import { ArrowUpRight } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { CATEGORY_IMAGES } from '../lib/seed';
import { CATEGORIES } from '../lib/types';

interface CategoryTilesProps {
  countFor: (category: string) => number;
  onSelect: (category: string) => void;
}

// Accesos rápidos por categoría. No usan role="tab" para no duplicar los filtros.
export function CategoryTiles({ countFor, onSelect }: CategoryTilesProps) {
  const { t } = useI18n();
  return (
    <section aria-label={t('tiles.label')} className="px-3 pt-3 md:px-6 md:pt-6">
      <div className="no-scrollbar -mx-3 flex snap-x gap-3 overflow-x-auto px-3 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:px-0">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => onSelect(c)}
            aria-label={t('tiles.view', { c: t(`cat.${c}`) })}
            className="group relative aspect-[4/5] w-[70vw] shrink-0 snap-start overflow-hidden rounded-3xl bg-surface text-left md:aspect-[5/6] md:w-auto"
          >
            <img
              src={CATEGORY_IMAGES[c]}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out-quint group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-black/0" aria-hidden="true" />
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between text-paper md:inset-x-6 md:bottom-6">
              <span>
                <span className="display block text-5xl md:text-6xl">{t(`cat.${c}`)}</span>
                <span className="mt-1 block text-[13px] text-paper/90">{t('tiles.count', { n: countFor(c) })}</span>
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lime text-ink transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
