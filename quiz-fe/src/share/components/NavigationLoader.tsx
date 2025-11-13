"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import loadingService from '../services/loadingService';

/**
 * NavigationLoader: listens for internal link clicks and shows the global loader.
 * It also hides the loader when the pathname changes (navigation finished).
 */
export default function NavigationLoader() {
  const pathname = usePathname();

  useEffect(() => {
    // On any click, if it's an internal link, show loader
    const onClick = (e: MouseEvent) => {
      // only handle left clicks without modifier keys
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      let target = e.target as HTMLElement | null;
      while (target && target !== document.body) {
        if (target instanceof HTMLAnchorElement) {
          const href = target.getAttribute('href');
          const targetAttr = target.getAttribute('target');
          const download = target.getAttribute('download');
          if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return;
          if (targetAttr === '_blank' || download) return;
          // internal navigation heuristic: starts with / or same origin
          const isInternal = href.startsWith('/') || href.startsWith(window.location.origin);
          if (isInternal) {
            // don't show loader if link has data-skip-loader attribute
            if (target.hasAttribute('data-skip-loader')) return;
            loadingService.show();
          }
          return;
        }
        target = target.parentElement;
      }
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  useEffect(() => {
    // hide/reset loader on pathname change (navigation finished)
    loadingService.reset();
  }, [pathname]);

  return null;
}
