import type { ProductTranslations } from './types';

// Traducciones del catálogo de ejemplo. En AWS estas se generan con
// Amazon Translate (POST /products/{id}/translate) y se guardan en DynamoDB.
export const SEED_TRANSLATIONS: Record<string, ProductTranslations> = {
  'tm-001': {
    en: { name: 'Scarlet maxi dress', description: 'Flowy chiffon maxi dress with a halter neckline. Perfect for daytime events.' },
    zh: { name: '猩红色长裙', description: '轻盈雪纺挂脖长裙，适合白天的活动。' },
    ja: { name: 'スカーレット マキシドレス', description: '軽やかなシフォン素材のホルターネックのマキシドレス。昼間のイベントにぴったり。' },
  },
  'tm-002': {
    en: { name: 'Terracotta bomber jacket', description: 'Satin nylon bomber with ribbed cuffs and a soft lining.' },
    zh: { name: '陶土色飞行员夹克', description: '缎面尼龙飞行员夹克，罗纹袖口，内衬柔软。' },
    ja: { name: 'テラコッタ ボンバージャケット', description: 'リブ袖とやわらかな裏地のサテンナイロン製ボンバー。' },
  },
  'tm-003': {
    en: { name: 'Red running sneakers', description: 'Breathable knit and cushioned sole for everyday runs.' },
    zh: { name: '红色跑步鞋', description: '透气针织鞋面搭配缓震鞋底，适合日常跑步。' },
    ja: { name: 'レッド ランニングスニーカー', description: '通気性のよいニットとクッション性のあるソールで毎日のランに。' },
  },
  'tm-004': {
    en: { name: 'Patent leather handbag', description: 'Structured red patent bag with a top handle and metal clasp.' },
    zh: { name: '漆皮手提包', description: '红色漆皮硬挺手提包，顶部提手，金属扣。' },
    ja: { name: 'エナメル ハンドバッグ', description: 'トップハンドルとメタルクラスプ付きの、きちんと感のある赤いエナメルバッグ。' },
  },
  'tm-005': {
    en: { name: 'Essential white tee', description: '100% combed cotton, straight fit. The basic that goes with everything.' },
    zh: { name: '基础款白色T恤', description: '100% 精梳棉，直筒版型。百搭基础款。' },
    ja: { name: 'エッセンシャル 白Tシャツ', description: 'コーマコットン100%、ストレートシルエット。何にでも合う定番。' },
  },
  'tm-006': {
    en: { name: 'Pastel sneakers', description: 'Leather sneakers with pastel panels and a platform sole.' },
    zh: { name: '马卡龙色运动鞋', description: '真皮运动鞋，拼接马卡龙色，厚底设计。' },
    ja: { name: 'パステル スニーカー', description: 'パステルカラーのパネルと厚底ソールのレザースニーカー。' },
  },
  'tm-007': {
    en: { name: 'Classic sunglasses', description: 'Black acetate frame with UV400 polarized lenses.' },
    zh: { name: '经典太阳镜', description: '黑色醋酸纤维镜框，UV400 偏光镜片。' },
    ja: { name: 'クラシック サングラス', description: 'ブラックアセテートフレームに UV400 偏光レンズ。' },
  },
  'tm-008': {
    en: { name: 'Denim jacket', description: 'Rigid denim with a corduroy collar and metal buttons.' },
    zh: { name: '牛仔夹克', description: '硬挺牛仔布，灯芯绒领，金属纽扣。' },
    ja: { name: 'デニムジャケット', description: 'コーデュロイ襟とメタルボタンのリジッドデニム。' },
  },
  'tm-009': {
    en: { name: 'Floral print heels', description: 'Pointed-toe stilettos with a floral print and a 10 cm heel.' },
    zh: { name: '印花高跟鞋', description: '尖头细高跟，花卉印花，鞋跟 10 厘米。' },
    ja: { name: 'フラワープリント ヒール', description: '花柄プリントのポインテッドトゥ・スティレット。ヒール10cm。' },
  },
  'tm-010': {
    en: { name: 'Grey hoodie', description: 'Brushed cotton fleece, kangaroo pocket and adjustable hood.' },
    zh: { name: '灰色连帽卫衣', description: '磨毛棉质抓绒，袋鼠口袋，可调节帽子。' },
    ja: { name: 'グレー パーカー', description: '起毛コットンフリース、カンガルーポケット、調節できるフード。' },
  },
  'tm-011': {
    en: { name: 'Minimalist white watch', description: '40 mm case, black dial and silicone strap.' },
    zh: { name: '极简白色手表', description: '40 毫米表壳，黑色表盘，硅胶表带。' },
    ja: { name: 'ミニマル ホワイトウォッチ', description: '40mm ケース、ブラック文字盤、シリコンストラップ。' },
  },
  'tm-012': {
    en: { name: 'Crochet knit poncho', description: 'Handmade natural cotton poncho with fringe.' },
    zh: { name: '钩针编织斗篷', description: '手工本色棉斗篷，带流苏。' },
    ja: { name: 'クロシェ編みポンチョ', description: 'フリンジ付きの生成りコットンのハンドメイドポンチョ。' },
  },
  'tm-013': {
    en: { name: 'Urban backpack', description: 'Water-resistant navy backpack with a 15" laptop compartment.' },
    zh: { name: '城市双肩包', description: '海军蓝防泼水双肩包，带 15 英寸笔记本电脑隔层。' },
    ja: { name: 'アーバン バックパック', description: '15インチPC収納付きの撥水ネイビーバックパック。' },
  },
  'tm-014': {
    en: { name: 'White leather sneakers', description: 'Classic white leather silhouette with a rubber sole.' },
    zh: { name: '白色真皮运动鞋', description: '经典白色真皮款，橡胶鞋底。' },
    ja: { name: 'ホワイトレザー スニーカー', description: 'ラバーソールのクラシックな白レザースニーカー。' },
  },
  'tm-015': {
    en: { name: 'Washed slim jeans', description: 'Stretch denim with rips and a medium wash.' },
    zh: { name: '水洗修身牛仔裤', description: '弹力牛仔布，破洞设计，中度水洗。' },
    ja: { name: 'ウォッシュ スリムジーンズ', description: 'ダメージ加工とミディアムウォッシュのストレッチデニム。' },
  },
};
