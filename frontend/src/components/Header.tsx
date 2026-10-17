import { Search, ShoppingBag, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  search: string;
  onSearch: (value: string) => void;
  cartCount: number;
  onCartClick: () => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
}

function SearchField({ value, onChange, className }: { value: string; onChange: (v: string) => void; className: string }) {
  return (
    <label className={`relative items-center ${className}`}>
      <span className="sr-only">Buscar productos</span>
      <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar productos..."
        className="h-10 w-full rounded-full border border-line bg-white pl-10 pr-4 text-[14px] text-ink outline-none transition placeholder:text-muted focus:border-ink focus:ring-2 focus:ring-lime focus-visible:outline-none"
      />
    </label>
  );
}

export function Header({ search, onSearch, cartCount, onCartClick, isAdmin, onToggleAdmin }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-page items-center gap-3 px-3 md:gap-6 md:px-6">
        <a href="#" className="display shrink-0 text-[28px] tracking-[0.02em] text-ink md:text-[32px]">
          Tech<span className="rounded-md bg-lime px-1">Moda</span>
        </a>

        <SearchField value={search} onChange={onSearch} className="ml-auto hidden w-full max-w-sm md:flex" />

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button
            onClick={onToggleAdmin}
            aria-pressed={isAdmin}
            aria-label={isAdmin ? 'Salir de admin' : 'Admin'}
            className={`flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold uppercase tracking-[0.04em] transition ${
              isAdmin ? 'bg-ink text-paper' : 'text-ink hover:bg-ink/5'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{isAdmin ? 'Salir de admin' : 'Admin'}</span>
          </button>
          <button
            onClick={onCartClick}
            className="flex h-10 items-center gap-2 rounded-full bg-ink pl-4 pr-1.5 text-[13px] font-semibold uppercase tracking-[0.04em] text-paper transition hover:-translate-y-0.5"
            aria-label={`Abrir carrito (${cartCount} artículos)`}
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Bolsa</span>
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
