import { useLang } from '../../i18n/LangContext';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useSoundDesign } from '../../contexts/SoundContext';

export function Footer() {
  const { t } = useLang();
  const { isOnline, label } = useNetworkStatus();
  const { enabled, toggleEnabled } = useSoundDesign();

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-inner">
          <p className="footer-copy">
            <span>{t('footer.built')}</span> <span className="footer-name">Lain Sthid Ramirez Rueda</span>
          </p>
          <p className="footer-year">© <span id="footer-year">{new Date().getFullYear()}</span></p>

          <div
            id="network-status-badge"
            className={`network-badge ${isOnline ? 'online' : 'offline'}`}
            role="status"
            aria-live="polite"
            aria-label="Estado de conexión"
          >
            <span className="net-led" aria-hidden="true" />
            <span className="net-text">{label}</span>
          </div>

          <button
            id="sound-toggle"
            className="sound-toggle"
            aria-label="Activar o silenciar efectos de sonido"
            title="Efectos de sonido"
            aria-pressed={enabled}
            onClick={toggleEnabled}
          >
            <i className={`fa-solid ${enabled ? 'fa-volume-high' : 'fa-volume-xmark'}`} aria-hidden="true" id="sound-icon" />
          </button>
        </div>
      </div>
    </footer>
  );
}
