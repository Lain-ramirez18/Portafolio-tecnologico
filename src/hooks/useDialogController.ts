import { useEffect, useRef } from 'react';
import { useSoundDesign } from '../contexts/SoundContext';

/** Wires a native <dialog> to open/close state: showModal()/close(), Escape/native-close sync,
 *  click-outside-the-panel-to-dismiss, and the open/close chime (mirrors every modal in the
 *  original main.js, which wired the same sounds per-button instead of once, centrally). */
export function useDialogController(isOpen: boolean, onClose: () => void) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const { sounds } = useSoundDesign();
  const wasOpen = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
      if (!wasOpen.current) sounds.modalOpen();
    }
    if (!isOpen && dialog.open) {
      dialog.close();
      sounds.modalClose();
    }
    wasOpen.current = isOpen;
  }, [isOpen, sounds]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onNativeClose = () => onClose();
    const onBackdropClick = (e: MouseEvent) => {
      const r = dialog.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) dialog.close();
    };

    dialog.addEventListener('close', onNativeClose);
    dialog.addEventListener('click', onBackdropClick);
    return () => {
      dialog.removeEventListener('close', onNativeClose);
      dialog.removeEventListener('click', onBackdropClick);
    };
  }, [onClose]);

  return dialogRef;
}
