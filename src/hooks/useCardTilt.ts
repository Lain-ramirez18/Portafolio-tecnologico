import { useEffect } from 'react';

/** 3D tilt-on-hover for profile/project/about/cert cards. Runs once after mount, like the
 *  original CardTilt module — now also skipped under prefers-reduced-motion. */
export function useCardTilt() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = document.querySelectorAll<HTMLElement>(
      '.profile-card, .project-card, .about-card, .cert-item-card',
    );
    const cleanups: Array<() => void> = [];

    cards.forEach((card) => {
      let raf = 0;

      const onMouseMove = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);

        const isProfile = card.classList.contains('profile-card');
        const maxRotate = isProfile ? 12 : 5;

        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transition = 'none';
          card.style.transform = `perspective(1000px) rotateY(${dx * maxRotate}deg) rotateX(${-dy * maxRotate}deg) translateY(-4px) scale(1.02)`;
          card.style.zIndex = '10';

          const glow = card.querySelector<HTMLElement>('.project-card-glow');
          if (glow) {
            glow.style.left = `${e.clientX - r.left - 100}px`;
            glow.style.top = `${e.clientY - r.top - 100}px`;
          }
        });
      };

      const onMouseLeave = () => {
        cancelAnimationFrame(raf);
        card.style.transition = 'transform 0.6s var(--ease-out)';
        card.style.transform = '';
        card.style.zIndex = '';
      };

      card.addEventListener('mousemove', onMouseMove);
      card.addEventListener('mouseleave', onMouseLeave);
      cleanups.push(() => {
        card.removeEventListener('mousemove', onMouseMove);
        card.removeEventListener('mouseleave', onMouseLeave);
        cancelAnimationFrame(raf);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);
}
