import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

const reasons = ['Spam / quảng cáo', 'Lừa đảo', 'Vi phạm bản quyền', 'Nội dung phản cảm', 'Ngôn từ thù ghét', 'Thông tin sai lệch', 'Lý do khác'];

export default function ReportModal({ open, onClose, type, targetId, userId }) {
  const { addReport } = useApp();
  const [reason, setReason] = useState(reasons[0]);
  const [customReason, setCustomReason] = useState('');
  if (!open) return null;

  function submit() {
    if (reason === 'Lý do khác' && !customReason.trim()) return;
    addReport({ type, targetId, userId, reason, customReason });
    onClose();
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-card report-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h3>🚩 Báo cáo nội dung</h3>
          <button onClick={onClose}>×</button>
        </div>
        <p className="muted">Chọn lý do để admin kiểm tra nhanh hơn. Nếu chọn lý do khác, bạn cần nhập mô tả.</p>
        <div className="reason-grid">
          {reasons.map((item) => (
            <button key={item} className={reason === item ? 'active' : ''} onClick={() => setReason(item)}>{item}</button>
          ))}
        </div>
        <textarea value={customReason} onChange={(e) => setCustomReason(e.target.value)} placeholder="Nhập mô tả chi tiết nếu cần..." />
        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>Hủy</button>
          <button className="btn primary" onClick={submit}>Gửi báo cáo</button>
        </div>
      </div>
    </div>
  );
}
