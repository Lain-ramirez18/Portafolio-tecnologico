import { useEffect, useRef, useState } from 'react';
import { useDialogController } from '../../hooks/useDialogController';
import { useDialogs } from '../../contexts/DialogsContext';
import { useLang } from '../../i18n/LangContext';

interface Cert {
  url: string | null;
  title: string;
  issuer: string;
}

/** Keyed by cert identity in the parent, so each new certificate remounts with fresh state —
 *  no reset-on-prop-change effect needed. */
function CertBody({ cert, isOpen }: { cert: Cert; isOpen: boolean }) {
  const { t } = useLang();
  const [loading, setLoading] = useState(true);
  const [noPdf, setNoPdf] = useState(!cert.url);
  const [iframeVisible, setIframeVisible] = useState(false);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!cert.url) return;
    fallbackTimer.current = setTimeout(() => {
      setLoading(false);
      setNoPdf(true);
    }, 10000);
    return () => {
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, [cert.url]);

  const onIframeLoad = () => {
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    setLoading(false);
    setIframeVisible(true);
  };

  return (
    <div className="cert-modal-iframe-wrap">
      {loading && (
        <div className="cert-modal-loading" id="cert-modal-loading" aria-label="Cargando certificado">
          <div className="cert-loader-ring" />
          <span>{t('cert.loading')}</span>
        </div>
      )}
      {cert.url && !noPdf && (
        <iframe
          id="cert-modal-iframe"
          className="cert-modal-iframe"
          title="Visor de Certificado"
          loading="lazy"
          aria-label="Documento de certificado"
          src={isOpen ? `${cert.url}#toolbar=0&view=FitH` : ''}
          style={{ opacity: iframeVisible ? 1 : 0, transition: 'opacity 0.4s' }}
          onLoad={onIframeLoad}
        />
      )}
      {noPdf && (
        <div className="cert-modal-no-pdf" id="cert-modal-no-pdf">
          <i className="fa-solid fa-certificate" aria-hidden="true" />
          <p>{t('cert.no_pdf')}</p>
          <a
            href="https://www.linkedin.com/in/lain-sthid-ramirez-rueda"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            <i className="fa-brands fa-linkedin" aria-hidden="true" /> LinkedIn
          </a>
        </div>
      )}
    </div>
  );
}

export function CertViewerDialog() {
  const { state, close } = useDialogs();
  const isOpen = state.name === 'cert';
  const dialogRef = useDialogController(isOpen, close);
  const { t } = useLang();
  const cert = state.name === 'cert' ? state.cert : null;

  return (
    <dialog id="cert-modal" className="cert-modal" aria-labelledby="cert-modal-title" aria-modal="true" ref={dialogRef}>
      <div className="cert-modal-content">
        <div className="cert-modal-header">
          <div className="cert-modal-meta">
            <span className="cert-modal-issuer" id="cert-modal-issuer">
              {cert?.issuer ?? 'Capacítate para el Empleo'}
            </span>
            <h3 id="cert-modal-title" className="cert-modal-title">
              {cert?.title ?? 'Certificado'}
            </h3>
          </div>
          <div className="cert-modal-actions">
            {cert?.url && (
              <a
                id="cert-modal-download"
                href={cert.url}
                download
                className="btn btn-primary btn-sm"
                aria-label="Descargar certificado"
              >
                <i className="fa-solid fa-download" aria-hidden="true" />
                <span>{t('cert.download')}</span>
              </a>
            )}
            <button id="cert-modal-close" className="cv-dialog-close" aria-label="Cerrar visor de certificado" onClick={close}>
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="cert-modal-body">{cert && <CertBody cert={cert} isOpen={isOpen} key={cert.url ?? cert.title} />}</div>
      </div>
    </dialog>
  );
}
