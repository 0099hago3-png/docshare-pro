import { CheckCircle2, ShoppingCart } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { normalizeError } from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';

export default function CartButton({ document, compact = false, className = '' }) {
  const { currentUser, toast } = useApp();
  const [busy, setBusy] = useState(false);
  const [purchased, setPurchased] = useState(Boolean(document?.is_purchased));
  const [inCart, setInCart] = useState(Boolean(document?.is_in_cart));

  const loadState = useCallback(async () => {
    if (!document?.id || !currentUser?.id || Number(document.price_credit || 0) <= 0) return;
    if (document.author_id === currentUser.id) return;

    try {
      const [purchaseResult, cartResult] = await Promise.all([
        supabase
          .from('document_purchases')
          .select('id')
          .eq('document_id', document.id)
          .eq('buyer_id', currentUser.id)
          .maybeSingle(),
        supabase
          .from('document_cart_items')
          .select('document_id')
          .eq('document_id', document.id)
          .eq('user_id', currentUser.id)
          .maybeSingle(),
      ]);

      if (!purchaseResult.error) setPurchased(Boolean(purchaseResult.data));
      if (!cartResult.error) setInCart(Boolean(cartResult.data));
    } catch {
      // Không làm hỏng thẻ tài liệu nếu SQL V70.2 chưa chạy.
    }
  }, [currentUser?.id, document?.author_id, document?.id, document?.price_credit]);

  useEffect(() => {
    setPurchased(Boolean(document?.is_purchased));
    setInCart(Boolean(document?.is_in_cart));
    loadState();
  }, [document?.is_in_cart, document?.is_purchased, loadState]);

  useEffect(() => {
    const refresh = (event) => {
      const targetId = event?.detail?.documentId;
      if (!targetId || targetId === document?.id) loadState();
    };

    window.addEventListener('docshare:purchases-refresh', refresh);
    window.addEventListener('docshare:cart-refresh', refresh);

    return () => {
      window.removeEventListener('docshare:purchases-refresh', refresh);
      window.removeEventListener('docshare:cart-refresh', refresh);
    };
  }, [document?.id, loadState]);

  if (!document?.id) return null;
  if (Number(document.price_credit || 0) <= 0) return null;
  if (document.author_id === currentUser?.id) return null;

  async function addToCart() {
    if (purchased) {
      toast('Bạn đã mua tài liệu này.');
      return;
    }

    if (inCart) {
      toast('Tài liệu đã có trong giỏ hàng.');
      return;
    }

    try {
      setBusy(true);

      const rpcResult = await supabase.rpc('add_document_to_cart', {
        p_document_id: document.id,
      });

      if (rpcResult.error) {
        const { error: fallbackError } = await supabase
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

        if (fallbackError) throw fallbackError;
      } else if (rpcResult.data && !rpcResult.data.ok) {
        if (rpcResult.data.code === 'ALREADY_PURCHASED') {
          setPurchased(true);
          toast('Bạn đã mua tài liệu này.');
          return;
        }

        throw new Error(rpcResult.data.message || 'Không thể thêm vào giỏ hàng.');
      }

      setInCart(true);
      toast('Đã thêm tài liệu vào giỏ hàng.');
      window.dispatchEvent(new CustomEvent('docshare:cart-refresh', {
        detail: { documentId: document.id },
      }));
    } catch (error) {
      const message = normalizeError(error);
      const permissionError = /permission|row-level security|policy|quyền/i.test(message);
      toast(
        permissionError
          ? 'Chưa có quyền thêm giỏ hàng. Hãy chạy file SQL V70.2 trong Supabase rồi thử lại.'
          : message,
        'error',
      );
    } finally {
      setBusy(false);
    }
  }

  const icon = purchased || inCart ? <CheckCircle2 size={compact ? 17 : 16} /> : <ShoppingCart size={compact ? 17 : 16} />;
  const label = purchased
    ? 'Đã mua'
    : inCart
      ? 'Trong giỏ hàng'
      : busy
        ? 'Đang thêm...'
        : 'Thêm vào giỏ hàng';

  return (
    <button
      className={[
        compact ? 'icon-button cart-add-button-v70' : 'button button--outline cart-add-button-v70',
        purchased ? 'is-purchased-v70-2' : '',
        inCart ? 'is-in-cart-v70-2' : '',
        className,
      ].filter(Boolean).join(' ')}
      type="button"
      onClick={addToCart}
      disabled={busy || purchased}
      title={label}
    >
      {icon}
      {!compact && label}
    </button>
  );
}
