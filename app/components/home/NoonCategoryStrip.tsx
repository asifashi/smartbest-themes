import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';

/**
 * NoonCategoryStrip
 * -----------------------------------------------------------------------
 * Replaces Salla's stock `main-links` block.
 *
 * The stock version wraps categories in a SallaSlider carousel and renders
 * each as a large white card, so six eat a full row and the rest hide behind
 * controls. This is a scroll-snap rail of compact tiles with < > arrows -
 * the noon pattern.
 *
 * Behaviour details that matter:
 * - Arrows hide when there is nothing to scroll to on that side, so a short
 *   list doesn't show dead controls.
 * - Scrolls by ~80% of the visible width, keeping a little context rather
 *   than jumping a clean page and losing the reader's place.
 * - Native horizontal scroll still works (trackpad, touch, shift+wheel);
 *   the arrows are an addition, not a replacement.
 * - RTL-aware: scrollLeft is negative in RTL, so edge detection uses the
 *   absolute value.
 */

interface LinkItem {
  url?: string;
  icon?: string;
  image?: string;
  title?: string;
  link_title?: string;
}
interface Category {
  url?: string;
  icon?: string;
  image?: string;
  name?: string;
}

export interface NoonCategoryStripProps {
  data: {
    links?: LinkItem[];
    categories?: Category[];
    show_cats?: boolean;
    title?: string;
    position?: number;
    [key: string]: unknown;
  };
}

export const NoonCategoryStrip = memo(function NoonCategoryStrip({
  data,
}: NoonCategoryStripProps) {
  const { links = [], categories = [], show_cats: showCats = false, title } = data;
  const items = showCats ? categories : links;

  const rail = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    // RTL reports scrollLeft as negative; compare on magnitude.
    const pos = Math.abs(el.scrollLeft);
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(pos > 4);
    setCanNext(max - pos > 4);
  }, []);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      el.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [sync, items.length]);

  const nudge = useCallback((dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === 'rtl';
    const step = el.clientWidth * 0.8 * dir * (rtl ? -1 : 1);
    el.scrollBy({ left: step, behavior: 'smooth' });
  }, []);

  if (!items.length) return null;

  return (
    <div className="container noon-cats__wrap">
      {title && <h2 className="noon-cats__title">{title}</h2>}

      <button
        type="button"
        className="noon-cats__arrow noon-cats__arrow--prev"
        onClick={() => nudge(-1)}
        hidden={!canPrev}
        aria-label="السابق"
      >
        <i className="sicon-keyboard_arrow_right" aria-hidden="true" />
      </button>

      <div className="noon-cats" ref={rail}>
        {items.map((item, index) => {
          const label = showCats
            ? (item as Category).name
            : (item as LinkItem).title || (item as LinkItem).link_title;
          const icon = showCats ? (item as Category).icon : (item as LinkItem).icon;
          const image = showCats ? (item as Category).image : (item as LinkItem).image;
          const url = item.url || '#';
          if (!label && !showCats) return null;

          return (
            <Link key={index} to={url} className="noon-cats__item">
              <span className="noon-cats__thumb">
                {image ? (
                  <img src={image} alt={label || ''} width="54" height="54" loading="lazy" decoding="async" />
                ) : icon ? (
                  <i className={icon} />
                ) : null}
              </span>
              <span className="noon-cats__label">{label}</span>
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        className="noon-cats__arrow noon-cats__arrow--next"
        onClick={() => nudge(1)}
        hidden={!canNext}
        aria-label="التالي"
      >
        <i className="sicon-keyboard_arrow_left" aria-hidden="true" />
      </button>
    </div>
  );
});

export default NoonCategoryStrip;
