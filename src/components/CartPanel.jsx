import {
  CheckCircle2,
  Crown,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { formatNumber, normalizeError, publicAssetUrl } from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';
import InsufficientCreditModal from './InsufficientCreditModal.jsx';
import { isPremiumActive } from './PremiumBadge.jsx';

function priceFor(document, premium) {
  const original = Math.max(0, Number(document?.price_credit || 0));
  if (!premium || original <= 0) return original;
  return Math.max(1, Math.ceil(original * 0.9));
}

export default function CartPanel({ open, onClose, onCountChange }) {
  const { currentUser, refreshProfile, toast } = useApp();
  const [items, setItems] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [insufficient, setInsufficient] = useState(null);

  const premium = isPremiumActive(currentUser);

  const load = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);

      const [cartResult, walletResult] = await Promise.all([
        supabase
          .from('document_cart_items')
          .select(`
            user_id,
            document_id,
            created_at,
            documents:document_id(
              id,
              author_id,
              title,
              price_credit,
              cover_frame,
              status,
              profiles:author_id(
                id,
                full_name,
                username,
                avatar_path,
                role,
                premium,
                premium_expires_at
              ),
              document_files(
                file_kind,
                storage_path
              )
            )
          `)
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false }),

        supabase
          .from('wallets')
          .select('credit_balance')
          .eq('user_id', currentUser.id)
          .maybeSingle(),
      ]);

      if (cartResult.error) throw cartResult.error;
      if (walletResult.error) throw walletResult.error;

      const rows = (cartResult.data || [])
        .filter((item) => item.documents?.status === 'published')
        .map((item) => ({
          ...item,
          document: item.documents,
          coverPath: item.documents?.document_files?.find(
            (file) => file.file_kind === 'cover',
          )?.storage_path || null,
        }));

      setItems(rows);
      setWalletBalance(Number(walletResult.data?.credit_balance || 0));
      onCountChange?.(rows.length);
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, onCountChange, toast]);

  useEffect(() => {
    if (open) load();
  }, [load, open]);

  useEffect(() => {
    const refresh = () => load();
    window.addEventListener('docshare:cart-refresh', refresh);
    return () => window.removeEventListener('docshare:cart-refresh', refresh);
  }, [load]);

  const totals = useMemo(() => {
    const original = items.reduce(
      (sum, item) => sum + Number(item.document?.price_credit || 0),
      0,
    );
    const final = items.reduce(
      (sum, item) => sum + priceFor(item.document, premium),
      0,
    );

    return {
      original,
      final,
      saved: Math.max(0, original - final),
    };
  }, [items, premium]);

  async function remove(documentId) {
    try {
      const { error } = await supabase
        .from('document_cart_items')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('document_id', documentId);

      if (error) throw error;
      await load();
      window.dispatchEvent(new Event('docshare:cart-refresh'));
    } catch (error) {
      toast(normalizeError(error), 'error');
    }
  }

  async function checkout() {
    if (!items.length) return;

    try {
      setBusy(true);

      const { data, error } = await supabase.rpc('checkout_cart');
      if (error) throw error;

      if (!data?.ok) {
        if (data?.code === 'INSUFFICIENT_CREDIT') {
          setInsufficient({
            balance: Number(data.balance || walletBalance),
            required: Number(data.total_price || totals.final),
          });
          return;
        }

        throw new Error(data?.message || 'Không thể thanh toán giỏ hàng.');
      }

      toast(`Thanh toán thành công ${data.purchased_count || 0} tài liệu.`);
      await refreshProfile();
      window.dispatchEvent(new Event('docshare:wallet-refresh'));
      window.dispatchEvent(new CustomEvent('docshare:purchases-refresh', {
        detail: { documentIds: items.map((item) => item.document_id) },
      }));
      window.dispatchEvent(new Event('docshare:cart-refresh'));
      await load();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <>
      <button
        className="cart-panel-v70__backdrop"
        type="button"
        onClick={onClose}
        aria-label="Đóng giỏ hàng"
      />

      <aside className="cart-panel-v70" aria-label="Giỏ hàng tài liệu">
        <header className="cart-panel-v70__header">
          <div>
            <span><ShoppingCart size={20} /></span>
            <div>
              <strong>Giỏ hàng tài liệu</strong>
              <small>{items.length} tài liệu đang chờ thanh toán</small>
            </div>
          </div>

          <button className="icon-button" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <div className="cart-panel-v70__body">
          {loading ? (
            <p className="muted">Đang tải giỏ hàng...</p>
          ) : items.length ? (
            <div className="cart-panel-v70__list">
              {items.map((item) => {
                const document = item.document;
                const finalPrice = priceFor(document, premium);

                return (
                  <article key={document.id}>
                    <Link to={`/documents/${document.id}`} onClick={onClose}>
                      <img
                        src={item.coverPath
                          ? publicAssetUrl('document-covers', item.coverPath)
                          : '/assets/default-cover.svg'}
                        alt={document.title}
                      />
                    </Link>

                    <div>
                      <Link to={`/documents/${document.id}`} onClick={onClose}>
                        <strong>{document.title}</strong>
                      </Link>
                      <small>
                        {premium && finalPrice < document.price_credit
                          ? <><del>{document.price_credit}</del> {finalPrice} credit</>
                          : `${finalPrice} credit`}
                      </small>
                    </div>

                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => remove(document.id)}
                      title="Xóa khỏi giỏ"
                    >
                      <Trash2 size={16} />
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="cart-panel-v70__empty">
              <ShoppingCart size={42} />
              <strong>Giỏ hàng đang trống</strong>
              <p>Thêm tài liệu trả phí để thanh toán một lượt.</p>
            </div>
          )}
        </div>

        <footer className="cart-panel-v70__footer">
          {premium && totals.saved > 0 && (
            <div className="cart-panel-v70__premium">
              <Crown size={16} />
              Premium giúp bạn tiết kiệm {formatNumber(totals.saved)} credit
            </div>
          )}

          <div className="cart-panel-v70__total">
            <span>
              <small>Số dư</small>
              <strong>{formatNumber(walletBalance)} credit</strong>
            </span>
            <span>
              <small>Tổng thanh toán</small>
              <strong>{formatNumber(totals.final)} credit</strong>
            </span>
          </div>

          <button
            className="button button--wide button--large"
            type="button"
            onClick={checkout}
            disabled={!items.length || busy}
          >
            <CheckCircle2 size={18} />
            {busy ? 'Đang thanh toán...' : 'Thanh toán toàn bộ'}
          </button>
        </footer>
      </aside>

      <InsufficientCreditModal
        open={Boolean(insufficient)}
        onClose={() => setInsufficient(null)}
        balance={insufficient?.balance || 0}
        required={insufficient?.required || 0}
        title="Giỏ hàng chưa đủ credit"
      />
    </>
  );
}
