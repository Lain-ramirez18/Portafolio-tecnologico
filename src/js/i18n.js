/* ================================================================
   i18n.js v2 — Traducciones ES / EN
   Lain Sthid Ramirez Rueda — Portfolio
================================================================ */

const translations = {
  es: {
    "nav.about":    "Sobre mí",
    "nav.skills":   "Habilidades",
    "nav.projects": "Proyectos",
    "nav.contact":  "Contacto",
    "nav.skip":     "Saltar al contenido",

    "hero.available":    "Disponible para colaborar",
    "hero.role":         "Analista y Desarrollador\nde Software",
    "hero.role_short":   "Analista & Dev",
    "hero.subtitle":     "Transformando lógica compleja en interfaces fluidas. Especialista en elicitación de requisitos, automatización inteligente con IA y desarrollo web.",
    "hero.cta_primary":  "Ver mis proyectos",
    "hero.cta_secondary":"Conectemos",
    "hero.stat_projects":"Proyectos",
    "hero.stat_ai":      "Powered",
    "hero.scroll":       "desliza",
    "hero.download_cv":  "Descargar CV",

    "aria.lang_toggle":  "Cambiar idioma",
    "aria.theme_toggle": "Alternar modo oscuro/claro",
    "cv.dialog_title":   "Elige el idioma del CV",
    "cv.close_dialog":   "Cerrar modal",

    "about.label":      "Sobre mí",
    "about.title":      "Diseñador de\nexperiencias digitales.",
    "about.p1":         "Soy Analista y Desarrollador de Software en formación en el SENA, con un enfoque profundo en la elicitación de requisitos y el diseño de interfaces de alto impacto. Actualmente me encuentro en proceso de aprendizaje de arquitecturas Full-Stack, combinando frontend moderno con lógica de backend robusta. Mi objetivo es siempre equilibrar robustez técnica con experiencias de usuario impecables, creando soluciones que no solo funcionen bien, sino que deleiten visualmente a cada usuario que interactúe con ellas.",
    "about.p2":         "Me apasiona la inteligencia artificial y la automatización de procesos. Trabajo activamente con subagentes de IA, prompt engineering avanzado y herramientas de vanguardia como Claude, Groq, Gemini y GPT para construir soluciones que realmente marcan la diferencia. Creo firmemente que la IA generativa está transformando la manera en que desarrollamos software, y me esfuerzo por estar siempre a la vanguardia de estas tecnologías emergentes.",
    "about.p3":         "Soy un aprendiz constante por naturaleza. Cada proyecto es una oportunidad para innovar, resolver problemas complejos y elevar el estándar de lo que es posible con tecnología. Mi metodología combina investigación rigurosa, diseño centrado en el usuario y desarrollo ágil para entregar productos digitales de la más alta calidad.",
    "about.p4":         "Además de mis habilidades técnicas, valoro profundamente la colaboración interdisciplinaria y la comunicación efectiva con equipos de trabajo. Mi experiencia en elicitación de requisitos me ha enseñado la importancia de escuchar activamente las necesidades del cliente y traducirlas en especificaciones técnicas claras y ejecutables.",
    "about.tag1":       "Arquitecto Digital",
    "about.tag2":       "AI Specialist",
    "about.tag3":       "En proceso · Full-Stack",
    "about.tag4":       "UI/UX Design",
    "about.tag5":       "Open Source",
    "about.edu_title":  "Educación",
    "about.edu_desc":   "Tecnología en Análisis y Desarrollo de Software — SENA",
    "about.edu_status": "En curso · 2027",
    "about.cert_title": "Certificaciones & Diplomados",
    "about.cert1_title": "Desarrollador Front-End",
    "about.cert1_issuer": "Capacítate para el Empleo",
    "about.cert1_type": "📜 Certificación",
    "about.cert2_title": "Certificación IA",
    "about.cert2_issuer": "Anthropic",
    "about.cert2_type": "📜 Certificación",
    "about.cert3_title": "Fundamentos de Full Stack",
    "about.cert3_issuer": "Capacítate para el Empleo",
    "about.cert3_type": "🎓 Diplomado",
    "about.lang_title": "Idiomas",
    "about.lang_desc":  "Español — Nativo &nbsp;|&nbsp; Inglés — En proceso",

    "skills.label":     "Stack Tecnológico",
    "skills.title":     "Herramientas & Tecnologías",
    "skills.cat1":      "Frontend & UI",
    "skills.cat2":      "Backend & Scripting",
    "skills.cat3":      "IA & Automatización",
    "skills.cat4":      "Herramientas & Entorno",
    "skills.soft_title":"Habilidades Blandas",
    "soft.1":  "Elicitación de Requisitos",
    "soft.2":  "Resolución de Problemas",
    "soft.3":  "Aprendizaje Acelerado",
    "soft.4":  "Trabajo en Equipo",
    "soft.5":  "Adaptabilidad",
    "soft.6":  "Redacción Técnica",
    "soft.7":  "Atención al Detalle",
    "soft.8":  "Comunicación Efectiva",

    "projects.label":        "Proyectos",
    "projects.title":        "Lo que he construido",
    "proj.appfocus.desc":    "Terminal de productividad de alto rendimiento basado en la metodología Deep Work. Algoritmo de eficiencia dinámica, arquitectura 100% offline y experiencia sin distracciones para maximizar el foco cognitivo.",
    "proj.proassist.desc":   "Asistente inteligente bilingüe impulsado por LLaMA 3.3-70B y Groq API. Chatbot de productividad sin límites, contenerizado con Docker y desplegado en Render. Responde consultas complejas en tiempo real.",
    "proj.upcoming_badge":   "En Desarrollo",
    "proj.upcoming.title":   "Próximo Proyecto",
    "proj.upcoming.desc":    "Algo emocionante está en camino. Sígueme en GitHub para estar al día con los últimos builds y experimentos.",
    "proj.follow_github":    "Seguir en GitHub",

    "contact.label":   "Contacto",
    "contact.title":   "Transformemos ideas\nen soluciones.",
    "contact.desc":    "¿Buscas un desarrollador integral comprometido con la calidad y la innovación constante? Ya sea que tengas un proyecto, una oportunidad o simplemente quieras conectar — mi línea siempre está abierta.",
    "contact.cta":     "Contáctame ahora",
    "contact.wa_sub":  "Mensaje directo",
    "contact.li_sub":  "Red profesional",
    "contact.gh_sub":  "Ver mi código",
    "contact.form_name": "Tu Nombre",
    "contact.form_email": "Tu Email",
    "contact.form_msg": "Mensaje",
    "contact.form_send": "Enviar Mensaje",

    "footer.built":    "Diseñado y construido por",

    "bb.home":    "Inicio",
    "bb.about":   "Sobre mí",
    "bb.skills":  "Skills",
    "bb.projects":"Proyectos",
    "bb.contact": "Contacto",
  },

  en: {
    "nav.about":    "About",
    "nav.skills":   "Skills",
    "nav.projects": "Projects",
    "nav.contact":  "Contact",
    "nav.skip":     "Skip to main content",

    "hero.available":    "Available for collaboration",
    "hero.role":         "Software Analyst\n& Developer",
    "hero.role_short":   "Analyst & Dev",
    "hero.subtitle":     "Turning complex logic into fluid interfaces. Specialist in requirements elicitation, AI automation, and web development.",
    "hero.cta_primary":  "View my projects",
    "hero.cta_secondary":"Let's connect",
    "hero.stat_projects":"Projects",
    "hero.stat_ai":      "Powered",
    "hero.scroll":       "scroll",
    "hero.download_cv":  "Download CV",

    "aria.lang_toggle":  "Change language",
    "aria.theme_toggle": "Toggle dark/light mode",
    "cv.dialog_title":   "Choose CV language",
    "cv.close_dialog":   "Close modal",

    "about.label":      "About Me",
    "about.title":      "Architect of\ndigital experiences.",
    "about.p1":         "I'm a Software Analyst & Developer studying at SENA, with a deep focus on requirements elicitation and high-impact interface design. I'm currently in the process of learning Full-Stack architectures, combining modern frontend with robust backend logic. My goal is always to balance technical robustness with impeccable user experiences, creating solutions that not only work well but visually delight every user who interacts with them.",
    "about.p2":         "I'm passionate about artificial intelligence and process automation. I actively work with AI sub-agents, advanced prompt engineering, and cutting-edge tools like Claude, Groq, Gemini, and GPT to build solutions that truly make a difference. I firmly believe that generative AI is transforming the way we develop software, and I strive to always be at the forefront of these emerging technologies.",
    "about.p3":         "I'm a constant learner by nature. Every project is an opportunity to innovate, solve complex problems, and raise the bar for what's possible with technology. My methodology combines rigorous research, user-centered design, and agile development to deliver digital products of the highest quality.",
    "about.p4":         "Beyond my technical skills, I deeply value interdisciplinary collaboration and effective communication with teams. My experience in requirements elicitation has taught me the importance of actively listening to client needs and translating them into clear, actionable technical specifications.",
    "about.tag1":       "Digital Architect",
    "about.tag2":       "AI Specialist",
    "about.tag3":       "In Progress · Full-Stack",
    "about.tag4":       "UI/UX Design",
    "about.tag5":       "Open Source",
    "about.edu_title":  "Education",
    "about.edu_desc":   "Technologist in Analysis & Development of Software — SENA",
    "about.edu_status": "In Progress · 2027",
    "about.cert_title": "Certifications & Diplomas",
    "about.cert1_title": "Front-End Developer",
    "about.cert1_issuer": "Capacítate para el Empleo",
    "about.cert1_type": "📜 Certification",
    "about.cert2_title": "AI Certification",
    "about.cert2_issuer": "Anthropic",
    "about.cert2_type": "📜 Certification",
    "about.cert3_title": "Full Stack Foundations",
    "about.cert3_issuer": "Capacítate para el Empleo",
    "about.cert3_type": "🎓 Diploma",
    "about.lang_title": "Languages",
    "about.lang_desc":  "Spanish — Native &nbsp;|&nbsp; English — In progress",

    "skills.label":     "Tech Stack",
    "skills.title":     "Tools & Technologies",
    "skills.cat1":      "Frontend & UI",
    "skills.cat2":      "Backend & Scripting",
    "skills.cat3":      "AI & Automation",
    "skills.cat4":      "Tools & Environment",
    "skills.soft_title":"Soft Skills",
    "soft.1":  "Requirements Elicitation",
    "soft.2":  "Problem Solving",
    "soft.3":  "Accelerated Learning",
    "soft.4":  "Team Collaboration",
    "soft.5":  "Adaptability",
    "soft.6":  "Technical Writing",
    "soft.7":  "Attention to Detail",
    "soft.8":  "Effective Communication",

    "projects.label":        "Projects",
    "projects.title":        "What I've Built",
    "proj.appfocus.desc":    "High-performance productivity terminal based on the Deep Work methodology. Dynamic efficiency algorithm, 100% offline architecture, and distraction-free experience to maximize cognitive focus.",
    "proj.proassist.desc":   "Bilingual intelligent assistant powered by LLaMA 3.3-70B and Groq API. Unlimited productivity chatbot containerized with Docker and deployed on Render. Handles complex queries in real time.",
    "proj.upcoming_badge":   "In Development",
    "proj.upcoming.title":   "Next Project",
    "proj.upcoming.desc":    "Something exciting is in the works. Follow my GitHub to stay up to date with the latest builds and experiments.",
    "proj.follow_github":    "Follow on GitHub",

    "contact.label":   "Contact",
    "contact.title":   "Let's turn ideas\ninto solutions.",
    "contact.desc":    "Looking for a well-rounded developer committed to quality and constant innovation? Whether you have a project, an opportunity, or just want to connect — my line is always open.",
    "contact.cta":     "Contact me now",
    "contact.wa_sub":  "Direct message",
    "contact.li_sub":  "Professional network",
    "contact.gh_sub":  "See my code",
    "contact.form_name": "Your Name",
    "contact.form_email": "Your Email",
    "contact.form_msg": "Message",
    "contact.form_send": "Send Message",

    "footer.built":    "Designed & built by",

    "bb.home":    "Home",
    "bb.about":   "About",
    "bb.skills":  "Skills",
    "bb.projects":"Projects",
    "bb.contact": "Contact",
  }
};

function applyTranslations(lang) {
  const dict = translations[lang] || translations.es;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = dict[key];
    if (!value) return;
    if (value.includes('&') || value.includes('<') || value.includes('\n')) {
      el.innerHTML = value.replace(/\n/g, '<br/>');
    } else {
      el.textContent = value;
    }
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    const value = dict[key];
    if (value) el.setAttribute('aria-label', value);
  });

  // Update HTML lang and data-lang attributes
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('data-lang', lang);

  // Update document title for SEO
  document.title = lang === 'es'
    ? 'Lain Sthid Ramirez Rueda | Analista y Desarrollador de Software'
    : 'Lain Sthid Ramirez Rueda | Software Analyst & Developer';

  // Update meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', lang === 'es'
      ? 'Lain Sthid Ramirez Rueda — Analista y Desarrollador de Software. Especialista en IA, Python, UI/UX y elicitación de requisitos. Disponible para proyectos.'
      : 'Lain Sthid Ramirez Rueda — Software Analyst & Developer. Specialist in AI, Python, UI/UX and requirements elicitation. Available for projects.');
  }

  const label = document.getElementById('lang-label');
  if (label) label.textContent = lang === 'es' ? 'EN' : 'ES';
}

window.i18n = { translations, applyTranslations };
