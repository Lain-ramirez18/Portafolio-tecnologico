/* ================================================================
   main.js v2 — Lain Sthid Ramirez Rueda Portfolio
   Nielsen 10 Heuristics | 2026 Gesture UX | MD3 Motion
================================================================ */

'use strict';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ══ Throttle utility — performance: limita llamadas en scroll ══ */
function throttle(fn, wait = 16) {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last >= wait) { last = now; fn.apply(this, args); }
  };
}

/* ══════════════ 1. THEME (Nielsen #1: Visibility) ══════════════ */
const ThemeManager = (() => {
  const KEY = 'lain-theme-v2';
  const html = document.documentElement;
  const btn  = $('#theme-toggle');
  const icon = $('#theme-icon-inner');

  const ICONS = {
    dark:  'fa-sun',
    light: 'fa-moon',
  };

  function get() {
    /* Dark is always the default — system preference is ignored on first visit */
    return localStorage.getItem(KEY) || 'dark';
  }

  function apply(t) {
    html.setAttribute('data-theme', t);
    if (icon) {
      icon.className = `fa-solid ${ICONS[t]}`;
    }
    localStorage.setItem(KEY, t);
  }

  function toggle() {
    apply(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  }

  return {
    init() {
      apply(get());
      btn?.addEventListener('click', toggle);
      /* No system-preference listener — dark is the brand default */
    }
  };
})();

/* ══════════════ 2. LANGUAGE ══════════════ */
const LangManager = (() => {
  const KEY = 'lain-lang-v2';
  const btn = $('#lang-toggle');

  function get() {
    return localStorage.getItem(KEY)
      || (navigator.language.startsWith('en') ? 'en' : 'es');
  }

  function apply(lang) {
    localStorage.setItem(KEY, lang);
    window.i18n.applyTranslations(lang);
  }

  return {
    init() {
      apply(get());
      btn?.addEventListener('click', () => {
        apply((localStorage.getItem(KEY) || 'es') === 'es' ? 'en' : 'es');
      });
    }
  };
})();

/* ══════════════ 3. SCROLL PROGRESS (Nielsen #1) ══════════════ */
const ScrollProgress = (() => {
  const bar = $('#scroll-progress');

  return {
    init() {
      if (!bar) return;
      window.addEventListener('scroll', throttle(() => {
        const max = document.body.scrollHeight - window.innerHeight;
        const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
        bar.style.width = `${pct}%`;
        bar.setAttribute('aria-valuenow', Math.round(pct));
      }, 32), { passive: true });
    }
  };
})();

/* ══════════════ 4. NAVBAR ══════════════ */
const NavManager = (() => {
  const navbar    = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks  = $('#nav-links');
  const links     = $$('.nav-link');
  const sections  = $$('section[id]');

  function highlight() {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 130) current = s.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
    });
  }

  function onScroll() {
    navbar?.classList.toggle('scrolled', window.scrollY > 40);
    highlight();
  }

  const onScrollThrottled = throttle(onScroll, 50);

  function closeMenu() {
    navLinks?.classList.remove('open');
    hamburger?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
  }

  return {
    init() {
      window.addEventListener('scroll', onScrollThrottled, { passive: true });
      onScroll();

      /* Desktop-only: hamburger hidden on mobile (bottom bar handles nav) */
      if (hamburger && window.getComputedStyle(hamburger).display !== 'none') {
        hamburger.addEventListener('click', () => {
          const open = navLinks.classList.toggle('open');
          hamburger.classList.toggle('open', open);
          hamburger.setAttribute('aria-expanded', open);
        });
        links.forEach(l => l.addEventListener('click', closeMenu));
        document.addEventListener('click', e => {
          if (navLinks?.classList.contains('open')
              && !navLinks.contains(e.target)
              && !hamburger.contains(e.target)) {
            closeMenu();
          }
        });
      }
    }
  };
})();

/* ══════════════ 5. BOTTOM BAR ACTIVE STATE ══════════════ */
const BottomBar = (() => {
  const items    = $$('.bb-item');
  const sections = $$('section[id]');

  return {
    init() {
      if (!items.length) return;

      window.addEventListener('scroll', throttle(() => {
        let current = 'hero';
        sections.forEach(s => {
          if (window.scrollY >= s.offsetTop - 140) current = s.id;
        });
        items.forEach(item => {
          item.classList.toggle('active', item.getAttribute('href') === `#${current}`);
        });
      }, 50), { passive: true });
    }
  };
})();

/* ══════════════ 6. SCROLL REVEAL (Nielsen #6: Recognition) ══════════════ */
const RevealManager = (() => {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        /* Use scheduler if available (Chrome 115+) for non-urgent reveals */
        const reveal = () => {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        };
        if ('scheduler' in window && 'postTask' in window.scheduler) {
          window.scheduler.postTask(reveal, { priority: 'background' });
        } else {
          reveal();
        }
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  return {
    init() { $$('.reveal').forEach(el => obs.observe(el)); }
  };
})();

/* ══════════════ 7. SKILL BARS ══════════════ */
const SkillBars = (() => {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('animate');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });

  return {
    init() { $$('.skill-fill').forEach(el => obs.observe(el)); }
  };
})();

/* ══ 8. CUSTOM CURSOR (desktop) ══ */
const CustomCursor = (() => {
  const cursor   = $('#cursor');
  const follower = $('#cursor-follower');
  let fx = 0, fy = 0;
  let cx = 0, cy = 0;
  let rafId;
  let running = false;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function loop() {
    cx = lerp(cx, fx, 0.38);
    cy = lerp(cy, fy, 0.38);
    if (follower) {
      follower.style.left = `${cx}px`;
      follower.style.top  = `${cy}px`;
    }
    /* Stop the loop when follower has converged — saves CPU when cursor is idle */
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

  return {
    init() {
      if (!cursor || !follower) return;
      if (!window.matchMedia('(hover: hover) and (min-width: 1024px)').matches) return;

      document.addEventListener('mousemove', e => {
        fx = e.clientX;
        fy = e.clientY;
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top  = `${e.clientY}px`;
        startLoop();
      }, { passive: true });

      // Magnetic effect on interactive elements
      $$('a, button, .project-card, .contact-link-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
          cursor?.classList.add('cursor--hover');
          follower?.classList.add('cursor--hover');
        });
        el.addEventListener('mouseleave', () => {
          cursor?.classList.remove('cursor--hover');
          follower?.classList.remove('cursor--hover');
        });
      });

      // Pause cursor animation when tab is hidden
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) { cancelAnimationFrame(rafId); running = false; }
      });
    },
    destroy() { cancelAnimationFrame(rafId); running = false; }
  };
})();

/* ══════════════ 9. UNIVERSAL 3D CARD TILT (PRO MAX) ══════════════ */
const CardTilt = (() => {
  return {
    init() {
      if (!window.matchMedia('(hover: hover)').matches) return;
      
      const cards = $$('.profile-card, .project-card, .about-card, .cert-item-card');
      
      cards.forEach(card => {
        let raf;
        card.addEventListener('mousemove', e => {
          const r  = card.getBoundingClientRect();
          const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
          const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
          
          const isProfile = card.classList.contains('profile-card');
          const maxRotate = isProfile ? 12 : 5;
          
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            card.style.transition = 'none';
            card.style.transform = `perspective(1000px) rotateY(${dx * maxRotate}deg) rotateX(${-dy * maxRotate}deg) translateY(-4px) scale(1.02)`;
            card.style.zIndex = '10';
            
            const glow = $('.project-card-glow', card);
            if (glow) {
              glow.style.left = `${e.clientX - r.left - 100}px`;
              glow.style.top  = `${e.clientY - r.top  - 100}px`;
            }
          });
        });

        card.addEventListener('mouseleave', () => {
          cancelAnimationFrame(raf);
          card.style.transition = 'transform 0.6s var(--ease-out)';
          card.style.transform = '';
          card.style.zIndex = '';
        });
      });
    }
  };
})();

/* ══════════════ 10. HERO INTERACTIVE 3D CANVAS (PRO MAX) ══════════════ */
const HeroCanvas = (() => {
  return {
    init() {
      const hero = $('#hero');
      if (!hero || window.innerWidth < 768) return; // Only desktop/tablet for performance
      
      const canvas = document.createElement('canvas');
      canvas.className = 'hero-canvas-bg';
      canvas.style.position = 'absolute';
      canvas.style.inset = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.zIndex = '0';
      canvas.style.pointerEvents = 'none';
      
      const grid = $('.hero-bg-grid');
      if (grid) hero.insertBefore(canvas, grid);
      else hero.appendChild(canvas);
      
      const ctx = canvas.getContext('2d', { alpha: false });
      let w, h, particles = [];
      const mouse = { x: null, y: null, radius: 150 };
      
      const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';
      
      function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = hero.offsetHeight;
        initParticles();
      }
      
      class Particle {
        constructor() {
          this.x = Math.random() * w;
          this.y = Math.random() * h;
          this.size = Math.random() * 1.5 + 0.5;
          this.baseX = this.x;
          this.baseY = this.y;
          this.density = (Math.random() * 30) + 1;
        }
        draw() {
          ctx.fillStyle = isDark() ? 'rgba(0, 229, 195, 0.8)' : 'rgba(0, 107, 97, 0.6)';
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fill();
        }
        update() {
          if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
              let force = (mouse.radius - distance) / mouse.radius;
              this.x -= (dx / distance) * force * this.density;
              this.y -= (dy / distance) * force * this.density;
            } else {
              if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 20;
              if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 20;
            }
          } else {
            if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 20;
            if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 20;
          }
        }
      }
      
      function initParticles() {
        particles = [];
        const numParticles = Math.min((w * h) / 12000, 120); 
        for (let i = 0; i < numParticles; i++) particles.push(new Particle());
      }
      
      function connect() {
        for (let a = 0; a < particles.length; a++) {
          for (let b = a; b < particles.length; b++) {
            let dx = particles[a].x - particles[b].x;
            let dy = particles[a].y - particles[b].y;
            let distance = dx * dx + dy * dy;
            if (distance < 15000) {
              let opacity = 1 - (distance / 15000);
              ctx.strokeStyle = isDark() ? `rgba(0, 229, 195, ${opacity * 0.2})` : `rgba(0, 107, 97, ${opacity * 0.15})`;
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
        requestAnimationFrame(animate);
        ctx.fillStyle = isDark() ? '#0B0D12' : '#F2F3F8';
        ctx.fillRect(0, 0, w, h);
        
        for (let i = 0; i < particles.length; i++) {
          particles[i].update();
          particles[i].draw();
        }
        connect();
      }
      
      window.addEventListener('resize', resize);
      hero.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });
      hero.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
      
      resize();
      animate();
    }
  };
})();

/* ══════════════ 12. SMOOTH SCROLL ══════════════ */
const SmoothScroll = (() => ({
  init() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const t = $(a.getAttribute('href'));
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }
}))();

/* ══════════════ 13. BACK TO TOP ══════════════ */
const BackToTop = (() => {
  const btn = $('#back-to-top');
  return {
    init() {
      if (!btn) return;
      window.addEventListener('scroll', throttle(() => {
        btn.classList.toggle('visible', window.scrollY > 400);
      }, 100), { passive: true });
      btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
  };
})();

/* ══════════════ 14. KEYBOARD ACCESSIBILITY (Nielsen #6) ══════════════ */
function initA11y() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const nl = $('#nav-links');
      const hb = $('#hamburger');
      if (nl?.classList.contains('open')) {
        nl.classList.remove('open');
        hb?.classList.remove('open');
        hb?.setAttribute('aria-expanded', 'false');
        hb?.focus();
      }
    }
  });

  // Announce route changes for screen readers (Nielsen #1)
  const live = document.createElement('div');
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('aria-atomic', 'true');
  live.className = 'sr-only';
  live.id = 'live-region';
  document.body.appendChild(live);

  // Populate live region when navigating between sections
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', () => {
      const href = a.getAttribute('href');
      const target = $(href);
      if (target) {
        const title = target.querySelector('.section-title, .hero-title');
        if (title) {
          live.textContent = title.textContent;
        }
      }
    });
  });
}

/* ══════════════ 15. FOOTER YEAR ══════════════ */
function setYear() {
  const el = $('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ══════════════ SECURITY — External link hardening ══════════════ */
(function lockExternalLinks() {
  /* Ensure all external links have rel="noopener noreferrer"
     even if added dynamically — defense-in-depth */
  document.querySelectorAll('a[target="_blank"]').forEach(a => {
    const rel = (a.getAttribute('rel') || '').split(' ').filter(Boolean);
    if (!rel.includes('noopener'))  rel.push('noopener');
    if (!rel.includes('noreferrer')) rel.push('noreferrer');
    a.setAttribute('rel', rel.join(' '));
  });

  /* Clickjacking defense: if somehow framed, break out */
  if (window.top !== window.self) {
    try { window.top.location = window.self.location; } catch(e) { /* cross-origin */ }
  }
})();

/* ══════════════ 19. SMART PREFETCHING (PREDICTIVE CACHE) ══════════════ */
const SmartPrefetch = (() => {
  const preconnected = new Set();
  const prefetched = new Set();

  function preconnect(url) {
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
    } catch (e) {}
  }

  function prefetch(url) {
    if (prefetched.has(url)) return;
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
    prefetched.add(url);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const url = entry.target.href;
        if (url) preconnect(url);
        // Desobservamos tras pre-conectar para ahorrar CPU y memoria
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '50px' });

  return {
    init() {
      // Evitar prefetch en dispositivos con conexiones lentas o ahorro de datos
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection && (connection.saveData || connection.effectiveType?.includes('2g'))) {
        return;
      }

      const links = document.querySelectorAll('a[href^="http"]');
      
      links.forEach(link => {
        // 1. Preconnect asíncrono al hacer scroll (cuando el link es visible)
        observer.observe(link);
        
        // 2. Prefetch ultra-rápido al hacer hover (intención clara de clic)
        link.addEventListener('mouseenter', () => prefetch(link.href), { once: true });
        link.addEventListener('touchstart', () => prefetch(link.href), { once: true, passive: true });
      });
    }
  };
})();

/* ══════════════ SERVICE WORKER — PWA & Offline Cache ══════════════ */
(function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(reg => {
          // PRO MAX: Chequeo automático de actualizaciones al volver a la pestaña
          document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
              reg.update();
            }
          });

          /* Background sync of new SW version */
          reg.addEventListener('updatefound', () => {
            const newSW = reg.installing;
            newSW?.addEventListener('statechange', () => {
              if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                console.info('[SW] Nueva versión disponible. Recargando automáticamente...');
                if (window.ToastManager) {
                  window.ToastManager.show('Actualizando la aplicación...', 3000);
                }
              }
            });
          });
        })
        .catch(() => { /* SW no crítico — falla silenciosamente */ });

      /* Auto-refresh cuando el nuevo SW toma el control (skipWaiting disparado en sw.js) */
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  }
})();

/* ══════════════ 16. TOAST MANAGER ══════════════ */
const ToastManager = (() => {
  let container;
  return {
    init: () => {
      container = $('#toast-container');
    },
    show: (msg) => {
      if (!container) return;
      /* Security: use textContent — never innerHTML with dynamic data */
      const toast = document.createElement('div');
      toast.className = 'toast';
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-circle-check';
      icon.setAttribute('aria-hidden', 'true');
      const text = document.createElement('span');
      text.textContent = msg;
      toast.appendChild(icon);
      toast.appendChild(document.createTextNode(' '));
      toast.appendChild(text);
      container.appendChild(toast);
      
      setTimeout(() => {
        toast.classList.add('hiding');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
      }, 3000);
    }
  };
})();

/* ══════════════ 17. CV MODAL ══════════════ */
const CVDialog = (() => {
  const btn = $('#btn-download-cv');
  const dialog = $('#cv-dialog');
  const closeBtn = $('#cv-dialog-close');
  const langBtns = $$('.cv-lang-btn');

  return {
    init() {
      if (!btn || !dialog) return;
      
      btn.addEventListener('click', () => {
        dialog.showModal();
        btn.setAttribute('aria-expanded', 'true');
      });
      
      closeBtn.addEventListener('click', () => {
        dialog.close();
        btn.setAttribute('aria-expanded', 'false');
      });
      
      dialog.addEventListener('click', (e) => {
        const dialogDimensions = dialog.getBoundingClientRect();
        if (
          e.clientX < dialogDimensions.left || e.clientX > dialogDimensions.right ||
          e.clientY < dialogDimensions.top || e.clientY > dialogDimensions.bottom
        ) {
          dialog.close();
          btn.setAttribute('aria-expanded', 'false');
        }
      });
      
      langBtns.forEach(b => {
        b.addEventListener('click', () => {
          setTimeout(() => {
            dialog.close();
            btn.setAttribute('aria-expanded', 'false');
            const isEs = document.documentElement.lang === 'es';
            ToastManager.show(isEs ? '¡CV descargado exitosamente!' : 'CV downloaded successfully!');
          }, 150);
        });
      });
    }
  };
})();

/* ══════════════ 18. CONTACT FORM ══════════════ */
// Este módulo maneja el formulario de contacto dual:
//   - Botón "Enviar Email" → Envía a FormSubmit.co → llega a tu Gmail
//   - Botón "WhatsApp"     → Abre WhatsApp con el mensaje prellenado
const ContactForm = (() => {

  // URL de FormSubmit con tu correo real. 
  // Nota: la primera vez debes activarlo haciendo clic en el correo de verificación que te mandan.
  const FORMSUBMIT_URL = 'https://formsubmit.co/ajax/lainramirez18@gmail.com';

  // Tu número de WhatsApp en formato internacional (sin + ni espacios)
  const WA_NUMBER = '573209735859';

  // Muestra el banner de estado dentro del formulario (no el Toast global)
  function setStatus(type, message) {
    const statusEl = $('#form-status');
    if (!statusEl) return;
    statusEl.className = `form-status form-status--${type}`;
    statusEl.innerHTML = message;
    statusEl.hidden = false;
    // Auto-ocultar después de 6 segundos
    setTimeout(() => { statusEl.hidden = true; }, 6000);
  }

  // Valida el formulario manualmente para poder dar feedback preciso
  function validateForm(form) {
    const name = form.querySelector('#cf-name');
    const email = form.querySelector('#cf-email');
    const message = form.querySelector('#cf-message');

    if (!name.value.trim()) {
      name.focus();
      setStatus('error', '<i class="fa-solid fa-circle-exclamation"></i> Por favor ingresa tu nombre.');
      return false;
    }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.focus();
      setStatus('error', '<i class="fa-solid fa-circle-exclamation"></i> Ingresa un correo electrónico válido.');
      return false;
    }
    if (!message.value.trim() || message.value.trim().length < 10) {
      message.focus();
      setStatus('error', '<i class="fa-solid fa-circle-exclamation"></i> Escribe un mensaje de al menos 10 caracteres.');
      return false;
    }
    return true;
  }

  return {
    init: () => {
      const form = $('#contact-form');
      if (!form) return;

      const btnWa = $('#btn-whatsapp-form');
      const btnSubmit = $('#btn-email-submit');

      // ── Enviar por EMAIL ──────────────────────────────────────────
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateForm(form)) return;

        const originalHtml = btnSubmit.innerHTML;
        btnSubmit.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Enviando...';
        btnSubmit.disabled = true;

        try {
          const formData = new FormData(form);
          const response = await fetch(FORMSUBMIT_URL, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
          });

          if (response.ok) {
            // ¡ÉXITO! Mostrar mensaje de confirmación claro
            setStatus('success',
              '<i class="fa-solid fa-circle-check"></i> <strong>¡Mensaje enviado!</strong> Te responderé pronto a tu correo.'
            );
            ToastManager.show('¡Email enviado exitosamente! 📧');
            form.reset();
          } else {
            // El servidor respondió con error (por ejemplo, correo no activado aún)
            const data = await response.json().catch(() => ({}));
            const hint = data?.message?.includes('not activated')
              ? 'Activa el formulario desde el correo de FormSubmit que llegó a tu Gmail.'
              : 'Intenta de nuevo o usa el botón de WhatsApp.';
            setStatus('error', `<i class="fa-solid fa-circle-exclamation"></i> Error al enviar. ${hint}`);
          }
        } catch (err) {
          // Error de red
          setStatus('error',
            '<i class="fa-solid fa-wifi"></i> Sin conexión. Prueba el botón de WhatsApp.'
          );
        } finally {
          btnSubmit.innerHTML = originalHtml;
          btnSubmit.disabled = false;
        }
      });

      // ── Enviar por WHATSAPP ───────────────────────────────────────
      // Toma los datos del formulario y pre-llena el mensaje en WhatsApp
      if (btnWa) {
        btnWa.addEventListener('click', () => {
          const name    = ($('#cf-name')?.value.trim())    || 'Un visitante';
          const email   = ($('#cf-email')?.value.trim())   || '';
          const message = ($('#cf-message')?.value.trim()) || 'Quiero contactarme contigo.';

          // Construye el mensaje personalizado
          const text = `Hola Lain 👋, soy *${name}*${email ? ` (${email})` : ''}.\n\n${message}`;
          const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

          window.open(waUrl, '_blank', 'noopener,noreferrer');
          ToastManager.show('¡Abriendo WhatsApp! 📱');
        });
      }
    }
  };
})();

/* ══════════════ 20. COPY TO CLIPBOARD ══════════════ */
const CopyManager = (() => {
  return {
    init() {
      $$('.clc-copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const text = btn.getAttribute('data-copy');
          if (!text) return;

          navigator.clipboard.writeText(text).then(() => {
            const isEs = (localStorage.getItem('lain-lang-v2') || 'es') === 'es';
            const isEmail = text.includes('@');
            const msg = isEmail
              ? (isEs ? '¡Correo copiado al portapapeles! 📋' : 'Email copied to clipboard! 📋')
              : (isEs ? '¡WhatsApp copiado al portapapeles! 📋' : 'WhatsApp copied to clipboard! 📋');
            ToastManager.show(msg);
          }).catch(() => {
            ToastManager.show('Error al copiar al portapapeles');
          });
        });
      });
    }
  };
})();

/* ══════════════ 21. SKILL FILTER MANAGER ══════════════ */
const SkillsFilterManager = (() => {
  return {
    init() {
      const filterBtns = $$('.skill-filter-btn');
      const categories = $$('[data-category]');

      if (!filterBtns.length) return;

      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const filter = btn.getAttribute('data-filter');

          categories.forEach(cat => {
            const catType = cat.getAttribute('data-category');
            if (filter === 'all' || filter === catType) {
              cat.classList.remove('filtered-out');
            } else {
              cat.classList.add('filtered-out');
            }
          });
        });
      });
    }
  };
})();

/* ══════════════ 22. AI TERMINAL CLI ══════════════ */
const AITerminal = (() => {
  const dialog = $('#terminal-dialog');
  const openBtn = $('#btn-open-terminal');
  const closeBtn = $('#terminal-dialog-close');
  const form = $('#terminal-form');
  const input = $('#terminal-input');
  const output = $('#terminal-output');

  const commands = {
    help: () => 'Comandos disponibles: bio, stack, projects, contact, ai, clear, date, whoami, exit',
    bio: () => 'Lain Sthid Ramirez Rueda | Analista & Dev SENA. Especialista en IA, Python, Elicitación de Requisitos y UI/UX.',
    stack: () => 'Frontend: HTML5, CSS3 (MD3), JS ES6+\nBackend: Python, Git/GitHub, Docker\nIA: Subagentes IA, Claude, Groq/LLaMA, Gemini, Prompt Engineering',
    projects: () => '1. APPFOCUS CORE v3.0 (Offline Productivity Terminal)\n2. ProAssist (Bilingual LLaMA 3.3-70B + Groq AI Chatbot)\n3. Próximo Proyecto (AI Autonomous Subagents Sandbox)',
    contact: () => 'WhatsApp: +57 3209735859\nEmail: lainramirez18@gmail.com\nLinkedIn: lain-sthid-ramirez-rueda\nGitHub: Lain-ramirez18',
    ai: () => '🤖 AI Sub-Agent Status: Online (Groq + LLaMA 3.3-70B API connected). Ready for prompt orchestration.',
    date: () => `Fecha actual: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
    whoami: () => 'visitor@lsrr-portfolio-guest'
  };

  function appendLine(userText, cmdText) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    if (userText) {
      line.innerHTML = `<span class="prompt-user">visitor@lsrr-agent</span>:<span class="prompt-path">~</span>$&nbsp;<span class="prompt-cmd">${escapeHtml(userText)}</span>`;
    }
    output.appendChild(line);

    if (cmdText) {
      const respLine = document.createElement('div');
      respLine.className = 'terminal-line response';
      respLine.style.color = '#7ee787';
      respLine.innerHTML = escapeHtml(cmdText).replace(/\n/g, '<br/>');
      output.appendChild(respLine);
    }

    output.scrollTop = output.scrollHeight;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  return {
    init() {
      if (!dialog || !openBtn) return;

      openBtn.addEventListener('click', () => {
        dialog.showModal();
        openBtn.setAttribute('aria-expanded', 'true');
        setTimeout(() => input?.focus(), 100);
      });

      closeBtn?.addEventListener('click', () => {
        dialog.close();
        openBtn.setAttribute('aria-expanded', 'false');
      });

      dialog.addEventListener('click', (e) => {
        const r = dialog.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
          dialog.close();
          openBtn.setAttribute('aria-expanded', 'false');
        }
      });

      form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = input.value.trim().toLowerCase();
        if (!val) return;

        input.value = '';

        if (val === 'clear') {
          output.innerHTML = '';
          return;
        }

        if (val === 'exit') {
          dialog.close();
          openBtn.setAttribute('aria-expanded', 'false');
          return;
        }

        const handler = commands[val];
        if (handler) {
          appendLine(val, handler());
        } else {
          appendLine(val, `Comando no reconocido: "${val}". Escribe "help" para ver la lista de comandos.`);
        }
      });
    }
  };
})();

/* ══════════════ 23. PROJECT DETAILS MODAL ══════════════ */
const ProjectDetailModal = (() => {
  const dialog = $('#project-modal');
  const title = $('#project-modal-title');
  const body = $('#project-modal-body');
  const closeBtn = $('#project-modal-close');

  const projectData = {
    appfocus: {
      title: 'APPFOCUS CORE v3.0 — Deep Work Terminal',
      content: `
        <div class="project-modal-section">
          <span class="project-modal-section-title">Resumen del Proyecto</span>
          <p>APPFOCUS es una terminal de productividad de alto rendimiento concebida bajo los principios de la metodología Deep Work de Cal Newport. Su propósito es eliminar fricciones cognitivas durante sesiones de trabajo concentrado.</p>
        </div>
        <div class="project-modal-section">
          <span class="project-modal-section-title">Aspectos Técnicos Clave</span>
          <ul>
            <li>• <strong>Arquitectura 100% Offline-First:</strong> Sin dependencias de red externas ni rastreadores. Todos los datos permanecen locales.</li>
            <li>• <strong>Algoritmo de Foco Dinámico:</strong> Ajuste automático de bloques de trabajo e intervalos de descanso según ritmo circadiano.</li>
            <li>• <strong>Estética Minimalista:</strong> UI construida con Tailwind CSS y Vanilla JavaScript altamente optimizado.</li>
          </ul>
        </div>
        <div class="project-cta-group">
          <a href="https://github.com/Lain-ramirez18/APPFOCUS" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
            <i class="fa-brands fa-github"></i> Repositorio GitHub
          </a>
        </div>
      `
    },
    proassist: {
      title: 'ProAssist — AI Productivity Chatbot',
      content: `
        <div class="project-modal-section">
          <span class="project-modal-section-title">Resumen del Proyecto</span>
          <p>ProAssist es un asistente conversacional bilingüe diseñado para responder consultas complejas, automatizar tareas y actuar como un compañero inteligente de desarrollo en tiempo real.</p>
        </div>
        <div class="project-modal-section">
          <span class="project-modal-section-title">Arquitectura Tecnológica</span>
          <ul>
            <li>• <strong>Motor de IA:</strong> Impulsado por LLaMA 3.3-70B ejecutado sobre Groq LPU (Language Processing Unit) API, alcanzando velocidades de generación superiores a 300 tokens/segundo.</li>
            <li>• <strong>Infraestructura:</strong> Aplicación Python contenerizada en un contenedor Docker optimizado y desplegada en Render.</li>
            <li>• <strong>Soporte Bilingüe:</strong> Detección y respuesta automática en español e inglés sin pérdida de contexto.</li>
          </ul>
        </div>
        <div class="project-cta-group">
          <a href="https://proassist-r1q6.onrender.com" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Demo en Vivo (Render)
          </a>
          <a href="https://github.com/Lain-ramirez18/proassist" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-sm">
            <i class="fa-brands fa-github"></i> Código en GitHub
          </a>
        </div>
      `
    },
    upcoming: {
      title: 'Próximo Proyecto — Sandbox de Subagentes de IA',
      content: `
        <div class="project-modal-section">
          <span class="project-modal-section-title">En Desarrollo</span>
          <p>Actualmente me encuentro construyendo un ecosistema de subagentes autónomos de IA integrados con canal de orquestación en Python. Este proyecto busca automatizar flujos complejos de elicitar requisitos, análisis de datos y generación de documentación técnica.</p>
        </div>
        <div class="project-cta-group">
          <a href="https://github.com/Lain-ramirez18" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
            <i class="fa-brands fa-github"></i> Perfil de GitHub
          </a>
        </div>
      `
    }
  };

  return {
    init() {
      if (!dialog) return;

      $$('.btn-project-detail').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-project');
          const data = projectData[key];
          if (!data) return;

          title.textContent = data.title;
          body.innerHTML = data.content;

          dialog.showModal();
        });
      });

      closeBtn?.addEventListener('click', () => dialog.close());

      dialog.addEventListener('click', (e) => {
        const r = dialog.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
          dialog.close();
        }
      });
    }
  };
})();

/* ══════════════ 24. STAT COUNTER ANIMATION ══════════════ */
const CounterAnim = (() => {
  return {
    init() {
      const stats = $$('.stat-number[data-counter]');
      if (!stats.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const targetVal = parseInt(el.getAttribute('data-counter'), 10);
            if (isNaN(targetVal)) return;

            let current = 0;
            const step = Math.max(1, Math.ceil(targetVal / 25));
            const timer = setInterval(() => {
              current += step;
              if (current >= targetVal) {
                current = targetVal;
                clearInterval(timer);
              }
              if (el.textContent.includes('+')) {
                el.textContent = `${current}+`;
              } else if (el.textContent.includes('AI')) {
                el.textContent = 'AI';
              } else if (el.textContent.includes('UX')) {
                el.textContent = 'UX';
              } else {
                el.textContent = current;
              }
            }, 40);

            observer.unobserve(el);
          }
        });
      }, { threshold: 0.5 });

      stats.forEach(s => observer.observe(s));
    }
  };
})();

/* ══════════════ 25. CERTIFICATE VIEWER MODAL ══════════════ */
const CertViewer = (() => {
  const dialog   = $('#cert-modal');
  const iframeEl = $('#cert-modal-iframe');
  const loading  = $('#cert-modal-loading');
  const noPdf    = $('#cert-modal-no-pdf');
  const titleEl  = $('#cert-modal-title');
  const issuerEl = $('#cert-modal-issuer');
  const dlBtn    = $('#cert-modal-download');
  const closeBtn = $('#cert-modal-close');

  function open(certUrl, certTitle, certIssuer) {
    if (!dialog) return;

    titleEl.textContent  = certTitle  || 'Certificado';
    issuerEl.textContent = certIssuer || '';

    // Reset state
    iframeEl.src = '';
    iframeEl.style.opacity = '0';
    loading?.classList.remove('hidden');
    noPdf?.setAttribute('hidden', '');

    if (certUrl) {
      dlBtn.href = certUrl;
      dlBtn.removeAttribute('hidden');

      iframeEl.src = certUrl + '#toolbar=0&view=FitH';

      /* Hide loader on iframe load */
      const onLoad = () => {
        loading?.classList.add('hidden');
        iframeEl.style.opacity = '1';
        iframeEl.removeEventListener('load', onLoad);
      };
      iframeEl.addEventListener('load', onLoad);

      /* Fallback: if iframe doesn't load in 10s (e.g., PDF blocked), show no-pdf */
      const fallbackTimer = setTimeout(() => {
        if (!loading?.classList.contains('hidden')) {
          loading?.classList.add('hidden');
          iframeEl.style.display = 'none';
          noPdf?.removeAttribute('hidden');
        }
      }, 10000);
      iframeEl.addEventListener('load', () => clearTimeout(fallbackTimer), { once: true });

    } else {
      /* No PDF available — show LinkedIn fallback */
      dlBtn.setAttribute('hidden', '');
      loading?.classList.add('hidden');
      noPdf?.removeAttribute('hidden');
    }

    dialog.showModal();
  }

  return {
    init() {
      if (!dialog) return;

      /* Bind all .btn-view-cert buttons */
      $$('.btn-view-cert').forEach(btn => {
        btn.addEventListener('click', () => {
          const url    = btn.getAttribute('data-cert-url')   || '';
          const title  = btn.getAttribute('data-cert-title') || 'Certificado';
          const issuer = btn.getAttribute('data-cert-issuer')|| '';
          open(url, title, issuer);
        });
      });

      closeBtn?.addEventListener('click', () => {
        dialog.close();
        /* Stop iframe to free resources */
        iframeEl.src = '';
      });

      /* Close on backdrop click */
      dialog.addEventListener('click', (e) => {
        const r = dialog.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right ||
            e.clientY < r.top  || e.clientY > r.bottom) {
          dialog.close();
          iframeEl.src = '';
        }
      });

      /* Transition iframe opacity */
      iframeEl.style.transition = 'opacity 0.4s';
    }
  };
})();

/* ══════════════ 26. LIVE DEMO PREVIEW MODAL ══════════════ */
const LiveDemoModal = (() => {
  const dialog     = $('#demo-modal');
  const iframeEl   = $('#demo-iframe');
  const loading    = $('#demo-loading');
  const urlDisplay = $('#demo-url-display');
  const openExt    = $('#demo-open-external');
  const closeBtn   = $('#demo-modal-close');

  let loadTimeout = null;

  function open(demoUrl, demoTitle) {
    if (!dialog) return;

    /* On mobile < 520px, open external to avoid bad iframe UX */
    if (window.innerWidth < 520) {
      window.open(demoUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (urlDisplay) urlDisplay.textContent = demoUrl;
    if (openExt) openExt.href = demoUrl;

    /* Reset state — inject src ONLY on open (lazy) */
    iframeEl.src = '';
    iframeEl.style.opacity = '0';
    loading?.classList.remove('hidden');

    dialog.showModal();

    /* Small delay before injecting src to let dialog paint first */
    setTimeout(() => {
      iframeEl.src = demoUrl;
    }, 80);

    const onLoad = () => {
      if (loadTimeout) clearTimeout(loadTimeout);
      loading?.classList.add('hidden');
      iframeEl.style.opacity = '1';
    };
    iframeEl.addEventListener('load', onLoad, { once: true });

    /* Render containers can take up to 60s to cold-start */
    loadTimeout = setTimeout(() => {
      loading?.classList.add('hidden');
      iframeEl.style.opacity = '1';
    }, 60000);
  }

  function close() {
    if (!dialog) return;
    if (loadTimeout) clearTimeout(loadTimeout);
    iframeEl.src = ''; /* free resource */
    dialog.close();
  }

  return {
    init() {
      if (!dialog) return;

      iframeEl.style.transition = 'opacity 0.5s';

      $$('.btn-project-demo').forEach(btn => {
        btn.addEventListener('click', () => {
          const url   = btn.getAttribute('data-demo-url')   || '';
          const title = btn.getAttribute('data-demo-title') || 'Demo';
          open(url, title);
        });
      });

      closeBtn?.addEventListener('click', close);

      dialog.addEventListener('click', (e) => {
        const r = dialog.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right ||
            e.clientY < r.top  || e.clientY > r.bottom) {
          close();
        }
      });
    }
  };
})();

/* ══════════════ 27. NETWORK STATUS BADGE ══════════════ */
const NetworkStatus = (() => {
  const badge   = $('#network-status-badge');
  const led     = badge?.querySelector('.net-led');
  const text    = badge?.querySelector('.net-text');

  const lang = () => localStorage.getItem('lain-lang-v2') || 'es';

  const LABELS = {
    online:  { es: 'PWA En Línea',          en: 'PWA Online' },
    offline: { es: 'Modo Offline (PWA v3)', en: 'Offline Mode (PWA v3)' },
    restored:{ es: 'Conexión restablecida', en: 'Connection restored' },
  };

  function update(isOnline) {
    if (!badge) return;
    const l = lang();
    if (isOnline) {
      badge.classList.remove('offline');
      badge.classList.add('online');
      if (text) text.textContent = LABELS.online[l];
    } else {
      badge.classList.remove('online');
      badge.classList.add('offline');
      if (text) text.textContent = LABELS.offline[l];
      ToastManager.show(l === 'es'
        ? '📶 Sin conexión — portafolio PWA activo'
        : '📶 Offline — PWA portfolio active');
    }
  }

  return {
    init() {
      if (!badge) return;
      /* Set initial state immediately */
      update(navigator.onLine);

      window.addEventListener('online', () => {
        update(true);
        const l = lang();
        ToastManager.show(LABELS.restored[l]);
      });

      window.addEventListener('offline', () => update(false));
    }
  };
})();

/* ══════════════ 28. SOUND DESIGN (Web Audio API) ══════════════ */
const SoundDesign = (() => {
  const KEY   = 'lain-sound-enabled';
  const btn   = $('#sound-toggle');
  const icon  = $('#sound-icon');

  let ctx = null;
  let enabled = false;

  /* Lazy-init AudioContext on first user gesture */
  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* Generic tone generator: freq Hz, duration ms, type waveform, vol 0-1 */
  function tone(freq, duration = 80, type = 'sine', vol = 0.08, freqEnd = null) {
    if (!enabled) return;
    try {
      const c = getCtx();
      const osc  = c.createOscillator();
      const gain = c.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, c.currentTime);
      if (freqEnd !== null) {
        osc.frequency.linearRampToValueAtTime(freqEnd, c.currentTime + duration / 1000);
      }

      gain.gain.setValueAtTime(vol, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration / 1000);

      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + duration / 1000);
    } catch (_) { /* AudioContext unavailable — silent fail */ }
  }

  /* Named sound presets */
  const sounds = {
    click:      () => tone(400, 50,  'sine',     0.06, 300),
    modalOpen:  () => tone(300, 120, 'sine',     0.07, 480),
    modalClose: () => tone(480, 100, 'sine',     0.05, 260),
    toast:      () => tone(520, 90,  'triangle', 0.05, 600),
    terminal:   () => tone(550, 30,  'square',   0.04),
    themeToggle:() => tone(360, 140, 'sine',     0.06, 520),
    copy:       () => { tone(440, 60, 'sine', 0.05); setTimeout(() => tone(660, 60, 'sine', 0.04), 70); },
  };

  function setEnabled(val) {
    enabled = val;
    localStorage.setItem(KEY, val ? '1' : '0');
    if (btn) {
      btn.setAttribute('aria-pressed', val ? 'true' : 'false');
    }
    if (icon) {
      icon.className = val ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
    }
    if (val) sounds.click();
  }

  return {
    sounds,
    init() {
      /* Default: off (respect user preference) */
      const stored = localStorage.getItem(KEY);
      setEnabled(stored === '1');

      btn?.addEventListener('click', () => {
        setEnabled(!enabled);
      });

      /* Hook into existing interactive elements */
      /* Theme toggle */
      $('#theme-toggle')?.addEventListener('click', () => sounds.themeToggle());

      /* Modal opens — Terminal */
      $('#btn-open-terminal')?.addEventListener('click', () => sounds.modalOpen());
      $('#terminal-dialog-close')?.addEventListener('click', () => sounds.modalClose());

      /* Modal opens — CV */
      $('#btn-download-cv')?.addEventListener('click', () => sounds.modalOpen());
      $('#cv-dialog-close')?.addEventListener('click', () => sounds.modalClose());

      /* Cert modal */
      document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-view-cert')) sounds.modalOpen();
      });

      /* Demo modal */
      document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-project-demo')) sounds.modalOpen();
      });

      /* Copy buttons — after clipboard write */
      document.addEventListener('click', (e) => {
        if (e.target.closest('.clc-copy-btn')) {
          setTimeout(() => sounds.copy(), 100);
        }
      });

      /* Terminal typing */
      $('#terminal-input')?.addEventListener('keydown', () => {
        if (enabled) tone(600, 18, 'square', 0.025);
      });

      /* Project detail buttons */
      document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-project-detail')) sounds.modalOpen();
      });

      /* Toast hook — ToastManager calls ToastManager.show() already; we hook it via a proxy */
      const origShow = ToastManager.show.bind(ToastManager);
      ToastManager.show = (msg) => {
        origShow(msg);
        sounds.toast();
      };
    }
  };
})();

/* ══════════════ BOOT ══════════════ */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  LangManager.init();
  ScrollProgress.init();
  NavManager.init();
  BottomBar.init();
  RevealManager.init();
  SkillBars.init();
  CustomCursor.init();
  CardTilt.init();
  HeroCanvas.init();
  SmoothScroll.init();
  BackToTop.init();
  ToastManager.init();
  CVDialog.init();
  ContactForm.init();
  SmartPrefetch.init();
  CopyManager.init();
  SkillsFilterManager.init();
  AITerminal.init();
  ProjectDetailModal.init();
  CounterAnim.init();
  CertViewer.init();
  LiveDemoModal.init();
  NetworkStatus.init();
  SoundDesign.init();
  initA11y();
  setYear();

  document.body.classList.add('js-loaded');
});


