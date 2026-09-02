/**
 * DEMO BANNERS — development only
 * -----------------------------------------------------------------------
 * Inline SVG so there is no network dependency and no stock photo turning
 * up on an electronics store. Used by PromoBannerRail when the store has no
 * banners configured, so the carousel can be designed and reviewed.
 */

export interface DemoBanner {
  title: string;
  subtitle: string;
  cta: string;
  from: string;
  to: string;
  url?: string;
}

export const DEMO_BANNERS: DemoBanner[] = [
  { title: 'عروض الجوالات', subtitle: 'خصم يصل إلى 40%', cta: 'تسوّق الآن', from: '#1f3a8a', to: '#4f46e5' },
  { title: 'سماعات وأجهزة صوت', subtitle: 'ابتداءً من 65 ريال', cta: 'اكتشف', from: '#0f766e', to: '#14b8a6' },
  { title: 'أجهزة لوحية', subtitle: 'توصيل مجاني', cta: 'تصفّح', from: '#9a3412', to: '#f97316' },
  { title: 'ساعات ذكية', subtitle: 'إصدارات 2026', cta: 'الجديد', from: '#831843', to: '#db2777' },
  { title: 'إكسسوارات الشحن', subtitle: 'اشترِ 2 واحصل على خصم', cta: 'العرض', from: '#3f3f46', to: '#71717a' },
];

/** Wide banner artwork as a data URI - no request, always renders. */
export function bannerImage(b: DemoBanner, i: number): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400">` +
    `<defs><linearGradient id="g${i}" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="${b.from}"/><stop offset="100%" stop-color="${b.to}"/>` +
    `</linearGradient></defs>` +
    `<rect width="1200" height="400" fill="url(#g${i})"/>` +
    `<circle cx="1010" cy="90" r="150" fill="#ffffff" opacity="0.07"/>` +
    `<circle cx="140" cy="330" r="190" fill="#ffffff" opacity="0.05"/>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
