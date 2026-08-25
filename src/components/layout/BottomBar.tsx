import { useActiveSection } from '../../hooks/useActiveSection';
import { useLang } from '../../i18n/LangContext';
import { announceSection } from '../../utils/announce';

const ITEMS: { href: string; icon: string; key: 'bb.home' | 'bb.about' | 'bb.skills' | 'bb.projects' | 'bb.contact' }[] = [
  { href: '#hero', icon: 'fa-solid fa-house', key: 'bb.home' },
  { href: '#about', icon: 'fa-solid fa-user', key: 'bb.about' },
  { href: '#skills', icon: 'fa-solid fa-code', key: 'bb.skills' },
  { href: '#projects', icon: 'fa-solid fa-folder-open', key: 'bb.projects' },
  { href: '#contact', icon: 'fa-solid fa-paper-plane', key: 'bb.contact' },
];

export function BottomBar() {
  const active = useActiveSection(140);
  const { t } = useLang();

  return (
    <nav className="bottom-bar" id="bottom-bar" aria-label="Navegación rápida">
      {ITEMS.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={`bb-item${active === item.href.slice(1) ? ' active' : ''}`}
          aria-label={t(item.key)}
          onClick={() => announceSection(item.href)}
        >
          <i className={item.icon} aria-hidden="true" />
          <span>{t(item.key)}</span>
        </a>
      ))}
    </nav>
  );
}
