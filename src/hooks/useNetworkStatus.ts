import { useEffect, useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useLang } from '../i18n/LangContext';

const LABELS = {
  online: { es: 'PWA En Línea', en: 'PWA Online' },
  offline: { es: 'Modo Offline (PWA v3)', en: 'Offline Mode (PWA v3)' },
  restored: { es: 'Conexión restablecida', en: 'Connection restored' },
} as const;

export function useNetworkStatus() {
  // `window` (unlike `navigator`) never exists in Node, even with its newer partial Web API
  // globals — a reliable SSR gate. Assume online during SSR/build: there's no real connectivity
  // state to report, and defaulting to the "offline" badge would bake a false status into the
  // static HTML every crawler and first-paint visitor sees.
  const [isOnline, setIsOnline] = useState(() => (typeof window !== 'undefined' ? navigator.onLine : true));
  const { showToast } = useToast();
  const { lang } = useLang();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast(LABELS.restored[lang]);
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast(lang === 'es' ? '📶 Sin conexión — portafolio PWA activo' : '📶 Offline — PWA portfolio active');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast, lang]);

  return { isOnline, label: isOnline ? LABELS.online[lang] : LABELS.offline[lang] };
}
