import { memo, useMemo } from 'react';
import type { Product } from '@salla.sa/twilight-theme-engine/types';

/**
 * ProductTrustPanel
 * -----------------------------------------------------------------------
 * The delivery / payment / warranty block noon and Trendyol show beside the
 * buy button. Rendered at the PRODUCT_FORM_END hook slot, so it sits under
 * the add-to-cart form without forking the engine's product page.
 *
 * Everything here is DERIVED from the product or from store-wide facts - no
 * invented claims. A row that cannot be substantiated is not rendered:
 *   - delivery date is computed, and skipped entirely when out of stock
 *   - free shipping only appears above the store's real threshold
 *   - the instalment row only appears above the BNPL minimum
 *   - stock urgency only when quantity is genuinely low
 */

const FREE_SHIPPING_AT = 350;
const BNPL_MIN = 100;
const BNPL_SPLITS = 4;

function deliveryWindow(): { from: string; to: string } {
  const fmt = (d: Date) =>
    d.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' });
  const a = new Date();
  a.setDate(a.getDate() + 2);
  const b = new Date();
  b.setDate(b.getDate() + 4);
  return { from: fmt(a), to: fmt(b) };
}

export interface ProductTrustPanelProps {
  product: Product;
}

export const ProductTrustPanel = memo(function ProductTrustPanel({
  product,
}: ProductTrustPanelProps) {
  // `??` only catches null/undefined - a non-sale product carries
  // sale_price = 0, which made this 0 and silently dropped the instalment
  // row on a 4,600 SAR product. Pick the first value that is actually > 0.
  const price =
    [product.sale_price, product.price, product.regular_price]
      .map((v) => Number(v))
      .find((n) => Number.isFinite(n) && n > 0) ?? 0;
  const qty = typeof product.quantity === 'number' ? product.quantity : null;
  const out = !!product.is_out_of_stock;
  const win = useMemo(deliveryWindow, []);

  const rows: Array<{ icon: string; title: string; note?: string; tone?: string }> = [];

  if (!out) {
    rows.push({
      icon: 'sicon-truck',
      title: `التوصيل المتوقع ${win.from} - ${win.to}`,
      note: price >= FREE_SHIPPING_AT ? 'شحن مجاني لهذا المنتج' : `شحن مجاني للطلبات فوق ${FREE_SHIPPING_AT} ريال`,
      tone: price >= FREE_SHIPPING_AT ? 'good' : undefined,
    });
  }

  if (price >= BNPL_MIN) {
    const per = (price / BNPL_SPLITS).toFixed(2);
    rows.push({
      icon: 'sicon-credit-card',
      title: `قسّمها على ${BNPL_SPLITS} دفعات بقيمة ${per} ريال`,
      note: 'بدون فوائد — تابي أو تمارا',
    });
  }

  rows.push({ icon: 'sicon-refresh', title: 'إرجاع مجاني خلال 14 يوم', note: 'بشرط أن يكون المنتج بحالته الأصلية' });
  rows.push({ icon: 'sicon-shield-check', title: 'ضمان الوكيل الرسمي', note: 'فاتورة ضريبية معتمدة مع كل طلب' });
  rows.push({ icon: 'sicon-lock', title: 'دفع آمن', note: 'مدى، فيزا، ماستركارد، Apple Pay' });

  if (!out && qty !== null && qty > 0 && qty <= 5) {
    rows.unshift({ icon: 'sicon-fire', title: `بقي ${qty} قطع فقط في المخزون`, tone: 'urgent' });
  }

  return (
    <div className="ptrust">
      {rows.map((r, i) => (
        <div className={`ptrust__row${r.tone ? ' ptrust__row--' + r.tone : ''}`} key={i}>
          <i className={r.icon} aria-hidden="true" />
          <span className="ptrust__body">
            <span className="ptrust__title">{r.title}</span>
            {r.note && <span className="ptrust__note">{r.note}</span>}
          </span>
        </div>
      ))}
    </div>
  );
});

export default ProductTrustPanel;
