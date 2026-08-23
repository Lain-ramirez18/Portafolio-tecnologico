import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useToast } from '../contexts/ToastContext';
import { useLang } from '../i18n/LangContext';

/** Auto-updates the service worker and reloads, mirroring the original registerSW IIFE. */
export function PwaUpdater() {
  const { showToast } = useToast();
  const { lang } = useLang();
  const { needRefresh, updateServiceWorker } = useRegisterSW();
  const [refreshNeeded] = needRefresh;

  useEffect(() => {
    if (!refreshNeeded) return;
    showToast(lang === 'es' ? 'Actualizando la aplicación...' : 'Updating the app...');
    void updateServiceWorker(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshNeeded]);

  return null;
}
