import Modal from './Modal.jsx';

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Xác nhận', message, confirmLabel = 'Xác nhận', danger = false, loading = false }) {
  return (
    <Modal open={open} onClose={loading ? undefined : onClose} title={title} width={460}>
      <p className="confirm-message">{message}</p>
      <div className="form-actions form-actions--end">
        <button className="button button--ghost" type="button" onClick={onClose} disabled={loading}>Hủy</button>
        <button className={danger ? 'button button--danger' : 'button'} type="button" onClick={onConfirm} disabled={loading}>
          {loading ? 'Đang xử lý...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
