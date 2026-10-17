import { formatPrice } from './format';
import { translate, type Lang } from './i18n';
import type { Product } from './types';

// Asistente de estilo local (sin costo): interpreta ocasión, presupuesto,
// colores y categorías por palabras clave y recomienda piezas reales del
// catálogo. En AWS, con EnableAI=true, lo reemplaza Claude en Bedrock.

export interface AssistantReply {
  reply: string;
  productIds: string[];
}

const normalize = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const CATEGORY_WORDS: Record<string, string[]> = {
  Ropa: ['ropa', 'vestido', 'chaqueta', 'chamarra', 'camiseta', 'playera', 'sudadera', 'jeans', 'pantalon', 'poncho', 'clothes', 'clothing', 'dress', 'jacket', 'shirt', 'tee', 'hoodie', 'pants', '衣服', '服装', '裙', '夹克', '服', 'ドレス', 'ジャケット', 'パーカー'],
  Zapatos: ['zapato', 'zapatos', 'tenis', 'tacon', 'tacones', 'calzado', 'shoe', 'shoes', 'sneaker', 'sneakers', 'heels', '鞋', '运动鞋', '靴', 'スニーカー', 'シューズ', 'ヒール'],
  Accesorios: ['accesorio', 'accesorios', 'bolso', 'bolsa', 'lentes', 'gafas', 'reloj', 'mochila', 'accessory', 'accessories', 'bag', 'sunglasses', 'watch', 'backpack', '配饰', '包', '眼镜', '手表', 'アクセサリー', 'バッグ', '時計', 'サングラス'],
};

// Colores y su raíz en las descripciones (en español) del catálogo.
const COLOR_WORDS: Record<string, string[]> = {
  roj: ['rojo', 'roja', 'red', 'escarlata', '红', '赤'],
  blanc: ['blanco', 'blanca', 'white', '白'],
  negr: ['negro', 'negra', 'black', '黑', '黒'],
  azul: ['azul', 'blue', 'navy', 'marino', '蓝', '青', 'ネイビー'],
  gris: ['gris', 'grey', 'gray', '灰', 'グレー'],
  pastel: ['pastel', 'rosa', 'pink', '粉', 'パステル'],
  terracota: ['terracota', 'cafe', 'brown', 'naranja', 'orange', '棕', 'テラコッタ'],
};

// Ocasiones -> productos/estilos que suelen encajar.
const OCCASIONS: { words: string[]; boost: string[] }[] = [
  { words: ['concierto', 'festival', 'fiesta', 'antro', 'party', 'concert', '演唱会', '派对', 'ライブ', 'パーティー'], boost: ['bomber', 'mezclilla', 'jeans', 'running', 'lentes', 'tenis'] },
  { words: ['regalo', 'regalar', 'gift', 'cumpleanos', 'novia', 'novio', '礼物', 'プレゼント'], boost: ['bolso', 'reloj', 'lentes', 'mochila', 'vestido'] },
  { words: ['boda', 'evento', 'cita', 'date', 'wedding', '约会', '婚礼', 'デート'], boost: ['vestido', 'tacones', 'bolso', 'reloj'] },
  { words: ['escuela', 'universidad', 'oficina', 'trabajo', 'school', 'work', 'office', '上课', '学校', '仕事'], boost: ['mochila', 'camiseta', 'sudadera', 'jeans', 'tenis blancos'] },
  { words: ['correr', 'gym', 'deporte', 'run', 'running', 'sport', '跑步', '运动', 'ランニング'], boost: ['running', 'sudadera', 'camiseta'] },
  { words: ['frio', 'invierno', 'otono', 'cold', 'winter', 'fall', '冬', '秋', '寒'], boost: ['sudadera', 'chaqueta', 'bomber', 'poncho'] },
];

const GREETINGS = ['hola', 'buenas', 'hey', 'hi', 'hello', '你好', 'こんにちは'];
const THANKS = ['gracias', 'thanks', 'thank you', '谢谢', 'ありがとう'];

function maxBudget(text: string): number | null {
  // "menos de 1,700", "hasta $2000", "under 1700", "2000以内", "1700 以内"
  const match = text.match(/(?:menos de|hasta|maximo|max|under|below|less than)?\s*\$?\s*(\d[\d,.]*)\s*(?:pesos|mxn|以内|以下)?/);
  if (!match) return null;
  const value = Number(match[1].replace(/[,.]/g, ''));
  return Number.isFinite(value) && value >= 100 ? value : null;
}

export function localAssistant(message: string, products: Product[], lang: Lang): AssistantReply {
  const text = normalize(message);
  const t = (key: Parameters<typeof translate>[1], vars?: Record<string, string>) => translate(lang, key, vars);
  const available = products.filter((p) => p.stock > 0);

  const categories = Object.entries(CATEGORY_WORDS)
    .filter(([, words]) => words.some((w) => text.includes(normalize(w))))
    .map(([category]) => category);
  const colors = Object.entries(COLOR_WORDS)
    .filter(([, words]) => words.some((w) => text.includes(normalize(w))))
    .map(([root]) => root);
  const boosts = OCCASIONS.filter((o) => o.words.some((w) => text.includes(normalize(w)))).flatMap((o) => o.boost);
  const budget = maxBudget(text);

  const hasIntent = categories.length || colors.length || boosts.length || budget;
  if (!hasIntent) {
    if (GREETINGS.some((g) => text.includes(normalize(g)))) return { reply: t('assistant.greetReply'), productIds: [] };
    if (THANKS.some((g) => text.includes(normalize(g)))) return { reply: t('assistant.thanks'), productIds: [] };
  }

  const scored = available
    .filter((p) => budget === null || p.price <= budget)
    .filter((p) => !categories.length || categories.includes(p.category))
    .map((p) => {
      const haystack = normalize(`${p.name} ${p.description}`);
      let score = 0;
      for (const color of colors) if (haystack.includes(color)) score += 3;
      for (const word of boosts) if (haystack.includes(word)) score += 2;
      for (const word of text.split(/\s+/)) if (word.length > 3 && haystack.includes(word)) score += 1;
      return { p, score };
    })
    .filter(({ score }) => score > 0 || !(colors.length || boosts.length))
    .sort((a, b) => b.score - a.score || (b.p.createdAt ?? '').localeCompare(a.p.createdAt ?? ''));

  if (!hasIntent && !scored.some(({ score }) => score > 0)) {
    return { reply: t('assistant.offTopic'), productIds: [] };
  }

  const picks = scored.slice(0, 3).map(({ p }) => p.productId);
  if (!picks.length) {
    const newest = [...available].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')).slice(0, 3);
    return { reply: t('assistant.noMatch'), productIds: newest.map((p) => p.productId) };
  }

  return {
    reply: budget !== null ? t('assistant.recommendBudget', { amount: formatPrice(budget) }) : t('assistant.recommend'),
    productIds: picks,
  };
}
