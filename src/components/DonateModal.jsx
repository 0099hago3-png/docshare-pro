import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext.jsx';
import { formatNumber } from './LiveUI.jsx';

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
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedId((current) => (
      gifts.some((gift) => gift.id === current)
        ? current
        : gifts[0]?.id || ''
    ));
  }, [gifts, open]);

  useEffect(() => {
    if (!open) return undefined;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  const selectedGift = gifts.find((gift) => gift.id === selectedId) || null;

  const target = mode === 'document'
    ? state.documents.find((item) => item.id === targetId)
    : state.posts.find((item) => item.id === targetId);

  const receiver = target?.authorId ? getUser(target.authorId) : null;

  const canAfford = selectedGift
    ? Number(currentUser?.credit || 0) >= Number(selectedGift.credit || 0)
    : false;

  async function handleSendGift() {
    if (!selectedGift || sending) return;

    setSending(true);

    const success = mode === 'document'
      ? await donateDocument(targetId, selectedGift)
      : await donatePost(targetId, selectedGift);

    setSending(false);

    if (success) onClose();
  }

  return createPortal(
    <div className="live-gift-backdrop" onMouseDown={onClose}>
      <section
        className="live-gift-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Tặng quà"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <h2>🎁 Tặng quà</h2>
            <p>Chọn quà thật từ bảng gifts trong Supabase.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng">×</button>
        </header>

        <div className="live-gift-receiver">
          <span>Gửi cho</span>
          <strong>{receiver?.name || 'Tác giả DocShare'}</strong>
        </div>

        {gifts.length ? (
          <div className="live-gift-select-grid">
            {gifts.map((gift) => (
              <button
                type="button"
                key={gift.id}
                className={selectedId === gift.id ? 'active' : ''}
                onClick={() => setSelectedId(gift.id)}
              >
                <span>{gift.icon || '🎁'}</span>
                <b>{gift.name}</b>
                <small>{formatNumber(gift.credit)} credit</small>
              </button>
            ))}
          </div>
        ) : (
          <div className="live-gift-empty">
            Chưa có quà trong Supabase. Admin hãy thêm dữ liệu vào bảng gifts.
          </div>
        )}

        <footer>
          <div>
            <span>Số dư</span>
            <strong>{formatNumber(currentUser?.credit)} credit</strong>
          </div>

          <button
            className="live-primary-button"
            type="button"
            onClick={handleSendGift}
            disabled={!selectedGift || !canAfford || sending}
          >
            {sending
              ? 'Đang gửi...'
              : canAfford
                ? 'Gửi quà'
                : 'Không đủ credit'}
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
