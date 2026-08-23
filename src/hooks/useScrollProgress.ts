import { useEffect, useState } from 'react';
import { throttle } from '../utils/throttle';

export function useScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = throttle(() => {
      const max = document.body.scrollHeight - window.innerHeight;
      setPct(max > 0 ? (window.scrollY / max) * 100 : 0);
    }, 32);

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return pct;
}
