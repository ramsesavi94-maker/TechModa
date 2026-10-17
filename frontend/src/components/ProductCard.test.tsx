import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from './ProductCard';
import { mockProducts } from '../test/mockData';

const [shirt, lowStock, soldOut] = mockProducts;

describe('ProductCard', () => {
  it('muestra nombre, categoría, precio e imagen', () => {
    render(<ProductCard product={shirt} />);
    expect(screen.getByText(shirt.name)).toBeInTheDocument();
    expect(screen.getByText('Ropa')).toBeInTheDocument();
    expect(screen.getByText('$499.00')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: shirt.name })).toHaveAttribute('src', shirt.imageUrl);
  });

  it('agrega al carrito en modo cliente', async () => {
    const onAddToCart = vi.fn();
    render(<ProductCard product={shirt} onAddToCart={onAddToCart} />);
    await userEvent.click(screen.getByRole('button', { name: /agregar camisa/i }));
    expect(onAddToCart).toHaveBeenCalledWith(shirt);
  });

  it('marca agotado y oculta el botón de agregar', () => {
    render(<ProductCard product={soldOut} />);
    expect(screen.getByText('Agotado')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /agregar/i })).not.toBeInTheDocument();
  });

  it('avisa de stock bajo', () => {
    render(<ProductCard product={lowStock} />);
    expect(screen.getByText('Últimas 3')).toBeInTheDocument();
  });

  it('en modo admin permite editar y eliminar', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<ProductCard product={shirt} isAdmin onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText('25 en inventario')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: `Editar ${shirt.name}` }));
    await userEvent.click(screen.getByRole('button', { name: `Eliminar ${shirt.name}` }));
    expect(onEdit).toHaveBeenCalledWith(shirt);
    expect(onDelete).toHaveBeenCalledWith(shirt);
  });

  it('abre el detalle al hacer clic en la imagen', async () => {
    const onOpen = vi.fn();
    render(<ProductCard product={shirt} onOpen={onOpen} />);
    await userEvent.click(screen.getByRole('button', { name: `Ver detalles de ${shirt.name}` }));
    expect(onOpen).toHaveBeenCalledWith(shirt);
  });
});
