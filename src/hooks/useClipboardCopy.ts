import { useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useSoundDesign } from '../contexts/SoundContext';
import { useLang } from '../i18n/LangContext';

export function useClipboardCopy() {
  const { showToast } = useToast();
  const { sounds } = useSoundDesign();
  const { lang } = useLang();

  return useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        const isEmail = text.includes('@');
        const msg = isEmail
          ? lang === 'es'
            ? '¡Correo copiado al portapapeles! 📋'
            : 'Email copied to clipboard! 📋'
          : lang === 'es'
            ? '¡WhatsApp copiado al portapapeles! 📋'
            : 'WhatsApp copied to clipboard! 📋';
        showToast(msg);
        setTimeout(() => sounds.copy(), 100);
      } catch {
        showToast('Error al copiar al portapapeles');
      }
    },
    [showToast, sounds, lang],
  );
}
