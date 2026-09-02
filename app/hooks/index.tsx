import { hookRegistry, HookName, type HookContext } from '@salla.sa/twilight-theme-engine/hooks';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { AddProductToast } from '../components/cart';
import { SearchSuggestions } from '../components/search/SearchSuggestions';
import { AnnouncementBar } from '../components/AnnouncementBar';
import { DigitalFilesSettings } from '../components/product';

// The scaffold both auto-registers on module load (bottom of this file) AND
// has router.tsx call registerThemeHooks(). Every hook therefore registered
// TWICE, which renders each hook component twice - visible as a doubled
// announcement ticker. Guard so repeat calls are a no-op.
let registered = false;

export function registerThemeHooks() {
  if (registered) return;
  registered = true;

  // Register AddProductToast at body:end hook slot
  // Only renders when theme.settings.enable_add_product_toast is true
  hookRegistry.register(
    HookName.BODY_END,
    (context: HookContext) => {
      const { twilight } = context;
      if (!twilight?.theme?.settings?.enable_add_product_toast) return null;
      return <AddProductToast />;
    },
    50
  );

  // Running promo ticker above the header (noon / Trendyol pattern).
  hookRegistry.register(HookName.HEADER_START, () => <AnnouncementBar />, 40);

  // Live search suggestions. Mounted at body:end and attached to the header's
  // EXISTING search input - the header is a lazy engine component and hooks add
  // rather than replace, so rendering our own field would leave two search
  // boxes on the page.
  hookRegistry.register(HookName.BODY_END, () => <SearchSuggestions />, 60);

  // Register DigitalFilesSettings at product:single.description hook slot
  // Receives product from ProductDetails via context prop
  hookRegistry.register(
    HookName.PRODUCT_DESCRIPTION,
    (context: HookContext) => {
      const { product } = context as { product?: Product };
      if (!product?.digital_files_settings) return null;
      return <DigitalFilesSettings {...product.digital_files_settings} />;
    },
    50
  );
}

// Auto-register on module load
registerThemeHooks();
