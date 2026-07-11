import { useMemo, useState } from 'react';
import { BadgeCheck, BanknoteArrowDown, CreditCard, History, LockKeyhole, Plus, ShieldCheck, Sparkles, WalletCards } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { formatMoney, formatNumber } from '../utils/helpers.js';

const topups = [
  [10000,20],[20000,40],[50000,100],[100000,200],[200000,400],[300000,600],[500000,1000],[1000000,2000],[2000000,4000],[5000000,10000],
];
const plans = [
  { id:'m1', name:'Premium 1 tháng', months:1, price:99000, bonus:300, highlight:'Khởi đầu' },
  { id:'m3', name:'Premium 3 tháng', months:3, price:249000, bonus:900, highlight:'Phổ biến' },
  { id:'m12', name:'Premium 12 tháng', months:12, price:999000, bonus:2500, highlight:'Tiết kiệm nhất' },
];

function vietQrUrl({ amount, note }) {
  return `https://img.vietqr.io/image/TCB-6666665261-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(note)}&accountName=${encodeURIComponent('Nguyen Trong Hoang Giang')}`;
}

export default function Wallet() {
  const { state, currentUser, requestTopup, requestPremium, requestWithdraw, addBankAccount } = useApp();
  const [tab, setTab] = useState('topup');
  const [selectedTopup, setSelectedTopup] = useState(topups[2]);
  const [selectedPlan, setSelectedPlan] = useState(plans[1]);
  const [confirmTopup, setConfirmTopup] = useState(false);
  const [confirmPremium, setConfirmPremium] = useState(false);
  const [withdraw, setWithdraw] = useState({ bank: currentUser?.bankAccounts?.[0]?.bank || 'Techcombank', number: currentUser?.bankAccounts?.[0]?.number || '', holder: currentUser?.bankAccounts?.[0]?.holder || '', amount: 50000 });
  const [newBank, setNewBank] = useState({ bank: 'Techcombank', number: '', holder: '' });
  const transactions = state.transactions.filter((tx) => tx.userId === currentUser.id);
  const pending = state.pendingPaymentUntil > Date.now();
  const totals = useMemo(() => ({
    topup: transactions.filter((t) => t.type === 'topup' && t.status === 'done').reduce((s,t) => s + (t.credit || 0),0),
    spent: transactions.filter((t) => ['buy','gift'].includes(t.type)).reduce((s,t) => s + (t.credit || 0),0),
    withdraw: transactions.filter((t) => t.type === 'withdraw' && t.status === 'done').reduce((s,t) => s + (t.amount || 0),0),
  }), [transactions]);

  function sendTopup() { if (requestTopup(selectedTopup[0], selectedTopup[1])) setConfirmTopup(false); }
  function sendPremium() { if (requestPremium(selectedPlan)) setConfirmPremium(false); }

  return (
    <div className="page universe-page wallet-universe">
      <section className="wallet-cosmos-hero panel-universe">
        <div><span className="eyebrow"><Sparkles size={15}/> VÍ DOCSHARE</span><h1>Credit, Premium & thanh toán</h1><p>Quản lý credit, quà tặng, Premium và các giao dịch với trạng thái rõ ràng.</p></div>
        <div className="wallet-cosmos-stats"><div><WalletCards/><b>{formatNumber(currentUser.credit)}</b><small>Credit hiện có</small></div><div><BanknoteArrowDown/><b>{formatMoney(currentUser.balance)}</b><small>Số dư tác giả</small></div><div><BadgeCheck/><b>{currentUser.premium ? 'Premium' : 'Thường'}</b><small>{currentUser.premiumInfo?.expiresAt ? `Hạn ${currentUser.premiumInfo.expiresAt}` : 'Gói hiện tại'}</small></div></div>
      </section>

      <nav className="wallet-universe-tabs">
        {[
          ['topup', CreditCard, 'Nạp credit'], ['premium', BadgeCheck, 'Gia hạn Premium'], ['withdraw', BanknoteArrowDown, 'Rút tiền'], ['history', History, 'Lịch sử'], ['security', LockKeyhole, 'Bảo mật'],
        ].map(([id,Icon,label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}><Icon size={18}/>{label}</button>)}
      </nav>

      {tab === 'topup' && <div className="wallet-content-grid">
        <section className="panel-universe wallet-main-card"><div className="panel-title-row"><div><h2>Nạp credit bằng chuyển khoản</h2><p>Chọn mệnh giá từ 10.000đ đến 5.000.000đ. Nội dung bắt buộc: <b>{currentUser.id}</b>.</p></div></div><div className="topup-grid-universe">{topups.map((item) => <button key={item[0]} className={selectedTopup[0] === item[0] ? 'active' : ''} onClick={() => setSelectedTopup(item)}><b>{formatMoney(item[0])}</b><span>+{formatNumber(item[1])} credit</span></button>)}</div><button disabled={pending} className="space-btn primary full" onClick={() => setConfirmTopup(true)}>{pending ? 'Đang chờ xác thực 5 phút' : 'Tôi đã chuyển khoản · Gửi xác nhận'}</button></section>
        <section className="panel-universe transfer-card-universe"><h2>Thông tin chuyển khoản</h2><img src={vietQrUrl({ amount:selectedTopup[0], note:currentUser.id })} alt="QR chuyển khoản"/><dl><dt>Ngân hàng</dt><dd>Techcombank</dd><dt>Số tài khoản</dt><dd>6666665261</dd><dt>Chủ tài khoản</dt><dd>Nguyen Trong Hoang Giang</dd><dt>Số tiền</dt><dd>{formatMoney(selectedTopup[0])}</dd><dt>Nội dung</dt><dd>{currentUser.id}</dd></dl></section>
      </div>}

      {tab === 'premium' && <div className="wallet-content-grid">
        <section className="panel-universe wallet-main-card"><div className="panel-title-row"><div><h2>Gia hạn Premium</h2><p>Thiết kế gọn, nổi bật và giữ lại quyền lợi rõ ràng.</p></div></div><div className="premium-plan-grid-universe">{plans.map((plan) => <button key={plan.id} className={selectedPlan.id === plan.id ? 'active' : ''} onClick={() => setSelectedPlan(plan)}><em>{plan.highlight}</em><h3>{plan.name}</h3><strong>{formatMoney(plan.price)}</strong><p>{plan.months * 30} ngày · Tặng {formatNumber(plan.bonus)} credit</p><ul><li>Đăng 20 tài liệu/ngày</li><li>Dung lượng file lớn hơn</li><li>Ưu tiên hiển thị & khung Học giả</li></ul></button>)}</div><button disabled={pending} className="space-btn premium full" onClick={() => setConfirmPremium(true)}>{pending ? 'Đang chờ admin xác nhận' : 'Tôi đã chuyển khoản · Gửi yêu cầu gia hạn'}</button></section>
        <section className="panel-universe transfer-card-universe"><h2>QR gia hạn</h2><img src={vietQrUrl({ amount:selectedPlan.price, note:`${currentUser.id}-PREMIUM` })} alt="QR Premium"/><dl><dt>Gói</dt><dd>{selectedPlan.name}</dd><dt>Số tiền</dt><dd>{formatMoney(selectedPlan.price)}</dd><dt>Nội dung</dt><dd>{currentUser.id}-PREMIUM</dd></dl><div className="premium-status-card"><BadgeCheck/><span><b>Gói hiện tại</b><small>{currentUser.premiumInfo?.plan || 'Chưa có'} · Hạn {currentUser.premiumInfo?.expiresAt || '--'}</small></span></div></section>
      </div>}

      {tab === 'withdraw' && <div className="wallet-content-grid">
        <section className="panel-universe wallet-main-card"><div className="panel-title-row"><div><h2>Rút tiền tác giả</h2><p>Rút tối thiểu 50.000đ. Admin kiểm tra, thêm bill và cập nhật trạng thái.</p></div></div><label>Tài khoản đã lưu<select onChange={(event) => { const account = currentUser.bankAccounts.find((item) => item.id === event.target.value); if (account) setWithdraw({ ...withdraw, bank:account.bank, number:account.number, holder:account.holder }); }}><option value="">Chọn tài khoản</option>{(currentUser.bankAccounts || []).map((account) => <option key={account.id} value={account.id}>{account.bank} · {account.number}</option>)}</select></label><div className="form-grid"><label>Ngân hàng<input value={withdraw.bank} onChange={(event) => setWithdraw({ ...withdraw, bank:event.target.value })}/></label><label>Số tài khoản<input value={withdraw.number} onChange={(event) => setWithdraw({ ...withdraw, number:event.target.value })}/></label><label>Chủ tài khoản<input value={withdraw.holder} onChange={(event) => setWithdraw({ ...withdraw, holder:event.target.value })}/></label><label>Số tiền<input type="number" min="50000" value={withdraw.amount} onChange={(event) => setWithdraw({ ...withdraw, amount:event.target.value })}/></label></div><button className="space-btn primary" onClick={() => requestWithdraw(withdraw)}>Gửi yêu cầu rút</button></section>
        <section className="panel-universe wallet-main-card"><div className="panel-title-row"><div><h2>Thêm tài khoản ngân hàng</h2><p>Lưu để rút nhanh ở những lần sau.</p></div></div><label>Ngân hàng<select value={newBank.bank} onChange={(event) => setNewBank({ ...newBank, bank:event.target.value })}>{state.banks.map((bank) => <option key={bank.id}>{bank.name}</option>)}</select></label><label>Số tài khoản<input value={newBank.number} onChange={(event) => setNewBank({ ...newBank, number:event.target.value })}/></label><label>Tên chủ tài khoản<input value={newBank.holder} onChange={(event) => setNewBank({ ...newBank, holder:event.target.value })}/></label><button className="space-btn secondary" onClick={() => addBankAccount(newBank)}><Plus size={17}/>Lưu tài khoản</button><div className="saved-bank-list">{(currentUser.bankAccounts || []).map((account) => <div key={account.id}><b>{account.bank}</b><span>{account.number}</span><small>{account.holder}</small>{account.default && <em>Mặc định</em>}</div>)}</div></section>
      </div>}

      {tab === 'history' && <section className="panel-universe transaction-history-universe"><div className="panel-title-row"><div><h2>Lịch sử giao dịch</h2><p>Không dùng biểu đồ. Mỗi giao dịch có loại, trạng thái và ghi chú rõ ràng.</p></div><div className="history-summary"><span>Đã nạp <b>{formatNumber(totals.topup)} credit</b></span><span>Đã dùng <b>{formatNumber(totals.spent)} credit</b></span><span>Đã rút <b>{formatMoney(totals.withdraw)}</b></span></div></div><div className="transaction-list-universe custom-scroll">{transactions.map((tx) => <article key={tx.id}><i className={`tx-icon ${tx.type}`}>{tx.type === 'topup' ? '＋' : tx.type === 'withdraw' ? '↓' : tx.type === 'premium' ? 'P' : tx.type === 'gift' ? '✦' : '−'}</i><div><b>{tx.type === 'topup' ? 'Nạp credit' : tx.type === 'withdraw' ? 'Rút tiền' : tx.type === 'premium' ? 'Gia hạn Premium' : tx.type === 'gift' ? 'Tặng quà' : tx.type === 'buy' ? 'Mở tài liệu' : tx.type}</b><small>{tx.note}</small><time>{tx.date}</time></div><span><strong>{tx.amount ? formatMoney(tx.amount) : `${tx.credit} credit`}</strong><em className={`status ${tx.status}`}>{tx.status}</em></span></article>)}</div></section>}

      {tab === 'security' && <SecurityBox/>}

      <ConfirmModal open={confirmTopup} title="Xác nhận nạp credit" confirmText="Gửi xác nhận" onClose={() => setConfirmTopup(false)} onConfirm={sendTopup}><p>Bạn xác nhận đã chuyển <b>{formatMoney(selectedTopup[0])}</b> và ghi đúng nội dung <b>{currentUser.id}</b>.</p><p>Sau khi gửi, hệ thống khóa tạo giao dịch mới trong 5 phút để chờ xác thực.</p></ConfirmModal>
      <ConfirmModal open={confirmPremium} title="Xác nhận gia hạn Premium" confirmText="Gửi yêu cầu" onClose={() => setConfirmPremium(false)} onConfirm={sendPremium}><p>Gói: <b>{selectedPlan.name}</b></p><p>Phí: <b>{formatMoney(selectedPlan.price)}</b></p><p>Nội dung: <b>{currentUser.id}-PREMIUM</b></p></ConfirmModal>
    </div>
  );
}

function SecurityBox() {
  const { currentUser, changePassword } = useApp();
  const [form, setForm] = useState({ old:'', pass:'', confirm:'', hint:currentUser.passwordHint || '' });
  const [message, setMessage] = useState('');
  function save() { const result = changePassword(form.old,form.pass,form.confirm,form.hint); setMessage(result.ok ? 'Đổi mật khẩu thành công.' : result.message); }
  return <section className="panel-universe security-universe-card"><div><ShieldCheck size={38}/><h2>Bảo mật tài khoản</h2><p>Đổi mật khẩu, cập nhật gợi ý khi quên và quản lý xác thực.</p></div><div className="security-form"><label>Mật khẩu cũ<input type="password" value={form.old} onChange={(event) => setForm({ ...form, old:event.target.value })}/></label><label>Mật khẩu mới<input type="password" value={form.pass} onChange={(event) => setForm({ ...form, pass:event.target.value })}/></label><label>Xác nhận mật khẩu mới<input type="password" value={form.confirm} onChange={(event) => setForm({ ...form, confirm:event.target.value })}/></label><label>Gợi ý mật khẩu<input value={form.hint} onChange={(event) => setForm({ ...form, hint:event.target.value })}/></label><button className="space-btn primary" onClick={save}>Lưu bảo mật</button>{message && <p>{message}</p>}</div></section>;
}
