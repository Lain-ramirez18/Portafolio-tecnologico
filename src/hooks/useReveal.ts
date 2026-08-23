import { useEffect, useRef, useState } from 'react';

/** Mirrors the original RevealManager: IntersectionObserver-driven scroll reveal. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const reveal = () => setVisible(true);
            if ('scheduler' in window && typeof window.scheduler?.postTask === 'function') {
              window.scheduler.postTask(reveal, { priority: 'background' });
            } else {
              reveal();
            }
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}
