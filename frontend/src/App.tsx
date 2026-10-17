import { useMemo, useRef, useState } from 'react';
import { PackageSearch, RotateCcw } from 'lucide-react';
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
      {isDemoMode && (
        <div className="bg-ink px-4 py-2 text-center text-xs text-paper/80">
          Demo con datos de ejemplo · los cambios se guardan solo en tu navegador ·{' '}
          <button onClick={handleResetDemo} className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-paper">
            <RotateCcw className="h-3 w-3" /> Restablecer
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

      <main ref={catalogRef} id="catalogo" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-10 sm:px-6 lg:px-8">
        {isAdmin && (
          <AdminStats
            products={products}
            onCreate={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          />
        )}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            {!isAdmin && <h2 className="mb-4 font-display text-3xl text-ink sm:text-4xl">El catálogo</h2>}
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Categorías">
              {['Todos', ...CATEGORIES].map((c) => (
                <button
                  key={c}
                  role="tab"
                  aria-selected={category === c}
                  onClick={() => setCategory(c)}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition ${
                    category === c ? 'border-ink bg-ink text-paper' : 'border-line text-ink/70 hover:border-ink/40 hover:text-ink'
                  }`}
                >
                  {c} <span className="ml-1 tabular-nums opacity-50">{countFor(c)}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink/60">
            Ordenar por
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-full border border-line bg-transparent px-3 py-1.5 text-ink outline-none focus:border-ink/40"
            >
              {Object.entries(SORTS).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <div role="status" aria-label="Cargando productos" className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i}>
                <div className="aspect-[4/5] animate-pulse rounded-xl bg-sand" />
                <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-sand" />
                <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-sand" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
            <p className="font-medium">No pudimos cargar el catálogo.</p>
            <p className="mt-1 text-sm">{error}</p>
            <button onClick={refetch} className="btn-secondary mt-4">Reintentar</button>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <PackageSearch className="h-14 w-14 text-ink/20" />
            <h3 className="mt-4 font-display text-2xl">No se encontraron productos</h3>
            <p className="mt-2 text-ink/50">
              {search || category !== 'Todos' ? 'Intenta ajustar la búsqueda o la categoría.' : 'Agrega productos para comenzar.'}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-ink/50">{visible.length} {visible.length === 1 ? 'producto' : 'productos'}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {visible.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  isAdmin={isAdmin}
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
      </main>

      <footer className="mt-16 border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-ink/60 sm:px-6 md:flex-row md:justify-between lg:px-8">
          <div>
            <p className="font-display text-xl text-ink">Tech<span className="italic text-accent">Moda</span></p>
            <p className="mt-2 max-w-sm">
              Proyecto de portafolio: e-commerce de moda sobre una API REST serverless en AWS.
            </p>
          </div>
          <div>
            <p className="font-medium text-ink">Arquitectura</p>
            <p className="mt-2">API Gateway · Lambda (Node.js 22) · DynamoDB</p>
            <p>S3 + CloudFront · X-Ray · CloudWatch · AWS SAM</p>
            <a href={REPO_URL} className="mt-2 inline-block text-ink underline underline-offset-4 hover:text-accent">
              Ver código en GitHub
            </a>
          </div>
        </div>
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
