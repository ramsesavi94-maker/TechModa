import type { Lang } from './i18n';
import type { Product, ProductInsights } from './types';

type Sheet = Omit<ProductInsights, 'ai'>;

// Guía de estilo local por categoría: se usa en la demo o cuando Bedrock está
// apagado (EnableAI=false), así la ficha nunca queda vacía ni genera costo.
const SHEETS: Record<string, Record<Lang, Sheet>> = {
  Ropa: {
    es: {
      features: ['Corte pensado para moverte todo el día', 'Telas fáciles de lavar y de secado rápido', 'Combina con básicos y piezas statement'],
      season: 'Perfecta para el día a día de otoño, de la escuela al plan nocturno.',
      tip: 'Súmale tenis blancos y un accesorio de color para subirle el nivel.',
    },
    en: {
      features: ['Cut designed to move all day', 'Easy-care, quick-dry fabrics', 'Pairs with basics and statement pieces'],
      season: 'Perfect for everyday fall plans, from class to a night out.',
      tip: 'Add white sneakers and a pop-of-color accessory to level it up.',
    },
    zh: {
      features: ['版型方便全天活动', '面料易打理、快干', '可搭配基础款或亮点单品'],
      season: '适合秋季日常，从上课到晚上出门都合适。',
      tip: '搭配白色运动鞋和一件亮色配饰，立刻提升造型。',
    },
    ja: {
      features: ['一日中動きやすいカッティング', 'お手入れ簡単・速乾素材', '定番にも主役アイテムにも合う'],
      season: '秋のデイリーに。学校から夜のお出かけまで。',
      tip: '白スニーカーと差し色の小物を合わせてワンランク上に。',
    },
  },
  Zapatos: {
    es: {
      features: ['Suela con buen agarre y amortiguación', 'Materiales resistentes al uso diario', 'Diseño que roba miradas'],
      season: 'Todo el año: caminar la ciudad, conciertos y fines de semana.',
      tip: 'Deja que sean el protagonista: combínalos con un outfit en tonos neutros.',
    },
    en: {
      features: ['Grippy, cushioned sole', 'Materials built for daily wear', 'Head-turning design'],
      season: 'All year: city walks, concerts and weekends.',
      tip: 'Let them steal the show: pair them with a neutral-toned outfit.',
    },
    zh: {
      features: ['鞋底抓地好、有缓震', '材质耐穿适合日常', '吸睛设计'],
      season: '全年适用：逛街、演唱会和周末。',
      tip: '让鞋子成为主角：搭配中性色调的穿搭。',
    },
    ja: {
      features: ['グリップとクッション性に優れたソール', '毎日履ける丈夫な素材', '目を引くデザイン'],
      season: '一年中：街歩き、ライブ、週末に。',
      tip: '主役にしよう：ニュートラルカラーのコーデと合わせて。',
    },
  },
  Accesorios: {
    es: {
      features: ['El detalle que termina tu outfit', 'Materiales durables y fáciles de cuidar', 'Funciona como regalo seguro'],
      season: 'Para cualquier ocasión: del día a día a eventos especiales.',
      tip: 'Elige un solo accesorio protagonista por outfit para que destaque.',
    },
    en: {
      features: ['The detail that finishes your outfit', 'Durable, easy-care materials', 'A safe bet as a gift'],
      season: 'Any occasion: from everyday to special events.',
      tip: 'Pick one hero accessory per outfit so it stands out.',
    },
    zh: {
      features: ['完成整体造型的点睛之笔', '材质耐用、易保养', '送礼不会出错'],
      season: '适合各种场合：从日常到特别活动。',
      tip: '每套穿搭只选一件主角配饰，更突出。',
    },
    ja: {
      features: ['コーデを完成させる仕上げの一品', '丈夫でお手入れ簡単な素材', 'プレゼントにも安心'],
      season: 'どんなシーンにも：デイリーから特別なイベントまで。',
      tip: '主役の小物はコーデにひとつだけ。ぐっと引き立ちます。',
    },
  },
};

export function localInsights(product: Product, lang: Lang): ProductInsights {
  const sheet = (SHEETS[product.category] ?? SHEETS.Ropa)[lang];
  return { ...sheet, ai: false };
}
