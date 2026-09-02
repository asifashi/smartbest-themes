import type { Product } from '@salla.sa/twilight-theme-engine/types';

/**
 * DEMO CATALOGUE — development only
 * -----------------------------------------------------------------------
 * The Theme Raed demo store carries ~5 furniture items with no sales, no
 * discounts and no deadlines, which makes it impossible to judge a dense
 * grid, a sale badge or a countdown. This dataset stands in during local
 * development so the theme can be designed against a realistic catalogue.
 *
 * Products mirror Smartbest's actual categories (phones, tablets, audio,
 * wearables) with a realistic spread: on-sale and full-price, in and out of
 * stock, rated and unrated, and a few time-limited offers so the countdown
 * has something to count.
 *
 * GUARDED BY `import.meta.env.DEV` at the call site - this never reaches a
 * published theme. See useDemoFallback().
 */

// Inline SVG placeholders: no network dependency, no random landscape photos
// turning up on an electronics store, and they always load in the preview.
const PALETTE = ['#eef2f7', '#f3f0ea', '#eef5f1', '#f5eef2', '#eff0f6', '#f6f2ea'];
const IMG = (seed: string, i: number) => {
  const bg = PALETTE[i % PALETTE.length];
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">` +
    `<rect width="600" height="600" fill="${bg}"/>` +
    `<g fill="none" stroke="#c7ccd6" stroke-width="10" stroke-linejoin="round">` +
    `<rect x="196" y="150" width="208" height="300" rx="26"/>` +
    `<line x1="250" y1="196" x2="350" y2="196"/>` +
    `<circle cx="300" cy="404" r="16"/>` +
    `</g></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

interface Seed {
  name: string;
  price: number;
  was?: number;
  rating?: [number, number]; // [stars, count]
  sold?: number;
  out?: boolean;
  endsInHours?: number;
  promo?: string;
}

const SEEDS: Seed[] = [
  { name: 'انفينكس هوت 60i 5G ‏256GB أسود', price: 819, was: 999, rating: [4.5, 214], sold: 340, endsInHours: 8, promo: 'خصم' },
  { name: 'انفينكس هوت 60 5G ‏256GB كراميل', price: 749, was: 899, rating: [4.3, 118], sold: 210, endsInHours: 8 },
  { name: 'تكنو سكاي 17 برو ماكس 5G ‏1TB', price: 465, was: 599, rating: [4.1, 87], sold: 512, promo: 'عرض خاص' },
  { name: 'تكنو سكاي S26 ألترا 5G ‏16GB', price: 549, was: 699, rating: [4.4, 63], sold: 145 },
  { name: 'CCIT X17 برو ماكس 5G', price: 399, was: 469, rating: [3.9, 41], sold: 96 },
  { name: 'CCIT T17 برو ماكس 5G', price: 379, rating: [4.0, 52], sold: 78 },
  { name: 'تاب X17 برو ماكس 10.1 بوصة', price: 480, was: 560, rating: [4.2, 34], sold: 61, endsInHours: 30 },
  { name: 'سماعات ايربودز لاسلكية بشاشة لمس', price: 65, was: 99, rating: [4.6, 402], sold: 1240, promo: 'الأكثر مبيعاً' },
  { name: 'نظارات ذكية بلوتوث مع ترجمة فورية', price: 189, was: 249, rating: [4.0, 28], sold: 44 },
  { name: 'كاميرا أكشن 4K بزاوية 180 درجة', price: 185, rating: [4.3, 76], sold: 132 },
  { name: 'ساعة ذكية رياضية مقاومة للماء', price: 129, was: 179, rating: [4.2, 156], sold: 288 },
  { name: 'شاحن سريع 65W ثلاثي المنافذ', price: 79, rating: [4.7, 511], sold: 1890 },
  { name: 'باور بانك 20000mAh شحن سريع', price: 95, was: 129, rating: [4.5, 233], sold: 640, endsInHours: 52 },
  { name: 'سماعة رأس بخاصية إلغاء الضجيج', price: 219, was: 289, rating: [4.4, 91], sold: 175 },
  { name: 'مكبر صوت بلوتوث محمول 20W', price: 149, rating: [4.1, 67], sold: 203, out: true },
  { name: 'حامل جوال للسيارة مغناطيسي', price: 39, rating: [4.3, 318], sold: 940 },
  { name: 'كيبل شحن Type-C مضفر 2 متر', price: 25, was: 35, rating: [4.6, 720], sold: 3100 },
  { name: 'واقي شاشة زجاجي 9H للجوالات', price: 19, rating: [4.2, 445], sold: 2050 },
  { name: 'لوحة مفاتيح لاسلكية عربي/انجليزي', price: 115, was: 149, rating: [4.0, 58], sold: 87 },
  { name: 'ماوس لاسلكي صامت 2.4G', price: 45, rating: [4.4, 189], sold: 410 },
  { name: 'جهاز فحص الحمل المنزلي - 3 قطع', price: 29, rating: [4.1, 22], sold: 58 },
  { name: 'ميزان حرارة رقمي بالأشعة', price: 89, was: 119, rating: [4.5, 104], sold: 267 },
  { name: 'جهاز قياس ضغط الدم أوتوماتيك', price: 179, rating: [4.6, 143], sold: 312, out: true },
  { name: 'حقيبة ظهر للابتوب مقاومة للماء', price: 139, was: 189, rating: [4.3, 76], sold: 154 },
];

function build(seed: Seed, i: number): Product {
  const id = 900000000 + i;
  const onSale = typeof seed.was === 'number' && seed.was > seed.price;
  const pct = onSale ? Math.round(((seed.was! - seed.price) / seed.was!) * 100) : 0;

  return {
    id,
    name: seed.name,
    description: seed.name,
    url: `#demo-${id}`,
    type: 'product',
    status: 'sale',
    price: seed.price,
    sale_price: seed.price,
    regular_price: seed.was ?? seed.price,
    starting_price: null,
    base_currency_price: { currency: 'SAR', amount: seed.price },
    currency: 'SAR',
    discount_percentage: onSale ? `${pct}%` : undefined,
    price_as_float: seed.price,
    quantity: seed.out ? 0 : 25,
    max_quantity: 10,
    sold_quantity: seed.sold ?? 0,
    can_show_sold: !!seed.sold,
    promotion_title: seed.promo,
    discount_ends: seed.endsInHours
      ? new Date(Date.now() + seed.endsInHours * 3600 * 1000).toISOString()
      : undefined,
    rating: seed.rating ? { stars: seed.rating[0], count: seed.rating[1] } : undefined,
    image: { url: IMG(String(id), i), alt: seed.name } as Product['image'],
    images: [{ url: IMG(String(id), i), alt: seed.name }] as Product['images'],
    is_taxable: true,
    has_read_more: false,
    can_add_note: false,
    can_show_remained_quantity: false,
    can_upload_file: false,
    has_custom_form: false,
    has_metadata: false,
    has_options: false,
    is_on_sale: onSale,
    is_hidden_quantity: false,
    is_available: !seed.out,
    is_out_of_stock: !!seed.out,
    is_require_shipping: true,
    has_size_guide: false,
  } as unknown as Product;
}

export const DEMO_PRODUCTS: Product[] = SEEDS.map(build);

/**
 * Returns demo products when the real store has too few to judge a layout.
 * Development only - in a published build this always returns `real`.
 */
export function useDemoFallback(real: Product[], min = 8): Product[] {
  if (!import.meta.env.DEV) return real;
  if (real.length >= min) return real;
  return DEMO_PRODUCTS;
}
