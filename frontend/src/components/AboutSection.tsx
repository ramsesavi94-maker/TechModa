import { Leaf, MapPin, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { formatPrice, FREE_SHIPPING_FROM } from '../lib/format';
import { useI18n } from '../lib/i18n';

export function AboutSection() {
  const { t } = useI18n();

  const pillars = [
    { title: t('about.mission'), text: t('about.missionText'), tone: 'bg-lime text-ink' },
    { title: t('about.vision'), text: t('about.visionText'), tone: 'bg-surface text-ink' },
    { title: t('about.values'), text: t('about.valuesText'), tone: 'bg-coral text-ink' },
  ];
  const perks = [
    { icon: Truck, text: t('perk.shipping', { amount: formatPrice(FREE_SHIPPING_FROM) }) },
    { icon: RotateCcw, text: t('perk.returns') },
    { icon: ShieldCheck, text: t('perk.secure') },
    { icon: MapPin, text: t('perk.local') },
  ];

  return (
    <section id="nosotros" aria-labelledby="about-title" className="mx-auto max-w-page px-3 pb-16 md:px-6">
      <div className="grid gap-8 rounded-[2rem] border-2 border-ink p-6 md:grid-cols-[1fr_1.4fr] md:p-10">
        <div>
          <p className="eyebrow flex items-center gap-2 text-muted">
            <Leaf className="h-3.5 w-3.5" /> {t('about.eyebrow')}
          </p>
          <h2 id="about-title" className="display mt-3 text-5xl md:text-6xl">{t('about.title')}</h2>
          <p className="mt-4 max-w-md text-[15px] leading-6 text-muted">{t('about.intro')}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title} className={`flex flex-col rounded-2xl p-5 ${p.tone}`}>
              <h3 className="display text-3xl">{p.title}</h3>
              <p className="mt-3 text-[14px] leading-6">{p.text}</p>
            </div>
          ))}
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {perks.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 text-[13px] font-semibold">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-lime">
              <Icon className="h-4 w-4" />
            </span>
            {text}
          </li>
        ))}
      </ul>
    </section>
  );
}
