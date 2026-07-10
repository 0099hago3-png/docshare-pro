import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatNumber } from '../utils/helpers.js';

export default function DonateModal({ open, onClose, mode = 'post', targetId }) {
  const { state, currentUser, donatePost, donateDocument } = useApp();
  const [selected, setSelected] = useState(state.giftStore[0]);
  if (!open) return null;

  function submit() {
    const ok = mode === 'document' ? donateDocument(targetId, selected) : donatePost(targetId, selected);
    if (ok) onClose();
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-card donate-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h3>💝 Gửi quà donate</h3>
          <button onClick={onClose}>×</button>
        </div>
        <div className="balance-box">Số dư hiện tại: <b>{formatNumber(currentUser?.credit)} credit</b></div>
        <div className="gift-grid">
          {state.giftStore.map((gift) => (
            <button key={gift.id} className={selected.id === gift.id ? 'active' : ''} onClick={() => setSelected(gift)}>
              <span>{gift.icon}</span>
              <b>{gift.name}</b>
              <small>{gift.credit} credit</small>
            </button>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>Hủy</button>
          <button className="btn donate-glow" onClick={submit}>Gửi {selected.icon} {selected.name}</button>
        </div>
      </div>
    </div>
  );
}
