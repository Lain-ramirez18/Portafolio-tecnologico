import { useDialogController } from '../../hooks/useDialogController';
import { useDialogs } from '../../contexts/DialogsContext';
import { useLang } from '../../i18n/LangContext';
import { useToast } from '../../contexts/ToastContext';

export function CvDialog() {
  const { state, close } = useDialogs();
  const isOpen = state.name === 'cv';
  const dialogRef = useDialogController(isOpen, close);
  const { t, lang } = useLang();
  const { showToast } = useToast();

  const onDownload = () => {
    setTimeout(() => {
      close();
      showToast(lang === 'es' ? '¡CV descargado exitosamente!' : 'CV downloaded successfully!');
    }, 150);
  };

  return (
    <dialog id="cv-dialog" className="cv-dialog" aria-labelledby="cv-dialog-title" aria-modal="true" ref={dialogRef}>
      <div className="cv-dialog-content">
        <div className="cv-dialog-header">
          <h3 id="cv-dialog-title">{t('cv.dialog_title')}</h3>
          <button id="cv-dialog-close" className="cv-dialog-close" aria-label="Cerrar modal" onClick={close}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="cv-dialog-body">
          <a
            href="/assets/docs/CV_Lain_Ramirez_ES.pdf"
            target="_blank"
            download
            id="cv-es-btn"
            className="btn btn-primary cv-lang-btn"
            onClick={onDownload}
          >
            <span>🇪🇸 Español</span>
          </a>
          <a
            href="/assets/docs/CV_Lain_Ramirez_EN.pdf"
            target="_blank"
            download
            id="cv-en-btn"
            className="btn btn-primary cv-lang-btn"
            onClick={onDownload}
          >
            <span>🇺🇸 English</span>
          </a>
        </div>
      </div>
    </dialog>
  );
}
