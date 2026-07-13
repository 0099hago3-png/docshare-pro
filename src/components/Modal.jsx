import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function Modal({
  open,
  onClose,
  title,
  children,
  width = 620,
  className = '',
  bodyClassName = '',
}) {
  if (!open) return null;

  const content = (
    <div
      className="modal-backdrop modal-backdrop--portal-v64"
      onMouseDown={onClose}
    >
      <section
        className={`modal-card botanical-card ${className}`.trim()}
        style={{ maxWidth: width }}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="modal-card__header">
          <h2>{title}</h2>

          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={19} />
          </button>
        </header>

        <div className={`modal-card__body ${bodyClassName}`.trim()}>
          {children}
        </div>
      </section>
    </div>
  );

  return createPortal(content, document.body);
}
