import { memo } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';

/**
 * NoonCategoryStrip
 * -----------------------------------------------------------------------
 * Replaces Salla's stock `main-links` block.
 *
 * The stock version wraps categories in a SallaSlider carousel and renders
 * each one as a large white card, so six categories eat a full row and the
 * rest hide behind arrows. noon shows a compact strip of ~11 circular tiles,
 * everything reachable, no controls on desktop.
 *
 * Written as a plain flex/grid strip rather than a slider so density is
 * actually controllable - a carousel owns its own slide widths.
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
  if (!items.length) return null;

  return (
    <div className="container">
      {title && <h2 className="noon-cats__title">{title}</h2>}

      <div className="noon-cats">
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
                  <img
                    src={image}
                    alt={label || ''}
                    width="52"
                    height="52"
                    loading="lazy"
                    decoding="async"
                  />
                ) : icon ? (
                  <i className={icon} />
                ) : null}
              </span>
              <span className="noon-cats__label">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
});

export default NoonCategoryStrip;
