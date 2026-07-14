import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { normalizeError } from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';

export default function CartButton({ document, compact = false, className = '' }) {
  const { currentUser, toast } = useApp();
  const [busy, setBusy] = useState(false);

  if (!document?.id) return null;
  if (Number(document.price_credit || 0) <= 0) return null;
  if (document.author_id === currentUser?.id) return null;

  async function addToCart(event) {
    event.preventDefault();
    event.stopPropagation();

    try {
      setBusy(true);

      const { error } = await supabase
        .from('document_cart_items')
        .upsert(
          {
            user_id: currentUser.id,
            document_id: document.id,
          },
          {
            onConflict: 'user_id,document_id',
            ignoreDuplicates: true,
          },
        );

      if (error) throw error;

      toast('Đã thêm tài liệu vào giỏ hàng.');
      window.dispatchEvent(new Event('docshare:cart-refresh'));
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className={[
        compact ? 'icon-button cart-add-button-v70' : 'button button--outline cart-add-button-v70',
        className,
      ].filter(Boolean).join(' ')}
      type="button"
      onClick={addToCart}
      disabled={busy}
      title="Thêm vào giỏ hàng"
    >
      <ShoppingCart size={compact ? 17 : 16} />
      {!compact && (busy ? 'Đang thêm...' : 'Thêm giỏ hàng')}
    </button>
  );
}
