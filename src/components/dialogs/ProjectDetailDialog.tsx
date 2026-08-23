import { useDialogController } from '../../hooks/useDialogController';
import { useDialogs } from '../../contexts/DialogsContext';
import { projects } from '../../data/projects';

export function ProjectDetailDialog() {
  const { state, close } = useDialogs();
  const isOpen = state.name === 'project';
  const dialogRef = useDialogController(isOpen, close);
  const project = state.name === 'project' ? projects.find((p) => p.id === state.projectId) : undefined;

  return (
    <dialog id="project-modal" className="project-modal" aria-labelledby="project-modal-title" aria-modal="true" ref={dialogRef}>
      <div className="project-modal-content">
        <div className="project-modal-header">
          <h3 id="project-modal-title" className="project-modal-title">
            {project?.detail.title ?? 'Detalles del Proyecto'}
          </h3>
          <button id="project-modal-close" className="cv-dialog-close" aria-label="Cerrar modal" onClick={close}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="project-modal-body" id="project-modal-body">
          {project?.detail.blocks.map((block, i) => (
            <div className="project-modal-section" key={i}>
              <span className="project-modal-section-title">{block.title}</span>
              {block.type === 'paragraph' ? (
                <p>{block.text}</p>
              ) : (
                <ul>
                  {block.items.map((item) => (
                    <li key={item.label}>
                      • <strong>{item.label}</strong> {item.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {project && (
            <div className="project-cta-group">
              {project.detail.links.map((link) => (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn btn-${link.variant} btn-sm`}
                  key={link.href}
                >
                  <i className={link.icon} /> {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
