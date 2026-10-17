import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { api } from './lib/api';
import { mockProducts } from './test/mockData';

vi.mock('./lib/api', () => ({
  isDemoMode: false,
  api: {
    listProducts: vi.fn(),
    getProduct: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    translateProduct: vi.fn(),
    speakProduct: vi.fn(),
    productInsights: vi.fn(),
    askAssistant: vi.fn(),
  },
}));

const loaded = () => screen.findByText('Camisa Blanca Clásica');

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.listProducts).mockResolvedValue(mockProducts);
    vi.mocked(api.productInsights).mockResolvedValue({ features: ['Cómoda'], season: 'Otoño', tip: 'Con tenis', ai: false });
  });

  it('el asistente recomienda productos del catálogo y permite agregarlos', async () => {
    vi.mocked(api.askAssistant).mockResolvedValueOnce({ reply: 'Mira esto', productIds: ['test-product-101'], ai: false });
    render(<App />);
    await loaded();

    await userEvent.click(screen.getByRole('button', { name: 'Abrir asistente de estilo' }));
    const chat = screen.getByRole('dialog', { name: 'Vale · tu stylist' });
    await userEvent.type(within(chat).getByRole('textbox'), 'un regalo{Enter}');

    expect(await within(chat).findByText('Mira esto')).toBeInTheDocument();
    expect(api.askAssistant).toHaveBeenCalledWith('un regalo', [], 'es', mockProducts);
    await userEvent.click(within(chat).getByRole('button', { name: 'Agregar Reloj Elegante al carrito' }));
    expect(screen.getByRole('button', { name: /abrir carrito \(1/i })).toBeInTheDocument();
  });

  it('el detalle muestra la ficha de estilo', async () => {
    render(<App />);
    await loaded();
    await userEvent.click(screen.getByRole('button', { name: 'Ver detalles de Reloj Elegante' }));
    expect(await screen.findByText('Con tenis')).toBeInTheDocument();
    expect(api.productInsights).toHaveBeenCalledWith(expect.objectContaining({ productId: 'test-product-101' }), 'es');
  });

  it('vacía el carrito', async () => {
    render(<App />);
    await loaded();
    await userEvent.click(screen.getByRole('button', { name: 'Agregar Camisa Blanca Clásica al carrito' }));
    await userEvent.click(screen.getByRole('button', { name: /abrir carrito \(1/i }));
    await userEvent.click(screen.getByRole('button', { name: 'Vaciar carrito' }));
    expect(screen.getByText('Tu bolsa está vacía')).toBeInTheDocument();
  });

  it('muestra el estado de carga y luego el catálogo', async () => {
    render(<App />);
    expect(screen.getByRole('status', { name: 'Cargando productos' })).toBeInTheDocument();
    await loaded();
    expect(screen.getAllByTestId('product-card')).toHaveLength(mockProducts.length);
  });

  it('muestra un error con opción de reintentar', async () => {
    vi.mocked(api.listProducts).mockRejectedValueOnce(new Error('Error 500'));
    render(<App />);
    expect(await screen.findByText('No pudimos cargar el catálogo.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    await loaded();
  });

  it('filtra por categoría y por búsqueda', async () => {
    render(<App />);
    await loaded();

    await userEvent.click(screen.getByRole('tab', { name: /zapatos/i }));
    expect(screen.getAllByTestId('product-card')).toHaveLength(1);

    await userEvent.click(screen.getByRole('tab', { name: /todos/i }));
    await userEvent.type(screen.getAllByPlaceholderText('Buscar productos...')[0], 'reloj');
    expect(screen.getAllByTestId('product-card')).toHaveLength(1);
    expect(screen.getByText('Reloj Elegante')).toBeInTheDocument();
  });

  it('ordena por precio', async () => {
    render(<App />);
    await loaded();
    await userEvent.selectOptions(screen.getByLabelText('Ordenar por'), 'price-desc');
    const names = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(names[0]).toBe('Reloj Elegante');
  });

  it('agrega al carrito y lo muestra en el panel', async () => {
    render(<App />);
    await loaded();

    await userEvent.click(screen.getByRole('button', { name: 'Agregar Camisa Blanca Clásica al carrito' }));
    await userEvent.click(screen.getByRole('button', { name: /abrir carrito \(1/i }));

    const drawer = screen.getByRole('dialog', { name: 'Tu carrito' });
    expect(within(drawer).getByText('Camisa Blanca Clásica')).toBeInTheDocument();
  });

  it('en modo admin elimina tras confirmar', async () => {
    vi.mocked(api.deleteProduct).mockResolvedValueOnce();
    render(<App />);
    await loaded();

    await userEvent.click(screen.getByRole('button', { name: 'Admin' }));
    expect(screen.getByText('Panel de administración')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar Jeans Azules' }));
    const dialog = screen.getByRole('dialog', { name: 'Eliminar producto' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }));

    expect(api.deleteProduct).toHaveBeenCalledWith('test-product-456');
    await waitFor(() => expect(screen.queryByText('Jeans Azules')).not.toBeInTheDocument());
  });
});
