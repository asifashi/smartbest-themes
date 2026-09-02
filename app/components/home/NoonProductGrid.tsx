import { Suspense, useMemo } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { product, type ProductsListSource } from '@salla.sa/twilight-theme-engine/api/product';
import { ProductCard } from '@salla.sa/twilight-theme-engine/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { DealCountdown } from './DealCountdown';
import { useDemoFallback } from '../../demo/products';

/**
 * NoonProductGrid
 * -----------------------------------------------------------------------
 * Replaces Salla's stock product CAROUSELS with a dense GRID.
 *
 * The stock theme renders home product sections through SallaProductsSlider,
 * a carousel that shows ~4 large cards and hides the rest behind arrows. noon
 * (and every high-density marketplace) shows a grid instead: many small cards,
 * everything visible, no clicking to browse.
 *
 * That difference cannot be achieved with CSS - a carousel and a grid are
 * different components - which is why this exists.
 *
 * Registered against the product section keys in router.tsx.
 */

interface ProductsSourceConfig {
  source?: string;
  source_value?: number | number[] | null;
}

export interface NoonProductGridData {
  title?: string;
  description?: string;
  display_all_url?: string;
  products?: ProductsSourceConfig | Product[];
  position?: number;
  /** how many rows deep before we stop (grid stays tidy on huge catalogues) */
  limit?: number;
  [key: string]: unknown;
}

export interface NoonProductGridProps {
  data: NoonProductGridData;
}

function GridSkeleton({ count = 14 }: { count?: number }) {
  return (
    <div className="noon-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="noon-grid__skeleton" />
      ))}
    </div>
  );
}

function GridBody({
  source,
  sourceValue,
  limit,
}: {
  source: ProductsListSource;
  sourceValue?: string | number | number[];
  limit: number;
}) {
  const { data } = useSuspenseQuery({
    queryKey: ['noon-grid', source, sourceValue, limit],
    queryFn: () => product.list({ source, sourceValue, perPage: limit }),
    staleTime: 5 * 60 * 1000,
  });

  // PaginatedResult is { items, next } - NOT { data }
  // In DEV, fall back to the demo catalogue when the store is too thin to
  // judge a dense layout (the Raed demo has ~5 items, no sales, no deadlines).
  // useDemoFallback is a no-op in a published build.
  const real: Product[] = data?.items ?? [];
  const pool = useDemoFallback(real);
  // The store's section limit (often 4) is right for a carousel but leaves a
  // grid as one short row. When the demo pool stands in, show enough to
  // actually fill rows; real data still honours the merchant's limit.
  const usingDemo = pool !== real;
  const cap = usingDemo ? Math.max(limit, 18) : limit;
  const items: Product[] = pool.slice(0, cap);
  if (!items.length) return null;

  // Drive the countdown off real data: the EARLIEST offer to expire in this
  // section. No time-limited product -> no timer, so non-sale rows stay clean.
  const soonest = items
    .map((p) => p.discount_ends)
    .filter((d): d is string => typeof d === 'string' && d.length > 0)
    .map((d) => ({ raw: d, ms: new Date(d).getTime() }))
    .filter((d) => Number.isFinite(d.ms) && d.ms > Date.now())
    .sort((a, b) => a.ms - b.ms)[0];

  return (
    <>
      {soonest && (
        <div className="noon-grid__deal">
          <span className="noon-grid__deal-label">{'ينتهي خلال'}</span>
          <DealCountdown endsAt={soonest.raw} />
        </div>
      )}
      <div className="noon-grid">
        {items.map((p, i) => (
          <ProductCard
            key={p.id}
            product={p}
            layout="vertical"
            withShadow={false}
            imagePriority={i < 8}
          />
        ))}
      </div>
    </>
  );
}

export function NoonProductGrid({ data }: NoonProductGridProps) {
  const {
    title,
    description,
    display_all_url: displayAll,
    products: productsField,
    limit = 21,
  } = data;

  const { source, sourceValue } = useMemo(() => {
    if (
      productsField &&
      !Array.isArray(productsField) &&
      typeof productsField === 'object' &&
      'source' in productsField
    ) {
      const cfg = productsField as ProductsSourceConfig;
      return {
        source: cfg.source as ProductsListSource | undefined,
        sourceValue: cfg.source_value ?? undefined,
      };
    }
    const arr: Product[] = Array.isArray(productsField) ? productsField : [];
    const ids = arr.map((p) => p.id).filter((id): id is number => typeof id === 'number');
    return ids.length
      ? { source: 'selected' as ProductsListSource, sourceValue: ids }
      : { source: undefined, sourceValue: undefined };
  }, [productsField]);

  if (!source) return null;

  const displayAllUrl = displayAll && displayAll !== '' && displayAll !== '#' ? displayAll : undefined;

  return (
    <div className="container">
      {(title || displayAllUrl) && (
        <div className="noon-grid__head">
          <div>
            {title && <h2 className="noon-grid__title">{title}</h2>}
            {description && <p className="noon-grid__desc">{description}</p>}
          </div>
          {displayAllUrl && (
            <a href={displayAllUrl} className="noon-grid__all">
              {'عرض الكل'}
            </a>
          )}
        </div>
      )}

      <Suspense fallback={<GridSkeleton />}>
        <GridBody
          source={source}
          sourceValue={sourceValue as string | number | number[] | undefined}
          limit={limit}
        />
      </Suspense>
    </div>
  );
}

export default NoonProductGrid;
