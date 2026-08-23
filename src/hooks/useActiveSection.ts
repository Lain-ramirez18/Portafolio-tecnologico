import { useEffect, useState } from 'react';
import { throttle } from '../utils/throttle';

/** Highlights the section currently in view, mirroring NavManager/BottomBar's scroll logic. */
export function useActiveSection(offset: number, throttleMs = 50) {
  const [active, setActive] = useState('hero');

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('section[id]'));

    const onScroll = throttle(() => {
      let current = 'hero';
      for (const s of sections) {
        if (window.scrollY >= s.offsetTop - offset) current = s.id;
      }
      setActive(current);
    }, throttleMs);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset, throttleMs]);

  return active;
}

export function useNavbarScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = throttle(() => setScrolled(window.scrollY > threshold), 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}
