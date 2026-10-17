import { Globe, Search, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import { LANGUAGES, useI18n, type Lang } from '../lib/i18n';

interface HeaderProps {
  search: string;
  onSearch: (value: string) => void;
  cartCount: number;
  onCartClick: () => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
}

function SearchField({ value, onChange, className }: { value: string; onChange: (v: string) => void; className: string }) {
  const { t } = useI18n();
  return (
    <label className={`relative items-center ${className}`}>
      <span className="sr-only">{t('nav.searchLabel')}</span>
      <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('nav.search')}
        className="h-10 w-full rounded-full border border-line bg-white pl-10 pr-4 text-[14px] text-ink outline-none transition placeholder:text-muted focus:border-ink focus:ring-2 focus:ring-lime focus-visible:outline-none"
      />
    </label>
  );
}

function LanguageSelect() {
  const { lang, setLang, t } = useI18n();
  return (
    <label className="relative flex h-10 items-center rounded-full px-2 text-[13px] font-semibold hover:bg-ink/5 max-sm:w-[4.5rem]">
      <span className="sr-only">{t('nav.language')}</span>
      <Globe className="pointer-events-none absolute left-3 h-4 w-4" aria-hidden="true" />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        className="h-full cursor-pointer appearance-none bg-transparent pl-7 pr-1 text-[13px] font-semibold uppercase text-ink outline-none max-sm:w-full"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.code.toUpperCase()} · {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Header({ search, onSearch, cartCount, onCartClick, isAdmin, onToggleAdmin }: HeaderProps) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-page items-center gap-2 px-3 md:gap-5 md:px-6">
        <a href="#" className="display shrink-0 text-[26px] tracking-[0.02em] text-ink md:text-[32px]">
          Tech<span className="rounded-md bg-lime px-1">Moda</span>
        </a>

        <SearchField value={search} onChange={onSearch} className="ml-auto hidden w-full max-w-sm md:flex" />

        <div className="ml-auto flex items-center gap-1 md:ml-0 md:gap-2">
          <LanguageSelect />
          <button
            onClick={onToggleAdmin}
            aria-pressed={isAdmin}
            aria-label={isAdmin ? t('nav.exitAdmin') : t('nav.admin')}
            className={`flex h-10 items-center gap-2 rounded-full px-3 text-[13px] font-semibold uppercase tracking-[0.04em] transition md:px-4 ${
              isAdmin ? 'bg-ink text-paper' : 'text-ink hover:bg-ink/5'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            <span className="hidden lg:inline">{isAdmin ? t('nav.exitAdmin') : t('nav.admin')}</span>
          </button>
          <button
            onClick={onCartClick}
            className="flex h-10 items-center gap-2 rounded-full bg-ink pl-4 pr-1.5 text-[13px] font-semibold uppercase tracking-[0.04em] text-paper transition hover:-translate-y-0.5"
            aria-label={t('nav.openCart', { n: cartCount })}
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t('nav.bag')}</span>
            <span key={cartCount} className="flex h-7 min-w-7 animate-bump items-center justify-center rounded-full bg-lime px-1.5 tabular-nums text-ink">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      <div className="px-3 pb-3 md:hidden">
        <SearchField value={search} onChange={onSearch} className="flex" />
      </div>
    </header>
  );
}
