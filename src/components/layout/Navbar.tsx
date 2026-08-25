import { useActiveSection, useNavbarScrolled } from '../../hooks/useActiveSection';
import { useLang } from '../../i18n/LangContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSoundDesign } from '../../contexts/SoundContext';
import { announceSection } from '../../utils/announce';

const NAV_LINKS: { href: string; key: 'nav.about' | 'nav.skills' | 'nav.projects' | 'nav.contact' }[] = [
  { href: '#about', key: 'nav.about' },
  { href: '#skills', key: 'nav.skills' },
  { href: '#projects', key: 'nav.projects' },
  { href: '#contact', key: 'nav.contact' },
];

export function Navbar() {
  const active = useActiveSection(130);
  const scrolled = useNavbarScrolled(40);
  const { lang, t, toggleLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { sounds } = useSoundDesign();

  return (
    <header className={`navbar${scrolled ? ' scrolled' : ''}`} role="banner" id="navbar">
      <nav className="nav-inner" aria-label="Navegación principal">
        <a href="#hero" className="nav-logo" aria-label="LSRR — Lain Sthid Ramirez Rueda, Inicio">
          <span className="logo-bracket">[</span>LSRR<span className="logo-bracket">]</span>
        </a>

        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- VoiceOver drops list semantics once `list-style: none` is applied; role="list" restores them */}
        <ul className="nav-links" role="list" id="nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`nav-link${active === link.href.slice(1) ? ' active' : ''}`}
                onClick={() => announceSection(link.href)}
              >
                {t(link.key)}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-controls">
          <button
            className="lang-toggle"
            id="lang-toggle"
            aria-label={`${lang === 'es' ? 'EN' : 'ES'} — ${t('aria.lang_toggle')}`}
            onClick={toggleLang}
          >
            <span id="lang-label">{lang === 'es' ? 'EN' : 'ES'}</span>
          </button>
          <button
            className="theme-toggle"
            id="theme-toggle"
            aria-label={t('aria.theme_toggle')}
            onClick={() => {
              toggleTheme();
              sounds.themeToggle();
            }}
          >
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} aria-hidden="true" id="theme-icon-inner" />
          </button>
        </div>
      </nav>
    </header>
  );
}
