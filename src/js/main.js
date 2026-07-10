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

/* ══════════════ 8. CUSTOM CURSOR (desktop) ══════════════ */
const CustomCursor = (() => {
  const cursor   = $('#cursor');
  const follower = $('#cursor-follower');
  let fx = 0, fy = 0;
  let cx = 0, cy = 0;
  let rafId;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function loop() {
    cx = lerp(cx, fx, 0.38);
    cy = lerp(cy, fy, 0.38);
    if (follower) {
      follower.style.left = `${cx}px`;
      follower.style.top  = `${cy}px`;
    }
    rafId = requestAnimationFrame(loop);
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

      loop();

      // Pause cursor animation when tab is hidden to save resources
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) { cancelAnimationFrame(rafId); }
        else { loop(); }
      });
    },
    destroy() { cancelAnimationFrame(rafId); }
  };
})();

/* ══════════════ 9. CARD TILT — Antigravity ══════════════ */
const CardTilt = (() => {
  const card = $('#profile-card');
  let raf;

  return {
    init() {
      if (!card || !window.matchMedia('(hover: hover)').matches) return;

      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
        const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform = `perspective(900px) rotateY(${dx*10}deg) rotateX(${-dy*8}deg) translateY(-16px) scale(1.02)`;
        });
      });

      card.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        card.style.transform = '';
      });
    }
  };
})();

/* ══════════════ 10. HERO PARALLAX ══════════════ */
const HeroParallax = (() => {
  const o1 = $('.orb-1');
  const o2 = $('.orb-2');
  const o3 = $('.orb-3');
  let raf;

  return {
    init() {
      if (!window.matchMedia('(hover: hover) and (min-width: 768px)').matches) return;

      document.addEventListener('mousemove', e => {
        const xR = e.clientX / window.innerWidth  - 0.5;
        const yR = e.clientY / window.innerHeight - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          if (o1) o1.style.transform = `translate(${xR * -32}px, ${yR * -22}px)`;
          if (o2) o2.style.transform = `translate(${xR * 24}px, ${yR * 18}px)`;
          if (o3) o3.style.transform = `translate(${xR * 14}px, ${yR * -10}px)`;
        });
      }, { passive: true });
    }
  };
})();

/* ══════════════ 11. PROJECT CARD MOUSE GLOW ══════════════ */
const ProjectGlow = (() => ({
  init() {
    $$('.project-card:not(.project-card--upcoming)').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const glow = $('.project-card-glow', card);
        if (glow) {
          glow.style.left = `${e.clientX - r.left - 100}px`;
          glow.style.top  = `${e.clientY - r.top  - 100}px`;
        }
      });
    });
  }
}))();

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

/* SwipeNav removed — free scrolling on mobile is correct UX */


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

/* ══════════════ PERFORMANCE — Resource hints injected at runtime ══════════════ */
(function injectPerfHints() {
  /* Prefetch next likely navigation targets after page is idle */
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      ['https://github.com/Lain-ramirez18', 'https://proassist-r1q6.onrender.com']
        .forEach(href => {
          const link = document.createElement('link');
          link.rel  = 'prefetch';
          link.href = href;
          document.head.appendChild(link);
        });
    }, { timeout: 3000 });
  }
})();

/* ══════════════ SERVICE WORKER — PWA & Offline Cache ══════════════ */
(function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(reg => {
          /* Background sync of new SW version */
          reg.addEventListener('updatefound', () => {
            const newSW = reg.installing;
            newSW?.addEventListener('statechange', () => {
              if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                console.info('[SW] Nueva versión disponible. Recarga para actualizar.');
              }
            });
          });
        })
        .catch(() => { /* SW no crítico — falla silenciosamente */ });
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
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${msg}</span>`;
      container.appendChild(toast);
      
      setTimeout(() => {
        toast.classList.add('hiding');
        toast.addEventListener('animationend', () => toast.remove());
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
const ContactForm = (() => {
  return {
    init: () => {
      const form = $('#contact-form');
      if (!form) return;

      const btnWhatsApp = $('#btn-whatsapp');
      
      // Enviar a FormSubmit.co
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('.form-submit-btn');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>`;
        btn.style.pointerEvents = 'none';

        try {
          const formData = new FormData(form);
          const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
          });
          
          if (response.ok) {
            ToastManager.show("¡Mensaje enviado por Email! 🚀");
            form.reset();
          } else {
            ToastManager.show("Error de servicio. Intenta el botón de WhatsApp.");
          }
        } catch (error) {
          ToastManager.show("Error de red. Intenta el botón de WhatsApp.");
        } finally {
          btn.innerHTML = originalText;
          btn.style.pointerEvents = 'auto';
        }
      });

      // Enviar por WhatsApp
      if (btnWhatsApp) {
        btnWhatsApp.addEventListener('click', () => {
          const name = $('#name').value.trim() || 'Un visitante';
          const msg = $('#message').value.trim() || 'Quiero contactarme contigo.';
          const waUrl = `https://wa.me/573209735859?text=Hola Lain, soy ${encodeURIComponent(name)}. ${encodeURIComponent(msg)}`;
          window.open(waUrl, '_blank');
          ToastManager.show("¡Redirigiendo a WhatsApp! 📱");
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
  HeroParallax.init();
  ProjectGlow.init();
  SmoothScroll.init();
  BackToTop.init();
  ToastManager.init();
  CVDialog.init();
  ContactForm.init();
  initA11y();
  setYear();

  document.body.classList.add('js-loaded');
});
