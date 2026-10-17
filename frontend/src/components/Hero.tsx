import { ArrowDownRight } from 'lucide-react';
import { HERO_IMAGE } from '../lib/seed';
import { formatPrice, FREE_SHIPPING_FROM } from '../lib/format';
import { useI18n } from '../lib/i18n';

export function Marquee() {
  const { t } = useI18n();
  const messages = [
    t('marquee.shipping', { amount: formatPrice(FREE_SHIPPING_FROM) }),
    t('marquee.drops'),
    t('marquee.returns'),
    t('marquee.collection'),
  ];
  // Se duplica el contenido para que el desplazamiento sea continuo.
  const items = [...messages, ...messages];
  return (
    <div className="overflow-hidden border-y-2 border-ink bg-lime py-2.5">
      <p className="sr-only">{messages.join(' · ')}</p>
      <div className="flex w-max animate-marquee gap-8 whitespace-nowrap" aria-hidden="true">
        {items.map((text, i) => (
          <span key={i} className="display flex items-center gap-8 text-xl text-ink md:text-2xl">
            {text} <span className="text-base">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Hero({ onShop }: { onShop: () => void }) {
  const { t } = useI18n();
  return (
    <section className="px-3 pt-3 md:px-6 md:pt-6">
      <div className="relative h-[72svh] max-h-[760px] min-h-[480px] overflow-hidden rounded-3xl bg-surface md:h-[82vh] md:max-h-[820px]">
        <img
          src={HERO_IMAGE}
          alt={t('hero.alt')}
          className="absolute inset-0 h-full w-full animate-fade-in object-cover object-[50%_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-black/0" aria-hidden="true" />

        <span className="badge absolute left-4 top-4 bg-lime text-ink md:left-8 md:top-8">{t('hero.badge')}</span>

        <div className="absolute inset-x-4 bottom-6 animate-fade-up text-paper md:inset-x-8 md:bottom-10">
          <p className="eyebrow text-paper/90">{t('hero.eyebrow')}</p>
          <h1 className="display mt-3 text-[clamp(3.5rem,13vw,11rem)]">
            {t('hero.line1')}
            <br />
            <span className="text-lime">{t('hero.line2')}</span>
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button onClick={onShop} className="btn-lime group">
              {t('hero.cta')} <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </button>
            <span className="text-[13px] text-paper/90">{t('hero.shipping')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
