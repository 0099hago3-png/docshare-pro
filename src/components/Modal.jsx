import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, width = 620 }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="modal-card botanical-card"
        style={{ maxWidth: width }}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="modal-card__header">
          <h2>{title}</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Đóng">
            <X size={19} />
          </button>
        </header>
        <div className="modal-card__body">{children}</div>
      </section>
    </div>
  );
}
