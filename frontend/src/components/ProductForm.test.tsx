import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductForm } from './ProductForm';
import { mockProduct } from '../test/mockData';

describe('ProductForm', () => {
  it('valida campos obligatorios antes de guardar', async () => {
    const onSave = vi.fn();
    render(<ProductForm open onClose={vi.fn()} onSave={onSave} />);

    await userEvent.click(screen.getByRole('button', { name: 'Crear producto' }));

    expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('Ingresa un precio válido')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('envía los datos en camelCase y cierra al guardar', async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    const onClose = vi.fn();
    render(<ProductForm open onClose={onClose} onSave={onSave} />);

    await userEvent.type(screen.getByLabelText('Nombre'), 'Gorra');
    await userEvent.type(screen.getByLabelText('Precio (MXN)'), '250');
    await userEvent.type(screen.getByLabelText('Inventario'), '4');
    await userEvent.selectOptions(screen.getByLabelText('Categoría'), 'Accesorios');
    await userEvent.type(screen.getByLabelText('URL de imagen'), 'https://example.com/gorra.jpg');
    await userEvent.click(screen.getByRole('button', { name: 'Crear producto' }));

    expect(onSave).toHaveBeenCalledWith({
      name: 'Gorra',
      description: '',
      price: 250,
      category: 'Accesorios',
      stock: 4,
      imageUrl: 'https://example.com/gorra.jpg',
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('precarga el producto al editar y no cierra si falla', async () => {
    const onSave = vi.fn().mockResolvedValue(false);
    const onClose = vi.fn();
    render(<ProductForm open product={mockProduct} onClose={onClose} onSave={onSave} />);

    expect(screen.getByRole('dialog', { name: 'Editar producto' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toHaveValue(mockProduct.name);
    expect(screen.getByLabelText('Inventario')).toHaveValue(mockProduct.stock);

    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(onSave).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
