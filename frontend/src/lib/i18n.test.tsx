import { describe, it, expect } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, translate, useI18n } from './i18n';
import { localInsights } from './insights';
import { SEED_PRODUCTS } from './seed';

function Probe() {
  const { t, setLang } = useI18n();
  return (
    <>
      <p>{t('hero.cta')}</p>
      <button onClick={() => setLang('ja')}>ja</button>
    </>
  );
}

describe('i18n', () => {
  it('interpola variables y cae a español si falta una clave', () => {
    expect(translate('en', 'nav.openCart', { n: 2 })).toBe('Open cart (2 items)');
    expect(translate('en', 'nav.admin')).toBe('Admin');
  });

  it('cambia de idioma, lo recuerda y actualiza <html lang>', async () => {
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );
    expect(screen.getByText('Comprar ahora')).toBeInTheDocument();
    await act(() => userEvent.click(screen.getByRole('button', { name: 'ja' })));
    expect(screen.getByText('今すぐ購入')).toBeInTheDocument();
    expect(localStorage.getItem('techmoda.lang')).toBe('ja');
    expect(document.documentElement.lang).toBe('ja');
  });

  it('todos los productos de ejemplo tienen traducción', () => {
    for (const p of SEED_PRODUCTS) {
      expect(p.translations?.en?.name).toBeTruthy();
      expect(p.translations?.zh?.name).toBeTruthy();
      expect(p.translations?.ja?.name).toBeTruthy();
    }
  });

  it('la ficha local existe para cada categoría e idioma', () => {
    const sheet = localInsights(SEED_PRODUCTS[0], 'zh');
    expect(sheet.ai).toBe(false);
    expect(sheet.features.length).toBeGreaterThanOrEqual(3);
    expect(sheet.tip).toBeTruthy();
  });
});
