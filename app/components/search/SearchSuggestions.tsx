import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { DEMO_PRODUCTS } from '../../demo/products';

/**
 * SearchSuggestions
 * -----------------------------------------------------------------------
 * Live product suggestions under the header's search box.
 *
 * The header is a lazy engine component and isn't registry-replaceable, and
 * theme hooks ADD ui rather than replace it - rendering our own search field
 * would leave the store with two. So this attaches to the input that is
 * already there: it finds the header search input, listens for typing, and
 * portals a positioned dropdown beneath it.
 *
 * Mounted once at the BODY_END hook slot.
 */

const MIN_CHARS = 2;
const DEBOUNCE_MS = 250;

function findSearchInput(): HTMLInputElement | null {
  const candidates = document.querySelectorAll<HTMLInputElement>(
    'input[type="search"], input[name="s"], input[name="q"], .s-search-input input, salla-search input, header input[placeholder]'
  );
  for (const el of candidates) {
    if (el.offsetParent !== null) return el; // first visible one
  }
  return null;
}

export function SearchSuggestions() {
  const [input, setInput] = useState<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const timer = useRef<number | null>(null);
  const box = useRef<HTMLDivElement | null>(null);

  // The header hydrates after us, so poll briefly rather than assume it's there.
  useEffect(() => {
    let tries = 0;
    const id = window.setInterval(() => {
      const el = findSearchInput();
      if (el || ++tries > 40) {
        if (el) setInput(el);
        window.clearInterval(id);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, []);

  const runSearch = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await product.list({ source: 'search', sourceValue: q, perPage: 6 });
      let found = res?.items ?? [];
      // DEV: the demo store returns nothing for most terms; fall back so the
      // dropdown can actually be designed. No-op in a published build.
      if (import.meta.env.DEV && found.length === 0) {
        const needle = q.toLowerCase();
        found = DEMO_PRODUCTS.filter((p) => p.name.toLowerCase().includes(needle)).slice(0, 6);
      }
      setItems(found);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!input) return;

    const reposition = () => setRect(input.getBoundingClientRect());

    const onInput = () => {
      const q = input.value.trim();
      setQuery(q);
      reposition();
      if (timer.current) window.clearTimeout(timer.current);
      if (q.length < MIN_CHARS) {
        setItems([]);
        setOpen(false);
        return;
      }
      setOpen(true);
      timer.current = window.setTimeout(() => runSearch(q), DEBOUNCE_MS);
    };

    const onFocus = () => {
      reposition();
      if (input.value.trim().length >= MIN_CHARS) setOpen(true);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (input.contains(t) || box.current?.contains(t)) return;
      setOpen(false);
    };

    input.addEventListener('input', onInput);
    input.addEventListener('focus', onFocus);
    input.addEventListener('keydown', onKey);
    document.addEventListener('click', onDocClick);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);

    return () => {
      input.removeEventListener('input', onInput);
      input.removeEventListener('focus', onFocus);
      input.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onDocClick);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [input, runSearch]);

  if (!open || !rect || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={box}
      className="search-sugg"
      style={{ top: rect.bottom + 6, insetInlineStart: rect.left, width: rect.width }}
      role="listbox"
    >
      {loading && <div className="search-sugg__state">{'جارٍ البحث…'}</div>}

      {!loading && items.length === 0 && (
        <div className="search-sugg__state">{'لا توجد نتائج لـ'} “{query}”</div>
      )}

      {!loading &&
        items.map((p) => (
          <a key={p.id} href={p.url} className="search-sugg__row" role="option">
            <span className="search-sugg__thumb">
              {p.image?.url && <img src={p.image.url} alt="" loading="lazy" />}
            </span>
            <span className="search-sugg__meta">
              <span className="search-sugg__name">{p.name}</span>
              <span className="search-sugg__price">
                {p.sale_price ?? p.price}
                {p.is_on_sale && p.regular_price ? (
                  <s className="search-sugg__was">{p.regular_price}</s>
                ) : null}
              </span>
            </span>
          </a>
        ))}

      {!loading && items.length > 0 && (
        <a className="search-sugg__all" href={`/search?q=${encodeURIComponent(query)}`}>
          {'عرض كل النتائج'}
        </a>
      )}
    </div>,
    document.body
  );
}

export default SearchSuggestions;
