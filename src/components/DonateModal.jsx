import { Gift, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { supabase } from '../lib/supabase.js';
import { formatNumber, getProfileName, normalizeError } from '../lib/helpers.js';
import Modal from './Modal.jsx';

export default function DonateModal({ open, onClose, receiver, targetType = 'profile', targetId = null }) {
  const { toast, refreshProfile } = useApp();
  const [gifts, setGifts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    supabase.from('gifts').select('*').eq('active', true).order('sort_order').then(({ data }) => {
      setGifts(data || []);
      setSelected(data?.[0] || null);
    });
  }, [open]);

  const receiverName = useMemo(() => getProfileName(receiver), [receiver]);

  async function send() {
    if (!selected || !receiver?.id) return;
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
        if (data?.code === 'INSUFFICIENT_CREDIT') throw new Error('Không đủ credit để gửi quà.');
        if (data?.code === 'CANNOT_GIFT_SELF') throw new Error('Bạn không thể tự tặng quà cho chính mình.');
        throw new Error('Không thể gửi quà.');
      }
      toast(`Đã gửi ${selected.name} tới ${receiverName}.`);
      await refreshProfile();
      onClose();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Gửi quà" width={560}>
      <div className="gift-recipient"><span><Gift size={18} /></span><div><small>Gửi tới</small><strong>{receiverName}</strong></div></div>
      <div className="gift-grid gift-grid--modal">
        {gifts.map((gift) => (
          <button key={gift.id} className={selected?.id === gift.id ? 'gift-option is-active' : 'gift-option'} type="button" onClick={() => setSelected(gift)}>
            <span>{gift.icon || '🎁'}</span><strong>{gift.name}</strong><small>{formatNumber(gift.credit_price)} credit</small>
          </button>
        ))}
      </div>
      {!gifts.length && <p className="muted">Kho quà chưa có quà. Admin có thể thêm bằng SQL.</p>}
      <button className="button button--wide button--large" type="button" onClick={send} disabled={!selected || busy}><Send size={18} /> {busy ? 'Đang gửi...' : 'Gửi quà'}</button>
    </Modal>
  );
}
