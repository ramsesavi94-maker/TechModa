import { useMemo, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { AdminStats } from './components/AdminStats';
import { CartDrawer } from './components/CartDrawer';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
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
        <div className="relative bg-surface px-10 py-1.5 text-center text-[11px] tracking-wide text-muted">
          Demo con datos de ejemplo · los cambios se guardan solo en tu navegador ·{' '}
          <button onClick={handleResetDemo} className="text-ink underline underline-offset-2">
            Restablecer
          </button>
          <button
            onClick={() => setShowDemoBanner(false)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-muted hover:text-ink"
            aria-label="Ocultar aviso de demo"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
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

      {!isAdmin && <Hero onShop={() => catalogRef.current?.scrollIntoView({ behavior: 'smooth' })} />}

      <main ref={catalogRef} id="catalogo" className="mx-auto max-w-page scroll-mt-14 px-4 md:px-10">
        {isAdmin && (
          <AdminStats
            products={products}
            onCreate={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          />
        )}

        <div className="sticky top-[6.5rem] z-30 -mx-4 flex h-12 items-center justify-between gap-4 border-b border-line bg-paper/95 px-4 backdrop-blur-sm md:top-14 md:-mx-10 md:px-10">
          <div className="no-scrollbar flex h-full gap-4 overflow-x-auto md:gap-6" role="tablist" aria-label="Categorías">
            {['Todos', ...CATEGORIES].map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={category === c}
                onClick={() => setCategory(c)}
                className={`relative shrink-0 text-[12px] uppercase tracking-[0.12em] transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-ink after:transition-transform after:duration-300 after:ease-out-quint ${
                  category === c ? 'text-ink after:scale-x-100' : 'text-muted after:scale-x-0 hover:text-ink'
                }`}
              >
                {c}
                <sup className="ml-0.5 text-[10px] tabular-nums">{countFor(c)}</sup>
              </button>
            ))}
          </div>

          <label className="relative flex shrink-0 items-center gap-2 text-[12px] text-muted">
            <span className="max-sm:sr-only">Ordenar por</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="cursor-pointer appearance-none bg-transparent pr-5 text-[12px] text-ink outline-none"
            >
              {Object.entries(SORTS).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-0 h-3.5 w-3.5 text-ink" strokeWidth={1.5} aria-hidden="true" />
          </label>
        </div>

        <div className="py-10 md:py-14">
          {loading ? (
            <div role="status" aria-label="Cargando productos" className="grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i}>
                  <div className="aspect-[4/5] animate-pulse bg-surface" />
                  <div className="mt-3 h-3 w-2/3 animate-pulse bg-surface" />
                  <div className="mt-2 h-3 w-1/4 animate-pulse bg-surface" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div role="alert" className="border-l-2 border-danger py-2 pl-5">
              <p className="font-display text-2xl text-ink">No pudimos cargar el catálogo.</p>
              <p className="mt-1 text-[13px] text-muted">{error}</p>
              <button onClick={refetch} className="btn-secondary mt-6">Reintentar</button>
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <h3 className="font-display text-3xl">No se encontraron productos</h3>
              <p className="mt-3 text-[15px] text-muted">
                {search || category !== 'Todos' ? 'Intenta ajustar la búsqueda o la categoría.' : 'Agrega productos para comenzar.'}
              </p>
            </div>
          ) : (
            <>
              <p className="eyebrow mb-6 text-muted">{visible.length} {visible.length === 1 ? 'pieza' : 'piezas'}</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
                {visible.map((product, i) => (
                  <ProductCard
                    key={product.productId}
                    product={product}
                    isAdmin={isAdmin}
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
            </>
          )}
        </div>
      </main>

      <footer className="mt-16 overflow-hidden bg-ink text-paper/70">
        <div className="mx-auto grid max-w-page grid-cols-2 gap-10 px-4 pb-10 pt-16 text-[13px] md:grid-cols-4 md:px-10">
          <div>
            <p className="eyebrow text-paper">Tienda</p>
            <ul className="mt-4 space-y-2">
              {CATEGORIES.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-paper">Ayuda</p>
            <ul className="mt-4 space-y-2">
              <li>Envíos</li>
              <li>Devoluciones</li>
              <li>Guía de tallas</li>
            </ul>
          </div>
          <div>
            <p className="eyebrow text-paper">Proyecto</p>
            <p className="mt-4 leading-6">E-commerce de moda sobre una API REST serverless en AWS: API Gateway, Lambda y DynamoDB.</p>
            <a href={REPO_URL} className="link-underline mt-3 inline-block text-paper">Ver código en GitHub</a>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="eyebrow text-paper">Newsletter</p>
            <p className="mt-4">Novedades y lanzamientos, una vez al mes.</p>
            <label className="mt-4 flex items-center border-b border-paper/40 focus-within:border-paper">
              <span className="sr-only">Correo electrónico</span>
              <input type="email" placeholder="tu@correo.com" className="w-full bg-transparent py-2 text-paper outline-none placeholder:text-paper/50 focus-visible:outline-none" />
              <span className="text-paper" aria-hidden="true">→</span>
            </label>
          </div>
        </div>
        <p className="mx-auto max-w-page px-4 text-[11px] text-paper/60 md:px-10">Proyecto de portafolio · © 2026 TechModa</p>
        <p
          className="mt-4 translate-y-[8%] select-none text-center font-display text-[18vw] leading-[0.75] tracking-[-0.03em] text-paper"
          aria-hidden="true"
        >
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
