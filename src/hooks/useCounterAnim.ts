import { useEffect, useState } from 'react';
import { useIntersectionOnce } from './useIntersectionOnce';

/** Animates 0 → target (with an optional suffix like "+") once the element scrolls into view. */
export function useCounterAnim<T extends HTMLElement>(target: number, suffix = '') {
  const { ref, inView } = useIntersectionOnce<T>(0.5);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const step = Math.max(1, Math.ceil(target / 25));
    const timer = setInterval(() => {
      setValue((prev) => {
        const next = prev + step;
        if (next >= target) {
          clearInterval(timer);
          return target;
        }
        return next;
      });
    }, 40);
    return () => clearInterval(timer);
  }, [inView, target]);

  return { ref, display: `${value}${suffix}` };
}
