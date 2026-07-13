import { Gift, Send, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { getGiftTier } from '../lib/giftTiers.js';
import { supabase } from '../lib/supabase.js';
import { formatNumber, getProfileName, normalizeError } from '../lib/helpers.js';
import Modal from './Modal.jsx';

export default function DonateModal({
  open,
  onClose,
  receiver,
  targetType = 'profile',
  targetId = null,
  onSent,
}) {
  const { toast, refreshProfile } = useApp();
  const [gifts, setGifts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;

    let active = true;

    supabase
      .from('gifts')
      .select('*')
      .eq('active', true)
      .order('sort_order')
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          toast(normalizeError(error), 'error');
          return;
        }

        setGifts(data || []);
        setSelected((current) => {
          if (current && data?.some((gift) => gift.id === current.id)) return current;
          return data?.[0] || null;
        });
      });

    return () => {
      active = false;
    };
  }, [open, toast]);

  const receiverName = useMemo(() => getProfileName(receiver), [receiver]);
  const selectedTier = useMemo(() => getGiftTier(selected), [selected]);

  async function send() {
    if (!selected || !receiver?.id) {
      toast('Hãy chọn món quà và người nhận.', 'error');
      return;
    }

    try {
      setBusy(true);

      const { data, error } = await supabase.rpc('send_gift', {
        p_gift_id: selected.id,
        p_receiver_id: receiver.id,
        p_target_type: targetType,
        p_target_id: targetId,
      });

      if (error) throw error;

      if (!data?.ok) {
        if (data?.code === 'INSUFFICIENT_CREDIT') {
          throw new Error(`Không đủ credit. Bạn cần ${formatNumber(data?.price || selected.credit_price)} credit.`);
        }

        if (data?.code === 'CANNOT_GIFT_SELF') {
          throw new Error('Bạn không thể tự tặng quà cho chính mình.');
        }

        if (data?.code === 'TARGET_NOT_FOUND') {
          throw new Error('Bình luận hoặc nội dung nhận quà không còn tồn tại.');
        }

        throw new Error('Không thể gửi quà lúc này.');
      }

      toast(`Đã gửi ${selected.name} tới ${receiverName}.`);
      await refreshProfile();

      onSent?.({
        ...selected,
        tier: selectedTier,
        transactionId: data?.transaction_id || null,
      });

      onClose?.();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Gửi quà tri ân" width={650}>
      <div className="gift-recipient gift-recipient--enhanced">
        <span><Gift size={19} /></span>
        <div>
          <small>Gửi tới</small>
          <strong>{receiverName}</strong>
        </div>
        {selected && (
          <em className={`gift-tier-badge gift-tier-badge--${selectedTier.key}`}>
            <Sparkles size={13} /> {selectedTier.label}
          </em>
        )}
      </div>

      <div className="gift-grid gift-grid--modal gift-grid--ranked">
        {gifts.map((gift) => {
          const tier = getGiftTier(gift);

          return (
            <button
              key={gift.id}
              className={selected?.id === gift.id ? `gift-option gift-option--${tier.key} is-active` : `gift-option gift-option--${tier.key}`}
              type="button"
              onClick={() => setSelected(gift)}
            >
              <span className="gift-option__shine" aria-hidden="true" />
              <span className="gift-option__icon">{gift.icon || '🎁'}</span>
              <strong>{gift.name}</strong>
              <small>{formatNumber(gift.credit_price)} credit</small>
              <em>{tier.label}</em>
            </button>
          );
        })}
      </div>

      {!gifts.length && (
        <p className="muted">Kho quà chưa có quà. Hãy chạy file SQL V58 để tạo kho quà.</p>
      )}

      <button
        className={`button button--wide button--large gift-send-button gift-send-button--${selectedTier.key}`}
        type="button"
        onClick={send}
        disabled={!selected || busy}
      >
        <Send size={18} /> {busy ? 'Đang gửi quà...' : `Gửi ${selected?.name || 'quà'}`}
      </button>
    </Modal>
  );
}
