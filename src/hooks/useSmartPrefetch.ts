import { useEffect } from 'react';

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

/** Predictive preconnect (on-scroll-into-view) + prefetch (on hover/touch) for external links. */
export function useSmartPrefetch() {
  useEffect(() => {
    const nav = navigator as Navigator & {
      connection?: NetworkInformation;
      mozConnection?: NetworkInformation;
      webkitConnection?: NetworkInformation;
    };
    const connection = nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
    if (connection && (connection.saveData || connection.effectiveType?.includes('2g'))) return;

    const preconnected = new Set<string>();
    const prefetched = new Set<string>();

    function preconnect(url: string) {
      try {
        const origin = new URL(url).origin;
        if (preconnected.has(origin)) return;

        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = origin;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);

        const dns = document.createElement('link');
        dns.rel = 'dns-prefetch';
        dns.href = origin;
        document.head.appendChild(dns);

        preconnected.add(origin);
      } catch {
        /* invalid URL — skip */
      }
    }

    function prefetch(url: string) {
      if (prefetched.has(url)) return;
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
      prefetched.add(url);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const href = (entry.target as HTMLAnchorElement).href;
            if (href) preconnect(href);
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '50px' },
    );

    const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="http"]');
    const cleanups: Array<() => void> = [];

    links.forEach((link) => {
      observer.observe(link);
      const onIntent = () => prefetch(link.href);
      link.addEventListener('mouseenter', onIntent, { once: true });
      link.addEventListener('touchstart', onIntent, { once: true, passive: true });
      cleanups.push(() => {
        link.removeEventListener('mouseenter', onIntent);
        link.removeEventListener('touchstart', onIntent);
      });
    });

    return () => {
      observer.disconnect();
      cleanups.forEach((fn) => fn());
    };
  }, []);
}
