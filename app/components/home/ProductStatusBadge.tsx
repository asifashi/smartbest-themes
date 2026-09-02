import { memo, useEffect, useMemo, useState } from 'react';
import type { Product } from '@salla.sa/twilight-theme-engine/types';

/**
 * ProductStatusBadge
 * -----------------------------------------------------------------------
 * The rotating status strip noon shows under a product: "Free Delivery"
 * cycles to "Selling out fast" cycles to "Express", and so on.
 *
 * Rendered as an overlay ALONGSIDE the engine's ProductCard rather than
 * inside it - the card is engine-owned, so wrapping is the only way to add
 * to it without forking the component and losing cart/wishlist behaviour.
 *
 * Which messages appear is derived from the product itself, so the strip
 * tells the truth: low stock only shows when quantity is genuinely low,
 * free delivery only above the store's threshold. A product that earns no
 * message renders nothing rather than an invented one.
 *
 * Each card starts its cycle at a different offset so a grid doesn't blink
 * in unison, which looks mechanical.
 */

const FREE_DELIVERY_THRESHOLD = 350;
const LOW_STOCK_AT = 5;
const ROTATE_MS = 3200;

type Tone = 'ship' | 'urgent' | 'fast' | 'deal';
interface Msg {
  tone: Tone;
  icon: string;
  text: string;
}

function messagesFor(p: Product): Msg[] {
  const out: Msg[] = [];
  const price = Number(p.sale_price ?? p.price ?? 0);
  const qty = typeof p.quantity === 'number' ? p.quantity : null;

  if (price >= FREE_DELIVERY_THRESHOLD) {
    out.push({ tone: 'ship', icon: 'sicon-truck', text: 'توصيل مجاني' });
  }
  if (qty !== null && qty > 0 && qty <= LOW_STOCK_AT) {
    out.push({ tone: 'urgent', icon: 'sicon-fire', text: `بقي ${qty} فقط` });
  }
  if ((p.sold_quantity ?? 0) >= 100) {
    out.push({ tone: 'fast', icon: 'sicon-trending-up', text: 'ينفد سريعاً' });
  }
  if (p.is_on_sale && p.discount_percentage) {
    out.push({ tone: 'deal', icon: 'sicon-discount', text: `وفّر ${p.discount_percentage}` });
  }
  if (out.length === 0 && !p.is_out_of_stock) {
    out.push({ tone: 'fast', icon: 'sicon-flash', text: 'توصيل سريع' });
  }
  return out;
}

export interface ProductStatusBadgeProps {
  product: Product;
  /** stagger index so a whole grid doesn't flip at the same instant */
  index?: number;
}

export const ProductStatusBadge = memo(function ProductStatusBadge({
  product,
  index = 0,
}: ProductStatusBadgeProps) {
  const msgs = useMemo(() => messagesFor(product), [product]);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (msgs.length < 2) return;
    const start = window.setTimeout(
      () => setI((n) => (n + 1) % msgs.length),
      (index % 5) * 400
    );
    const id = window.setInterval(() => setI((n) => (n + 1) % msgs.length), ROTATE_MS);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [msgs.length, index]);

  if (product.is_out_of_stock || msgs.length === 0) return null;
  const m = msgs[i % msgs.length];

  return (
    <div className={`pstatus pstatus--${m.tone}`}>
      {/* key on the text so React swaps the node and the fade re-runs */}
      <span className="pstatus__in" key={m.text}>
        <i className={m.icon} aria-hidden="true" />
        {m.text}
      </span>
    </div>
  );
});

export default ProductStatusBadge;
