import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  EmptyState,
  PageHeader,
  formatNumber,
} from '../components/LiveUI.jsx';

export default function Wallet() {
  const {
    state,
    currentUser,
    requestTopup,
    requestWithdraw,
    requestPremium,
  } = useApp();

  const [topupAmount, setTopupAmount] = useState(10000);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const ownTransactions = state.transactions.filter((item) => item.userId === currentUser?.id);

  return (
    <div className="live-page">
      <PageHeader
        eyebrow="VÍ DỮ LIỆU THẬT"
        title="Ví credit & Premium"
        text="Số dư và lịch sử được đọc trực tiếp từ Supabase."
      />

      <div className="live-wallet-summary">
        <article>
          <span>Số dư credit</span>
          <strong>{formatNumber(currentUser?.credit)} credit</strong>
        </article>
        <article>
          <span>Số dư tiền tác giả</span>
          <strong>{formatNumber(currentUser?.balance)} đ</strong>
        </article>
        <article>
          <span>Trạng thái Premium</span>
          <strong>{currentUser?.premium ? 'Đang hoạt động' : 'Chưa đăng ký'}</strong>
        </article>
      </div>

      <div className="live-wallet-grid">
        <section className="live-panel">
          <h2>Nạp credit</h2>
          <p>10.000 đ = 20 credit. Yêu cầu sẽ được lưu vào bảng payment_requests.</p>

          <label className="live-field">
            <span>Số tiền</span>
            <select value={topupAmount} onChange={(event) => setTopupAmount(Number(event.target.value))}>
              <option value="10000">10.000 đ → 20 credit</option>
              <option value="20000">20.000 đ → 40 credit</option>
              <option value="50000">50.000 đ → 100 credit</option>
              <option value="100000">100.000 đ → 200 credit</option>
              <option value="250000">250.000 đ → 500 credit</option>
            </select>
          </label>

          <button
            className="live-primary-button"
            type="button"
            onClick={() => requestTopup(topupAmount, Math.round(topupAmount / 500))}
          >
            Gửi yêu cầu nạp
          </button>
        </section>

        <section className="live-panel">
          <h2>Đăng ký Premium</h2>
          <p>Tạo yêu cầu thật để Admin xử lý trong Supabase.</p>

          <button
            className="live-primary-button"
            type="button"
            onClick={() => requestPremium({
              code: 'premium-1-month',
              name: 'Premium 1 tháng',
              price: 49000,
              bonus: 20,
            })}
          >
            Đăng ký Premium 1 tháng
          </button>
        </section>

        <section className="live-panel">
          <h2>Rút tiền</h2>

          <label className="live-field">
            <span>Ngân hàng</span>
            <input value={bank} onChange={(event) => setBank(event.target.value)} placeholder="Tên ngân hàng" />
          </label>

          <label className="live-field">
            <span>Số tài khoản</span>
            <input value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} placeholder="Số tài khoản" />
          </label>

          <label className="live-field">
            <span>Số tiền muốn rút</span>
            <input type="number" min="0" value={withdrawAmount} onChange={(event) => setWithdrawAmount(event.target.value)} />
          </label>

          <button
            className="live-primary-button"
            type="button"
            onClick={() => requestWithdraw({
              amount: Number(withdrawAmount || 0),
              bank,
              number: accountNumber,
            })}
          >
            Gửi yêu cầu rút
          </button>
        </section>
      </div>

      <PageHeader
        eyebrow="LỊCH SỬ GIAO DỊCH"
        title="Biến động credit và yêu cầu thanh toán"
      />

      {ownTransactions.length ? (
        <div className="live-table-wrap">
          <table className="live-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Loại</th>
                <th>Credit</th>
                <th>Trạng thái</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {ownTransactions.map((item) => (
                <tr key={`${item.type}-${item.id}`}>
                  <td>{item.date}</td>
                  <td>{item.type}</td>
                  <td>{item.signedCredit ?? item.credit}</td>
                  <td><span className={`live-status ${item.status}`}>{item.status}</span></td>
                  <td>{item.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon="💳"
          title="Chưa có giao dịch"
          text="Ví đang bắt đầu từ số 0."
        />
      )}
    </div>
  );
}
