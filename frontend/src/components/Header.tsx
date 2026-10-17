import { Search, ShoppingBag, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  search: string;
  onSearch: (value: string) => void;
  cartCount: number;
  onCartClick: () => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
}

export function Header({ search, onSearch, cartCount, onCartClick, isAdmin, onToggleAdmin }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href="#" className="font-display text-2xl tracking-tight text-ink">
          Tech<span className="italic text-accent">Moda</span>
        </a>

        <label className="relative ml-auto hidden max-w-xs flex-1 sm:block">
          <span className="sr-only">Buscar productos</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full rounded-full border border-line bg-white/70 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-ink/40 focus:bg-white"
          />
        </label>

        <button
          onClick={onToggleAdmin}
          aria-pressed={isAdmin}
          className={`ml-auto flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition sm:ml-0 ${
            isAdmin ? 'bg-ink text-paper' : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">{isAdmin ? 'Salir de admin' : 'Admin'}</span>
        </button>

        <button
          onClick={onCartClick}
          className="relative rounded-full p-2.5 text-ink transition hover:bg-ink/5"
          aria-label={`Abrir carrito (${cartCount} artículos)`}
        >
          <ShoppingBag className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-paper">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <div className="px-4 pb-3 sm:hidden">
        <label className="relative block">
          <span className="sr-only">Buscar productos</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full rounded-full border border-line bg-white/70 py-2 pl-10 pr-4 text-sm outline-none focus:border-ink/40"
          />
        </label>
      </div>
    </header>
  );
}
