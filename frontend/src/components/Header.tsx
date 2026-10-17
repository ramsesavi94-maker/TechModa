import { Search, ShoppingBag } from 'lucide-react';

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
      <Search className="pointer-events-none absolute left-0 h-3.5 w-3.5 text-muted" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar productos..."
        className="w-full rounded-none border-0 border-b border-field bg-transparent py-1.5 pl-6 text-[13px] text-ink outline-none transition-colors placeholder:text-muted focus:border-ink focus-visible:outline-none"
      />
    </label>
  );
}

export function Header({ search, onSearch, cartCount, onCartClick, isAdmin, onToggleAdmin }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="mx-auto grid h-14 max-w-page grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:px-10">
        <SearchField value={search} onChange={onSearch} className="hidden w-44 transition-[width] duration-300 ease-out-quint focus-within:w-64 md:flex" />
        <span className="md:hidden" />

        <a href="#" className="font-display text-[22px] font-medium tracking-[0.04em] text-ink md:text-[26px]">
          TechModa
        </a>

        <div className="flex items-center justify-end gap-5 text-[13px]">
          <button
            onClick={onToggleAdmin}
            aria-pressed={isAdmin}
            aria-label={isAdmin ? 'Salir de admin' : 'Admin'}
            className={`link-underline ${isAdmin ? 'text-ink after:scale-x-100' : 'text-muted hover:text-ink'}`}
          >
            {isAdmin ? 'Salir de admin' : 'Admin'}
          </button>
          <button
            onClick={onCartClick}
            className="flex items-center gap-1.5 text-ink"
            aria-label={`Abrir carrito (${cartCount} artículos)`}
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            <span className="hidden sm:inline">Bolsa</span>
            <span key={cartCount} className="inline-block animate-bump tabular-nums">({cartCount})</span>
          </button>
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <SearchField value={search} onChange={onSearch} className="flex" />
      </div>
    </header>
  );
}
