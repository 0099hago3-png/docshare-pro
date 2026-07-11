import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Gift, Send, X } from 'lucide-react';

import { useApp } from '../context/AppContext.jsx';
import { formatNumber } from '../utils/helpers.js';

export default function DonateModal({
  open,
  onClose,
  mode = 'post',
  targetId,
}) {
  const {
    state,
    currentUser,
    donatePost,
    donateDocument,
    getUser,
  } = useApp();

  const gifts = useMemo(
    () => Array.isArray(state.giftStore) ? state.giftStore : [],
    [state.giftStore],
  );

  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    if (!open) return;
    setSelectedId((current) => {
      const exists = gifts.some((gift) => gift.id === current);
      return exists ? current : (gifts[0]?.id || '');
    });
  }, [open, gifts]);

  useEffect(() => {
    if (!open) return undefined;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const selectedGift =
    gifts.find((gift) => gift.id === selectedId)
    || gifts[0]
    || null;

  const target = mode === 'document'
    ? state.documents.find((item) => item.id === targetId)
    : state.posts.find((item) => item.id === targetId);

  const receiver = target?.authorId
    ? getUser(target.authorId)
    : null;

  const canAfford = selectedGift
    ? Number(currentUser?.credit || 0) >= Number(selectedGift.credit || 0)
    : false;

  function handleSendGift() {
    if (!selectedGift) return;

    const success = mode === 'document'
      ? donateDocument(targetId, selectedGift)
      : donatePost(targetId, selectedGift);

    if (success) onClose();
  }

  return createPortal(
    <div
      className="simple-gift-backdrop-v40"
      onMouseDown={onClose}
    >
      <section
        className="simple-gift-modal-v40"
        role="dialog"
        aria-modal="true"
        aria-label="Tặng quà tri ân"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="simple-gift-header-v40">
          <div>
            <h2><Gift size={20}/> Tặng quà</h2>
            <p>Chọn một món quà và gửi lời cảm ơn.</p>
          </div>

          <button
            type="button"
            className="simple-gift-close-v40"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={18}/>
          </button>
        </header>

        <div className="simple-gift-receiver-v40">
          <span>Gửi cho</span>
          <strong>{receiver?.name || 'Tác giả DocShare'}</strong>
        </div>

        <div className="simple-gift-grid-v40 custom-scroll">
          {gifts.map((gift) => (
            <button
              type="button"
              key={gift.id}
              className={
                selectedGift?.id === gift.id
                  ? 'simple-gift-item-v40 active'
                  : 'simple-gift-item-v40'
              }
              onClick={() => setSelectedId(gift.id)}
            >
             <span className="simple-gift-art-v40 simple-gift-emoji-v40">
  {gift.icon || gift.emoji || '🎁'}
</span>

              <strong>{gift.name}</strong>

              <small>
                {formatNumber(gift.credit || 0)} credit
              </small>
            </button>
          ))}

          {!gifts.length && (
            <p className="simple-gift-empty-v40">
              Kho quà chưa có dữ liệu.
            </p>
          )}
        </div>

        <footer className="simple-gift-footer-v40">
          <div>
            <span>Số dư</span>
            <strong>{formatNumber(currentUser?.credit || 0)} credit</strong>
          </div>

          <button
            type="button"
            className="simple-gift-send-v40"
            onClick={handleSendGift}
            disabled={!selectedGift || !canAfford}
          >
            <Send size={16}/>
            {canAfford ? 'Gửi quà' : 'Không đủ credit'}
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
