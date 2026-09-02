import { createRouter } from '@salla.sa/twilight-theme-engine/tanstack';
import {
  registerHomeComponents,
  DefaultHomeComponents,
} from '@salla.sa/twilight-theme-engine/routes/home';
// The engine's home COMPONENTS live under /home; /routes/home only re-exports
// the registration helpers. Importing from the wrong one fails typecheck.
import { FeaturedProductsStyle1 } from '@salla.sa/twilight-theme-engine/home';
import { routeTree } from './routeTree.gen';
import {
  Brands,
  CustomTestimonials,
  EnhancedSlider,
  NoonProductGrid,
  NoonCategoryStrip,
  PromoBannerRail,
} from './components/home';
import { registerThemeHooks } from './hooks';

// Register theme-level hooks (AddProductToast, DigitalFilesSettings, etc.)
registerThemeHooks();

registerHomeComponents({
  ...DefaultHomeComponents,
  brands: Brands,
  'enhanced-slider': EnhancedSlider,
  'custom-testimonials': CustomTestimonials,
  // Category strip: a compact row of circular tiles instead of the stock
  // carousel of large white cards (6 per row + arrows -> ~11 visible).
  'main-links': NoonCategoryStrip,
  'square-links': NoonCategoryStrip,
  // Banner sections become an auto-advancing rail with arrows and dots.
  'enhanced-square-banners': PromoBannerRail,
  'fixed-banner': PromoBannerRail,
  'photos-slider': PromoBannerRail,

  // BUGFIX: the engine's DefaultHomeComponents only maps
  // 'featured-products:style1|style2|style3'. Stores that request the plain
  // 'featured-products' key hit an "Unknown component" error card on the
  // live page. Alias it to style1 so the section renders instead of erroring.
  'featured-products': FeaturedProductsStyle1,

  // Product sections render as a DENSE GRID instead of Salla's stock
  // carousels. A carousel shows ~4 large cards and hides the rest behind
  // arrows; a grid shows everything at once, which is what noon does and
  // what no amount of CSS could achieve against the slider component.
  'products-slider': NoonProductGrid,
  'fixed-products': NoonProductGrid,
  'slider-products-with-header': NoonProductGrid,
});

// Singleton for client-side (preserves QueryClient cache across navigations)
// SSR creates fresh instances per request via getRouter()
let clientRouter: ReturnType<typeof createRouter> | null = null;

// TanStack Start expects getRouter() for SSR compatibility
export function getRouter() {
  // On client: reuse existing router to preserve QueryClient cache
  if (typeof window !== 'undefined' && clientRouter) {
    return clientRouter;
  }

  // On SSR or first client load: create new router
  const router = createRouter(routeTree, {
    defaultPendingMs: 100,
    defaultPendingMinMs: 200,
  });

  // Cache for client-side
  if (typeof window !== 'undefined') {
    clientRouter = router;
  }

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
