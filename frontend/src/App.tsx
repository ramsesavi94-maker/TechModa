import { useMemo, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { AdminStats } from './components/AdminStats';
import { CartDrawer } from './components/CartDrawer';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Header } from './components/Header';
import { CategoryTiles } from './components/CategoryTiles';
import { Hero, Marquee } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductDetail } from './components/ProductDetail';
import { ProductForm } from './components/ProductForm';
import { Toasts, useToasts } from './components/Toasts';
import { useCart } from './hooks/useCart';
import { useProducts } from './hooks/useProducts';
import { isDemoMode } from './lib/api';
import { resetDemoData } from './lib/demoStore';
import { CATEGORIES, type Product, type ProductInput } from './lib/types';

type Sort = 'recent' | 'price-asc' | 'price-desc' | 'name';

const SORTS: Record<Sort, { label: string; compare: (a: Product, b: Product) => number }> = {
  recent: { label: 'Novedades', compare: (a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '') },
  'price-asc': { label: 'Precio: menor a mayor', compare: (a, b) => a.price - b.price },
  'price-desc': { label: 'Precio: mayor a menor', compare: (a, b) => b.price - a.price },
  name: { label: 'Nombre (A–Z)', compare: (a, b) => a.name.localeCompare(b.name, 'es') },
};

const REPO_URL = 'https://github.com/ramsesavi94-maker/TechModa';

function App() {
  const { products, loading, error, createProduct, updateProduct, deleteProduct, refetch } = useProducts();
  const cart = useCart(products);
  const { toasts, notify } = useToasts();

  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [sort, setSort] = useState<Sort>('recent');
  const [detail, setDetail] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>();
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [showDemoBanner, setShowDemoBanner] = useState(true);
  const catalogRef = useRef<HTMLElement>(null);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products
      .filter((p) => category === 'Todos' || p.category === category)
      .filter((p) => !term || p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term))
      .sort(SORTS[sort].compare);
  }, [products, search, category, sort]);

  // Los 4 productos más recientes llevan la etiqueta "Nuevo".
  const newestIds = useMemo(
    () => new Set([...products].sort(SORTS.recent.compare).slice(0, 4).map((p) => p.productId)),
    [products],
  );

  const scrollToCatalog = () => catalogRef.current?.scrollIntoView({ behavior: 'smooth' });

  const countFor = (c: string) => (c === 'Todos' ? products.length : products.filter((p) => p.category === c).length);

  const addToCart = (product: Product, quantity = 1) => {
    cart.add(product, quantity);
    notify(`${product.name} agregado al carrito`);
  };

  const handleSave = async (input: ProductInput) => {
    const result = editing ? await updateProduct(editing.productId, input) : await createProduct(input);
    if (result.success) notify(editing ? 'Producto actualizado' : 'Producto creado');
    else notify(result.error, 'error');
    return result.success;
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const result = await deleteProduct(toDelete.productId);
    notify(result.success ? 'Producto eliminado' : result.error, result.success ? 'success' : 'error');
    setToDelete(null);
  };

  const handleCheckout = () => {
    cart.clear();
    setCartOpen(false);
    notify('¡Pedido simulado con éxito! Gracias por probar la demo.');
  };

  const handleResetDemo = async () => {
    resetDemoData();
    await refetch();
    notify('Catálogo de ejemplo restablecido');
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      {isDemoMode && showDemoBanner && (
        <div className="relative bg-ink px-10 py-2 text-center text-[12px] text-paper/85">
          <span className="badge mr-2 bg-lime text-ink">Demo</span>
          Datos de ejemplo · los cambios se guardan solo en tu navegador ·{' '}
          <button onClick={handleResetDemo} className="font-semibold text-paper underline underline-offset-2">
            Restablecer
          </button>
          <button
            onClick={() => setShowDemoBanner(false)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-paper/70 hover:text-paper"
            aria-label="Ocultar aviso de demo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Header
        search={search}
        onSearch={setSearch}
        cartCount={cart.count}
        onCartClick={() => setCartOpen(true)}
        isAdmin={isAdmin}
        onToggleAdmin={() => {
          setIsAdmin((v) => !v);
          window.scrollTo({ top: 0 });
        }}
      />

      {!isAdmin && (
        <>
          <Hero onShop={scrollToCatalog} />
          <div className="mt-3 md:mt-6">
            <Marquee />
          </div>
          <CategoryTiles
            countFor={countFor}
            onSelect={(c) => {
              setCategory(c);
              scrollToCatalog();
            }}
          />
        </>
      )}

      <main ref={catalogRef} id="catalogo" className="mx-auto max-w-page scroll-mt-16 px-3 md:px-6">
        {isAdmin && (
          <AdminStats
            products={products}
            onCreate={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          />
        )}

        {!isAdmin && (
          <div className="flex items-end justify-between gap-4 pb-2 pt-12 md:pt-16">
            <h2 className="display text-5xl md:text-7xl">
              Lo más <span className="rounded-lg bg-lime px-2">nuevo</span>
            </h2>
            <p className="eyebrow pb-2 text-muted">{visible.length} {visible.length === 1 ? 'pieza' : 'piezas'}</p>
          </div>
        )}

        <div className="sticky top-[7.75rem] z-30 -mx-3 flex items-center justify-between gap-3 bg-paper/90 px-3 py-3 backdrop-blur-md md:top-16 md:-mx-6 md:px-6">
          <div className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist" aria-label="Categorías">
            {['Todos', ...CATEGORIES].map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={category === c}
                onClick={() => setCategory(c)}
                className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[13px] font-semibold transition ${
                  category === c ? 'border-ink bg-ink text-paper' : 'border-line bg-white text-ink hover:border-ink'
                }`}
              >
                {c}
                <span className={`rounded-full px-1.5 text-[11px] tabular-nums ${category === c ? 'bg-lime text-ink' : 'bg-surface text-muted'}`}>
                  {countFor(c)}
                </span>
              </button>
            ))}
          </div>

          <label className="relative flex shrink-0 items-center text-[13px] font-semibold">
            <span className="sr-only">Ordenar por</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-9 w-[8.75rem] cursor-pointer appearance-none truncate rounded-full border border-line bg-white pl-4 pr-9 sm:w-auto text-[13px] font-semibold text-ink outline-none hover:border-ink"
            >
              {Object.entries(SORTS).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4" aria-hidden="true" />
          </label>
        </div>

        <div className="pb-16 pt-4">
          {loading ? (
            <div role="status" aria-label="Cargando productos" className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i}>
                  <div className="aspect-[4/5] animate-pulse rounded-2xl bg-surface" />
                  <div className="mt-3 h-3.5 w-2/3 animate-pulse rounded-full bg-surface" />
                  <div className="mt-2 h-3 w-1/4 animate-pulse rounded-full bg-surface" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div role="alert" className="rounded-3xl bg-coral/15 p-6">
              <p className="display text-3xl text-ink">No pudimos cargar el catálogo.</p>
              <p className="mt-2 text-[14px] text-muted">{error}</p>
              <button onClick={refetch} className="btn-primary mt-5">Reintentar</button>
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <h3 className="display text-5xl">No se encontraron productos</h3>
              <p className="mt-3 text-[15px] text-muted">
                {search || category !== 'Todos' ? 'Intenta ajustar la búsqueda o la categoría.' : 'Agrega productos para comenzar.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 md:gap-y-10 lg:grid-cols-4">
              {visible.map((product, i) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  isAdmin={isAdmin}
                  isNew={newestIds.has(product.productId)}
                  style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
                  onOpen={setDetail}
                  onAddToCart={addToCart}
                  onEdit={(p) => {
                    setEditing(p);
                    setFormOpen(true);
                  }}
                  onDelete={setToDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="overflow-hidden rounded-t-[2rem] bg-ink text-paper/80">
        <div className="mx-auto max-w-page px-4 pt-14 md:px-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <p className="display text-4xl text-paper md:text-5xl">Únete al club</p>
              <p className="mt-3 max-w-sm text-[14px]">Drops, descuentos y lanzamientos antes que nadie.</p>
              <label className="mt-5 flex max-w-sm items-center gap-2 rounded-full bg-paper/10 p-1.5 pl-5 focus-within:ring-2 focus-within:ring-lime">
                <span className="sr-only">Correo electrónico</span>
                <input type="email" placeholder="tu@correo.com" className="min-w-0 flex-1 bg-transparent text-[14px] text-paper outline-none placeholder:text-paper/50 focus-visible:outline-none" />
                <button type="button" onClick={() => notify('¡Listo! Te avisaremos de los próximos drops (demo).')} className="btn-lime h-10 shrink-0 px-5">Unirme</button>
              </label>
            </div>
            <div>
              <p className="eyebrow text-lime">Tienda</p>
              <ul className="mt-4 space-y-2 text-[14px]">
                {CATEGORIES.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
            <div>
              <p className="eyebrow text-lime">Ayuda</p>
              <ul className="mt-4 space-y-2 text-[14px]">
                <li>Envíos</li>
                <li>Devoluciones</li>
                <li>Guía de tallas</li>
              </ul>
            </div>
            <div>
              <p className="eyebrow text-lime">Proyecto</p>
              <p className="mt-4 text-[14px] leading-6">E-commerce serverless en AWS: API Gateway, Lambda y DynamoDB.</p>
              <a href={REPO_URL} className="link-underline mt-2 inline-block text-[14px] font-semibold text-paper">Ver código en GitHub ↗</a>
            </div>
          </div>
          <p className="mt-12 text-[12px] text-paper/60">Proyecto de portafolio · © 2026 TechModa</p>
        </div>
        <p className="display mt-6 select-none whitespace-nowrap text-center text-[22vw] leading-[0.78] text-lime" aria-hidden="true">
          TechModa
        </p>
      </footer>

      <ProductDetail product={detail} onClose={() => setDetail(null)} onAddToCart={addToCart} />
      <ProductForm open={formOpen} product={editing} onClose={() => setFormOpen(false)} onSave={handleSave} />
      <ConfirmDialog
        open={!!toDelete}
        title="Eliminar producto"
        message={`¿Seguro que quieres eliminar "${toDelete?.name ?? ''}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        lines={cart.lines}
        subtotal={cart.subtotal}
        shipping={cart.shipping}
        total={cart.total}
        onQuantity={cart.setQuantity}
        onRemove={cart.remove}
        onCheckout={handleCheckout}
      />
      <Toasts toasts={toasts} />
    </div>
  );
}

export default App;
