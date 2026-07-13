import { ArrowDownToLine, ArrowUpFromLine, Banknote, Copy, Crown, History, PlusCircle, WalletCards } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import BotanicalHero from '../components/BotanicalHero.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import Modal from '../components/Modal.jsx';
import { useApp } from '../context/AppContext.jsx';
import { BANK_CONFIG, CREDIT_PACKAGES, PREMIUM_PACKAGES } from '../lib/constants.js';
import { formatDateTime, formatNumber, normalizeError } from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';

export default function Wallet() {
  const { currentUser, refreshProfile, toast } = useApp();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [premium, setPremium] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selectedCredit, setSelectedCredit] = useState(CREDIT_PACKAGES[2]);
  const [selectedPremium, setSelectedPremium] = useState(PREMIUM_PACKAGES[0]);
  const [withdraw, setWithdraw] = useState({ amount: '', bankCode: 'TCB', bankName: 'Techcombank', accountNumber: '', accountName: '' });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [walletResult, transactionResult, requestResult, premiumResult] = await Promise.all([
        supabase.from('wallets').select('*').eq('user_id', currentUser.id).single(),
        supabase.from('credit_transactions').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('payment_requests').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('premium_subscriptions').select('*').eq('user_id', currentUser.id).eq('status', 'active').order('ends_at', { ascending: false }).limit(1).maybeSingle(),
      ]);
      if (walletResult.error) throw walletResult.error;
      setWallet(walletResult.data);
      setTransactions(transactionResult.data || []);
      setRequests(requestResult.data || []);
      setPremium(premiumResult.data || null);
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser.id, toast]);

  useEffect(() => { load(); }, [load]);

  const topupNote = useMemo(() => `NAP ${currentUser.public_id} ${selectedCredit.amount}`, [currentUser.public_id, selectedCredit.amount]);
  const premiumNote = useMemo(() => `PREMIUM ${selectedPremium.code.toUpperCase()} ${currentUser.public_id}`, [currentUser.public_id, selectedPremium.code]);
  const qrNote = modal === 'premium' ? premiumNote : topupNote;
  const qrAmount = modal === 'premium' ? selectedPremium.amount : selectedCredit.amount;
  const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankCode}-${BANK_CONFIG.accountNumber}-compact2.png?amount=${qrAmount}&addInfo=${encodeURIComponent(qrNote)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;

  async function copy(value) {
    await navigator.clipboard.writeText(value);
    toast('Đã sao chép nội dung chuyển khoản.');
  }

  async function createTopup() {
    try {
      setBusy(true);
      const { error } = await supabase.from('payment_requests').insert({ user_id: currentUser.id, type: 'topup', amount_vnd: selectedCredit.amount, credit_amount: selectedCredit.credit, transfer_note: topupNote, status: 'pending' });
      if (error) throw error;
      toast('Đã tạo yêu cầu nạp tiền. Hãy chuyển khoản đúng nội dung.');
      setModal(null);
      await load();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally { setBusy(false); }
  }

  async function createPremium() {
    try {
      setBusy(true);
      const { error } = await supabase.from('payment_requests').insert({ user_id: currentUser.id, type: 'premium', amount_vnd: selectedPremium.amount, plan_code: selectedPremium.code, transfer_note: premiumNote, status: 'pending' });
      if (error) throw error;
      toast('Đã tạo yêu cầu Premium. Hãy chuyển khoản đúng nội dung.');
      setModal(null);
      await load();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally { setBusy(false); }
  }

  async function createWithdraw(event) {
    event.preventDefault();
    const amount = Number(withdraw.amount);
    if (!amount || amount < 10000) return toast('Số tiền rút tối thiểu là 10.000đ.', 'error');
    try {
      setBusy(true);
      const { data: bank, error: bankError } = await supabase.from('bank_accounts').insert({ user_id: currentUser.id, bank_code: withdraw.bankCode, bank_name: withdraw.bankName, account_number: withdraw.accountNumber, account_name: withdraw.accountName, is_default: true }).select().single();
      if (bankError) throw bankError;
      const { error } = await supabase.from('payment_requests').insert({ user_id: currentUser.id, type: 'withdraw', amount_vnd: amount, bank_account_id: bank.id, transfer_note: `RUT ${currentUser.public_id}`, status: 'pending' });
      if (error) throw error;
      toast('Đã gửi yêu cầu rút tiền.');
      setModal(null);
      await load();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally { setBusy(false); }
  }

  if (loading) return <Loading label="Đang tải ví..." />;

  return (
    <div className="page wallet-page">
      <BotanicalHero compact eyebrow="TÀI CHÍNH CÁ NHÂN" title="Ví & Premium" description="Quản lý credit, nạp rút, gói Premium và lịch sử giao dịch trong một nơi." />
      <div className="wallet-summary-grid">
        <section className="wallet-balance botanical-card"><div><span><WalletCards size={24} /></span><div><small>Số dư credit</small><strong>{formatNumber(wallet?.credit_balance || 0)}</strong></div></div><div className="wallet-balance__actions"><button className="button" type="button" onClick={() => setModal('topup')}><PlusCircle size={17} /> Nạp tiền</button><button className="button button--outline" type="button" onClick={() => setModal('withdraw')}><ArrowUpFromLine size={17} /> Rút tiền</button></div></section>
        <section className="premium-card botanical-card"><div><Crown size={28} /><div><small>Gói Premium</small><strong>{premium ? 'Đang hoạt động' : 'Chưa đăng ký'}</strong><span>{premium ? `Hết hạn ${new Date(premium.ends_at).toLocaleDateString('vi-VN')}` : 'Mở khóa quyền lợi cao cấp'}</span></div></div><button className="button button--outline" type="button" onClick={() => setModal('premium')}>{premium ? 'Gia hạn Premium' : 'Mua Premium'}</button></section>
        <section className="wallet-cash botanical-card"><div><span><Banknote size={24} /></span><div><small>Số dư tiền tác giả</small><strong>{formatNumber(wallet?.cash_balance || 0)}đ</strong></div></div><small>Khoản này dùng cho yêu cầu rút tiền.</small></section>
      </div>

      <div className="wallet-content-grid">
        <section className="botanical-card table-card"><div className="section-heading"><div><History size={21} /><h2>Lịch sử credit</h2></div></div>{transactions.length ? <div className="table-scroll"><table><thead><tr><th>Thời gian</th><th>Loại</th><th>Ghi chú</th><th>Số credit</th><th>Số dư sau</th></tr></thead><tbody>{transactions.map((item) => <tr key={item.id}><td>{formatDateTime(item.created_at)}</td><td>{item.type}</td><td>{item.note || '-'}</td><td className={item.amount >= 0 ? 'positive' : 'negative'}>{item.amount >= 0 ? '+' : ''}{formatNumber(item.amount)}</td><td>{formatNumber(item.balance_after)}</td></tr>)}</tbody></table></div> : <EmptyState title="Chưa có giao dịch" />}</section>
        <section className="botanical-card table-card"><div className="section-heading"><div><ArrowDownToLine size={21} /><h2>Yêu cầu thanh toán</h2></div></div>{requests.length ? <div className="request-list">{requests.map((item) => <article key={item.id}><div><strong>{item.type === 'topup' ? 'Nạp tiền' : item.type === 'withdraw' ? 'Rút tiền' : 'Premium'}</strong><small>{formatDateTime(item.created_at)}</small></div><span className={`status status--${item.status}`}>{item.status}</span><p>{formatNumber(item.amount_vnd)}đ · {item.transfer_note}</p></article>)}</div> : <EmptyState title="Chưa có yêu cầu" />}</section>
      </div>

      <Modal open={modal === 'topup'} onClose={() => setModal(null)} title="Nạp credit" width={760}><div className="payment-layout"><div><div className="package-grid">{CREDIT_PACKAGES.map((item) => <button key={item.amount} className={selectedCredit.amount === item.amount ? 'package-option is-active' : 'package-option'} type="button" onClick={() => setSelectedCredit(item)}><strong>{formatNumber(item.amount)}đ</strong><span>{formatNumber(item.credit)} credit</span></button>)}</div><PaymentInfo qrUrl={qrUrl} note={topupNote} amount={selectedCredit.amount} onCopy={copy} /></div><button className="button button--wide button--large" type="button" onClick={createTopup} disabled={busy}>{busy ? 'Đang tạo yêu cầu...' : 'Tôi đã hiểu, tạo yêu cầu nạp'}</button></div></Modal>
      <Modal open={modal === 'premium'} onClose={() => setModal(null)} title={premium ? 'Gia hạn Premium' : 'Mua Premium'} width={820}><div className="package-grid package-grid--premium">{PREMIUM_PACKAGES.map((item) => <button key={item.code} className={selectedPremium.code === item.code ? 'package-option is-active' : 'package-option'} type="button" onClick={() => setSelectedPremium(item)}><Crown size={22} /><strong>{item.name}</strong><span>{formatNumber(item.amount)}đ</span></button>)}</div><PaymentInfo qrUrl={qrUrl} note={premiumNote} amount={selectedPremium.amount} onCopy={copy} /><button className="button button--wide button--large" type="button" onClick={createPremium} disabled={busy}>{busy ? 'Đang tạo yêu cầu...' : 'Tạo yêu cầu Premium'}</button></Modal>
      <Modal open={modal === 'withdraw'} onClose={() => setModal(null)} title="Rút tiền" width={620}><form className="form-grid" onSubmit={createWithdraw}><label>Số tiền muốn rút *<input type="number" min="10000" value={withdraw.amount} onChange={(event) => setWithdraw((value) => ({ ...value, amount: event.target.value }))} required /></label><label>Mã ngân hàng *<input value={withdraw.bankCode} onChange={(event) => setWithdraw((value) => ({ ...value, bankCode: event.target.value }))} required /></label><label>Tên ngân hàng *<input value={withdraw.bankName} onChange={(event) => setWithdraw((value) => ({ ...value, bankName: event.target.value }))} required /></label><label>Số tài khoản *<input value={withdraw.accountNumber} onChange={(event) => setWithdraw((value) => ({ ...value, accountNumber: event.target.value }))} required /></label><label className="span-2">Tên chủ tài khoản *<input value={withdraw.accountName} onChange={(event) => setWithdraw((value) => ({ ...value, accountName: event.target.value }))} required /></label><div className="span-2 form-actions form-actions--end"><button className="button button--ghost" type="button" onClick={() => setModal(null)}>Hủy</button><button className="button" disabled={busy}>Gửi yêu cầu rút</button></div></form></Modal>
    </div>
  );
}

function PaymentInfo({ qrUrl, note, amount, onCopy }) {
  return <div className="payment-info botanical-card"><img src={qrUrl} alt="QR thanh toán" onError={(event) => { event.currentTarget.style.display = 'none'; }} /><div><h3>Thông tin chuyển khoản</h3><p><strong>Ngân hàng:</strong> {BANK_CONFIG.bankName}</p><p><strong>Số tài khoản:</strong> {BANK_CONFIG.accountNumber}</p><p><strong>Tên tài khoản:</strong> {BANK_CONFIG.accountName}</p><p><strong>Số tiền:</strong> {formatNumber(amount)}đ</p><label>Nội dung bắt buộc<div className="copy-field"><code>{note}</code><button type="button" onClick={() => onCopy(note)}><Copy size={16} /> Sao chép</button></div></label><small>Nội dung đã tự ghi ID người dùng. Hãy chuyển đúng nội dung để Admin đối chiếu.</small></div></div>;
}
