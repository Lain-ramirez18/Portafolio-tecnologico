import { useToast } from '../../contexts/ToastContext';

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  return (
    <div id="toast-container" className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast${toast.hiding ? ' hiding' : ''}`}
          onAnimationEnd={() => {
            if (toast.hiding) dismissToast(toast.id);
          }}
        >
          <i className="fa-solid fa-circle-check" aria-hidden="true" />
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
