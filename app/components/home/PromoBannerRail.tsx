import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { DEMO_BANNERS, bannerImage, type DemoBanner } from '../../demo/banners';

/**
 * PromoBannerRail
 * -----------------------------------------------------------------------
 * The sliding promo banner row noon runs beneath the hero.
 *
 * Auto-advances left-to-right, with < > arrows and dot indicators. Built on
 * native scroll-snap rather than a JS slider so touch, trackpad and keyboard
 * scrolling all work for free and the arrows are an addition rather than the
 * only way through.
 *
 * Auto-play stops on hover/focus and under prefers-reduced-motion, and never
 * fights the user: any manual scroll resets the timer instead of yanking the
 * rail back.
 */

interface StoreBanner {
  image?: string;
  mobile_image?: string;
  title?: string;
  url?: string;
}

export interface PromoBannerRailProps {
  data: {
    banners?: StoreBanner[];
    items?: StoreBanner[];
    title?: string;
    position?: number;
    [key: string]: unknown;
  };
}

const AUTOPLAY_MS = 4500;

export const PromoBannerRail = memo(function PromoBannerRail({ data }: PromoBannerRailProps) {
  // A banner with no image is not a banner - the demo store has several, and
  // accepting them rendered an empty grey slide. Require an actual image.
  const store = (data.banners || data.items || []).filter(
    (b) => b && typeof b.image === 'string' && b.image.trim().length > 0
  );
  const useDemo = import.meta.env.DEV && store.length === 0;

  const rail = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = useDemo ? DEMO_BANNERS.length : store.length;

  const goTo = useCallback((i: number) => {
    const el = rail.current;
    if (!el || !el.children.length) return;
    const idx = ((i % el.children.length) + el.children.length) % el.children.length;
    const child = el.children[idx] as HTMLElement;
    el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  }, []);

  // Track which slide is centred, so dots and autoplay stay in step with
  // whatever the user did manually.
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const onScroll = () => {
      const mid = Math.abs(el.scrollLeft) + el.clientWidth / 2;
      let best = 0;
      let bestD = Infinity;
      [...el.children].forEach((c, i) => {
        const e = c as HTMLElement;
        const d = Math.abs(e.offsetLeft - el.offsetLeft + e.clientWidth / 2 - mid);
        if (d < bestD) { bestD = d; best = i; }
      });
      setActive(best);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [count]);

  useEffect(() => {
    if (paused || count < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => goTo(active + 1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [active, paused, count, goTo]);

  if (count === 0) return null;

  const slides: Array<{ img: string; title?: string; sub?: string; cta?: string; url?: string }> =
    useDemo
      ? DEMO_BANNERS.map((b: DemoBanner, i) => ({
          img: bannerImage(b, i), title: b.title, sub: b.subtitle, cta: b.cta, url: b.url,
        }))
      : store.map((b) => ({ img: b.image || '', title: b.title, url: b.url }));

  return (
    <div
      className="container promo-rail__wrap"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {data.title && <h2 className="promo-rail__title">{data.title}</h2>}

      <button type="button" className="promo-rail__arrow promo-rail__arrow--prev"
        onClick={() => goTo(active - 1)} aria-label="السابق">
        <i className="sicon-keyboard_arrow_right" aria-hidden="true" />
      </button>

      <div className="promo-rail" ref={rail}>
        {slides.map((s, i) => {
          const inner = (
            <>
              <img src={s.img} alt={s.title || ''} loading={i === 0 ? 'eager' : 'lazy'} />
              {(s.title || s.sub) && (
                <span className="promo-rail__copy">
                  {s.title && <span className="promo-rail__h">{s.title}</span>}
                  {s.sub && <span className="promo-rail__s">{s.sub}</span>}
                  {s.cta && <span className="promo-rail__cta">{s.cta}</span>}
                </span>
              )}
            </>
          );
          return s.url ? (
            <Link key={i} to={s.url} className="promo-rail__slide">{inner}</Link>
          ) : (
            <div key={i} className="promo-rail__slide">{inner}</div>
          );
        })}
      </div>

      <button type="button" className="promo-rail__arrow promo-rail__arrow--next"
        onClick={() => goTo(active + 1)} aria-label="التالي">
        <i className="sicon-keyboard_arrow_left" aria-hidden="true" />
      </button>

      {count > 1 && (
        <div className="promo-rail__dots" role="tablist">
          {slides.map((_, i) => (
            <button key={i} type="button"
              className={`promo-rail__dot${i === active ? ' is-active' : ''}`}
              onClick={() => goTo(i)} aria-label={`شريحة ${i + 1}`}
              aria-selected={i === active} role="tab" />
          ))}
        </div>
      )}
    </div>
  );
});

export default PromoBannerRail;
