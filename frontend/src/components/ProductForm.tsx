import { useEffect, useState, type FormEvent } from 'react';
import { CATEGORIES, type Product, type ProductInput } from '../lib/types';
import { Modal } from './Modal';
import { ProductImage } from './ProductImage';

interface ProductFormProps {
  open: boolean;
  product?: Product;
  onClose: () => void;
  onSave: (input: ProductInput) => Promise<boolean>;
}

const empty = { name: '', description: '', price: '', category: 'Ropa', stock: '', imageUrl: '' };
type FormState = typeof empty;
type Errors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): Errors {
  const errors: Errors = {};
  if (!form.name.trim()) errors.name = 'El nombre es obligatorio';
  const price = Number(form.price);
  if (form.price === '' || Number.isNaN(price) || price < 0) errors.price = 'Ingresa un precio válido';
  const stock = Number(form.stock);
  if (form.stock === '' || !Number.isInteger(stock) || stock < 0) errors.stock = 'Ingresa un número entero ≥ 0';
  if (form.imageUrl && !/^https?:\/\//.test(form.imageUrl)) errors.imageUrl = 'Debe empezar con http:// o https://';
  return errors;
}

export function ProductForm({ open, product, onClose, onSave }: ProductFormProps) {
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      product
        ? {
            name: product.name,
            description: product.description,
            price: String(product.price),
            category: product.category || 'Ropa',
            stock: String(product.stock ?? 0),
            imageUrl: product.imageUrl,
          }
        : empty,
    );
  }, [open, product]);

  const set = (field: keyof FormState) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    const ok = await onSave({
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      stock: Number(form.stock),
      imageUrl: form.imageUrl.trim(),
    });
    setSaving(false);
    if (ok) onClose();
  };

  const field = (name: keyof FormState, label: string, input: JSX.Element) => (
    <div>
      <label htmlFor={`f-${name}`} className="mb-1.5 block text-sm font-medium text-ink/80">{label}</label>
      {input}
      {errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]}</p>}
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={product ? 'Editar producto' : 'Nuevo producto'}>
      <form onSubmit={handleSubmit} noValidate className="grid gap-5 p-6 sm:grid-cols-[1fr_9rem]">
        <div className="space-y-4">
          {field('name', 'Nombre', <input id="f-name" value={form.name} onChange={set('name')} className="input" />)}
          {field(
            'description',
            'Descripción',
            <textarea id="f-description" value={form.description} onChange={set('description')} rows={3} className="input resize-none" />,
          )}
          <div className="grid grid-cols-2 gap-4">
            {field('price', 'Precio (MXN)', <input id="f-price" type="number" min="0" step="0.01" value={form.price} onChange={set('price')} className="input" />)}
            {field('stock', 'Inventario', <input id="f-stock" type="number" min="0" step="1" value={form.stock} onChange={set('stock')} className="input" />)}
          </div>
          {field(
            'category',
            'Categoría',
            <select id="f-category" value={form.category} onChange={set('category')} className="input">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>,
          )}
          {field('imageUrl', 'URL de imagen', <input id="f-imageUrl" type="url" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://…" className="input" />)}
        </div>

        <div className="hidden sm:block">
          <p className="mb-1.5 text-sm font-medium text-ink/80">Vista previa</p>
          <ProductImage src={form.imageUrl} alt="Vista previa" className="aspect-[4/5] w-full rounded-lg" />
        </div>

        <div className="flex gap-3 sm:col-span-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Guardando…' : product ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
