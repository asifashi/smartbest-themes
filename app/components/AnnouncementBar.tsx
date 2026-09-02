import { memo } from 'react';

/**
 * AnnouncementBar
 * -----------------------------------------------------------------------
 * The thin scrolling promo strip that sits ABOVE the header - the "running
 * ad" noon and Trendyol both run at the very top of the page.
 *
 * Implementation notes:
 * - The track is duplicated once and translated by exactly -50%, so the loop
 *   is seamless with no gap or jump at the wrap point.
 * - Duration scales with the number of messages, so adding a message slows
 *   the belt instead of speeding every message up.
 * - Pauses on hover so a shopper can actually read an offer they spotted.
 * - Honours prefers-reduced-motion: the animation stops and the messages
 *   simply sit still rather than moving.
 */

export interface AnnouncementItem {
  text: string;
  icon?: string;
  url?: string;
}

const DEFAULT_ITEMS: AnnouncementItem[] = [
  { icon: 'sicon-truck', text: 'شحن مجاني للطلبات فوق 350 ريال' },
  { icon: 'sicon-shield-check', text: 'ضمان الوكيل الرسمي على جميع الأجهزة' },
  { icon: 'sicon-refresh', text: 'إرجاع مجاني خلال 14 يوم' },
  { icon: 'sicon-credit-card', text: 'قسّمها على 4 دفعات بدون فوائد' },
  { icon: 'sicon-headphone', text: 'دعم فني 7 أيام في الأسبوع' },
];

export interface AnnouncementBarProps {
  items?: AnnouncementItem[];
  /** seconds per message - total duration scales with count */
  speed?: number;
}

export const AnnouncementBar = memo(function AnnouncementBar({
  items = DEFAULT_ITEMS,
  speed = 6,
}: AnnouncementBarProps) {
  if (!items.length) return null;

  const duration = items.length * speed;
  // Duplicated once; the keyframe translates -50% so the copy lands exactly
  // where the original started.
  const belt = [...items, ...items];

  return (
    <div className="announce" role="region" aria-label="عروض المتجر">
      <div className="announce__mask">
        <div className="announce__track" style={{ animationDuration: `${duration}s` }}>
          {belt.map((it, i) => {
            const body = (
              <>
                {it.icon && <i className={it.icon} aria-hidden="true" />}
                <span>{it.text}</span>
              </>
            );
            return (
              <span className="announce__item" key={i} aria-hidden={i >= items.length}>
                {it.url ? (
                  <a href={it.url} className="announce__link">
                    {body}
                  </a>
                ) : (
                  body
                )}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default AnnouncementBar;
