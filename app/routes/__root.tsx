import React, { lazy, Suspense, useEffect } from 'react';
import { HeadContent, Scripts, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { TwilightProvider } from '@salla.sa/twilight-theme-engine';
import {
  createTwilightRootRoute,
  getTwilightContext,
} from '@salla.sa/twilight-theme-engine/tanstack';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import themeTranslations from 'virtual:twilight/theme-translations';
import devSchema from 'virtual:twilight/schema';
import '../styles/app.css';

// Dev-only: reads the theme's local twilight.json (settings + components),
// fills defaults, and lets you edit them live. Imported from the engine's `/dev`
// subpath under an import.meta.env.DEV gate so it is tree-shaken from prod builds.
const DevSettingsWidget = import.meta.env.DEV
  ? lazy(() =>
      import('@salla.sa/twilight-theme-engine/dev').then((m) => ({ default: m.DevSettingsWidget }))
    )
  : null;

export const Route = createTwilightRootRoute()({
  shellComponent: RootComponent,
});

// Local-dev only: for a domainless store the SDK's links carry the store's
// `/{username}/` base segment, which Salla's edge strips in production before
// the theme sees it. There's no edge locally, so those links 404. Strip the
// segment here (username from the SDK config). Gated on localhost — production,
// where the edge already handles it, is never touched.
function DevStoreBasePathRedirect() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!/^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname)) return;

    const salla = (window as unknown as { salla?: { config?: { get?: (k: string) => unknown } } })
      .salla;
    const username = salla?.config?.get?.('store.username');
    if (typeof username !== 'string' || !username) return;

    const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`^(/[a-z]{2})?/${escaped}(?=/|$)`);
    if (!re.test(window.location.pathname)) return;

    const stripped =
      window.location.pathname.replace(re, (_m, locale?: string) => locale || '') || '/';
    navigate({ to: stripped + window.location.search + window.location.hash, replace: true });
  }, [pathname, navigate]);

  return null;
}

function RootComponent() {
  const ctx = getTwilightContext();

  return (
    <html lang={ctx.locale} dir={ctx.dir} suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <noscript>
          To get full functionality of this site you need to enable JavaScript.
          <a href="https://www.enable-javascript.com/" rel="noreferrer" target="_blank">
            To enable JavaScript on webpage
          </a>
          .
        </noscript>
        <TwilightProvider translations={themeTranslations}>
          <DevStoreBasePathRedirect />
          <Outlet />
        </TwilightProvider>
        <TanStackRouterDevtools position="bottom-right" />
        {DevSettingsWidget && (
          <Suspense fallback={null}>
            <DevSettingsWidget schema={devSchema} />
          </Suspense>
        )}
        <Scripts />
      </body>
    </html>
  );
}
