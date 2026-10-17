const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export const formatPrice = (value: number) => currency.format(value);

export const FREE_SHIPPING_FROM = 999;
export const SHIPPING_COST = 149;
export const LOW_STOCK = 5;
