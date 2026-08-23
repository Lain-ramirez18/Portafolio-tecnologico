import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

class Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  density: number;

  constructor(w: number, h: number) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.size = Math.random() * 1.5 + 0.5;
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = Math.random() * 30 + 1;
  }

  draw(ctx: CanvasRenderingContext2D, isDark: boolean) {
    ctx.fillStyle = isDark ? 'rgba(0, 229, 195, 0.8)' : 'rgba(0, 107, 97, 0.6)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }

  update(mouse: { x: number | null; y: number | null; radius: number }) {
    if (mouse.x != null && mouse.y != null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < mouse.radius) {
        const force = (mouse.radius - distance) / mouse.radius;
        this.x -= (dx / distance) * force * this.density;
        this.y -= (dy / distance) * force * this.density;
        return;
      }
    }
    if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 20;
    if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 20;
  }
}

/** Interactive particle background for the hero. Ports HeroCanvas, plus fixes the original's
 *  missing prefers-reduced-motion guard and its rAF loop never pausing off-screen/hidden. */
export function useHeroCanvas() {
  const heroRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    if (!hero || !canvas) return;
    if (window.innerWidth < 768) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    let rafId = 0;
    let paused = false;
    const mouse = { x: null as number | null, y: null as number | null, radius: 150 };

    function initParticles() {
      particles = [];
      const numParticles = Math.min((w * h) / 12000, 120);
      for (let i = 0; i < numParticles; i++) particles.push(new Particle(w, h));
    }

    function resize() {
      if (!canvas || !hero) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = hero.offsetHeight;
      initParticles();
    }

    function connect() {
      if (!ctx) return;
      const isDark = themeRef.current !== 'light';
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = dx * dx + dy * dy;
          if (distance < 15000) {
            const opacity = 1 - distance / 15000;
            ctx.strokeStyle = isDark
              ? `rgba(0, 229, 195, ${opacity * 0.2})`
              : `rgba(0, 107, 97, ${opacity * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      if (paused || !ctx) return;
      rafId = requestAnimationFrame(animate);
      const isDark = themeRef.current !== 'light';
      ctx.fillStyle = isDark ? '#0B0D12' : '#F2F3F8';
      ctx.fillRect(0, 0, w, h);

      for (const p of particles) {
        p.update(mouse);
        p.draw(ctx, isDark);
      }
      connect();
    }

    function start() {
      if (paused) return;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(animate);
    }

    const onResize = () => resize();
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    const onVisibilityChange = () => {
      paused = document.hidden;
      if (!paused) start();
      else cancelAnimationFrame(rafId);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        paused = !entry.isIntersecting;
        if (!paused) start();
        else cancelAnimationFrame(rafId);
      },
      { threshold: 0 },
    );

    window.addEventListener('resize', onResize);
    hero.addEventListener('mousemove', onMouseMove);
    hero.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('visibilitychange', onVisibilityChange);
    io.observe(hero);

    resize();
    start();

    return () => {
      window.removeEventListener('resize', onResize);
      hero.removeEventListener('mousemove', onMouseMove);
      hero.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      io.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return { heroRef, canvasRef };
}
