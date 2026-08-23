import { useEffect, useRef } from 'react';

/** Desktop-only decorative cursor (dot + lagging ring). Ports CustomCursor 1:1, plus a
 *  prefers-reduced-motion guard the original was missing. */
export function useCustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const followerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;
    if (!window.matchMedia('(hover: hover) and (min-width: 1024px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let fx = 0;
    let fy = 0;
    let cx = 0;
    let cy = 0;
    let rafId = 0;
    let running = false;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    function loop() {
      cx = lerp(cx, fx, 0.38);
      cy = lerp(cy, fy, 0.38);
      if (follower) {
        follower.style.left = `${cx}px`;
        follower.style.top = `${cy}px`;
      }
      if (Math.abs(cx - fx) < 0.5 && Math.abs(cy - fy) < 0.5) {
        running = false;
        return;
      }
      rafId = requestAnimationFrame(loop);
    }

    function startLoop() {
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(loop);
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      fx = e.clientX;
      fy = e.clientY;
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      startLoop();
    };
    document.addEventListener('mousemove', onMouseMove, { passive: true });

    const interactiveEls = document.querySelectorAll('a, button, .project-card, .contact-link-card');
    const onEnter = () => {
      cursor.classList.add('cursor--hover');
      follower.classList.add('cursor--hover');
    };
    const onLeave = () => {
      cursor.classList.remove('cursor--hover');
      follower.classList.remove('cursor--hover');
    };
    interactiveEls.forEach((el) => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        running = false;
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('visibilitychange', onVisibility);
      interactiveEls.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
      cancelAnimationFrame(rafId);
    };
  }, []);

  return { cursorRef, followerRef };
}
