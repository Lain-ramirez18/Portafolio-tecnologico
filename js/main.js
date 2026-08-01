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
  initA11y();
  setYear();

  document.body.classList.add('js-loaded');
});
