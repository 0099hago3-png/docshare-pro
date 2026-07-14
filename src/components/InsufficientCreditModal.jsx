import { Crown, WalletCards } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '../lib/helpers.js';
import Modal from './Modal.jsx';

export default function InsufficientCreditModal({
  open,
  onClose,
  balance = 0,
  required = 0,
  title = 'Chưa đủ credit để thanh toán',
}) {
  const navigate = useNavigate();
  const missing = Math.max(0, Number(required || 0) - Number(balance || 0));

  function go(target) {
    onClose?.();
    navigate(target);
  }

  return (
    <Modal open={open} onClose={onClose} title={title} width={560}>
      <div className="insufficient-credit-v70">
        <div className="insufficient-credit-v70__icon">
          <WalletCards size={34} />
        </div>

        <h3>Bạn cần nạp thêm credit</h3>
        <p>
          Số dư hiện tại chưa đủ để hoàn tất giao dịch. Bạn có thể nạp credit
          hoặc xem quyền lợi Premium để được giảm 10% khi mua tài liệu.
        </p>

        <div className="insufficient-credit-v70__summary">
          <article>
            <small>Số dư hiện tại</small>
            <strong>{formatNumber(balance)} credit</strong>
          </article>
          <article>
            <small>Cần thanh toán</small>
            <strong>{formatNumber(required)} credit</strong>
          </article>
          <article className="is-missing">
            <small>Còn thiếu</small>
            <strong>{formatNumber(missing)} credit</strong>
          </article>
        </div>

        <div className="insufficient-credit-v70__actions">
          <button
            className="button button--large"
            type="button"
            onClick={() => go('/wallet?open=topup')}
          >
            <WalletCards size={18} />
            Nạp credit ngay
          </button>

          <button
            className="button button--large button--outline"
            type="button"
            onClick={() => go('/wallet?open=premium')}
          >
            <Crown size={18} />
            Xem quyền lợi Premium
          </button>
        </div>
      </div>
    </Modal>
  );
}
