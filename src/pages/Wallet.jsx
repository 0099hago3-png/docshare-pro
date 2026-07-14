import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Banknote,
  Clock3,
  Copy,
  Crown,
  History,
  Mail,
  Percent,
  Sparkles,
  PlusCircle,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BotanicalHero from '../components/BotanicalHero.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import Modal from '../components/Modal.jsx';
import { useApp } from '../context/AppContext.jsx';
import { BANK_CONFIG, CREDIT_PACKAGES, PREMIUM_PACKAGES } from '../lib/constants.js';
import { formatDateTime, formatNumber, normalizeError } from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';
import '../payment-admin-report.css';

const REQUEST_COOLDOWN_SECONDS = 5 * 60;

function formatCountdown(totalSeconds) {
  const safe = Math.max(0, Number(totalSeconds || 0));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function requestTypeLabel(item) {
  if (item.type === 'topup') return 'Nạp tiền';
  if (item.type === 'withdraw') return 'Rút tiền';
  if (item.type === 'premium') return 'Premium / Gia hạn';
  return item.type;
}

function requestStatusLabel(status) {
  if (status === 'pending') return 'Chờ Admin duyệt';
  if (status === 'approved') return 'Đã duyệt';
  if (status === 'rejected') return 'Đã từ chối';
  if (status === 'cancelled') return 'Đã hủy';
  return status;
}

export default function Wallet() {
  const { currentUser, toast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [premium, setPremium] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selectedCredit, setSelectedCredit] = useState(CREDIT_PACKAGES[2]);
  const [selectedPremium, setSelectedPremium] = useState(PREMIUM_PACKAGES[0]);
  const [receiptEmail, setReceiptEmail] = useState(currentUser?.email || '');
  const [withdraw, setWithdraw] = useState({
    amount: '',
    bankCode: 'TCB',
    bankName: 'Techcombank',
    accountNumber: '',
    accountName: '',
    receiptEmail: currentUser?.email || '',
  });
  const [busy, setBusy] = useState(false);
  const [clock, setClock] = useState(Date.now());

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
      if (transactionResult.error) throw transactionResult.error;
      if (requestResult.error) throw requestResult.error;
      if (premiumResult.error) throw premiumResult.error;

      setWallet(walletResult.data);
      setTransactions(transactionResult.data || []);
      setRequests(requestResult.data || []);
      setPremium(premiumResult.data || null);
      setClock(Date.now());
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser.id, toast]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setReceiptEmail(currentUser?.email || '');
    setWithdraw((value) => ({
      ...value,
      receiptEmail: value.receiptEmail || currentUser?.email || '',
    }));
  }, [currentUser?.email]);

  useEffect(() => {
    const nextModal = searchParams.get('open');
    if (['topup', 'premium', 'withdraw'].includes(nextModal)) {
      setModal(nextModal);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const latestRequest = requests[0] || null;

  const cooldownSeconds = useMemo(() => {
    if (!latestRequest?.created_at) return 0;
    const createdAt = new Date(latestRequest.created_at).getTime();
    const availableAt = createdAt + REQUEST_COOLDOWN_SECONDS * 1000;
    return Math.max(0, Math.ceil((availableAt - clock) / 1000));
  }, [clock, latestRequest]);

  const requestLocked = cooldownSeconds > 0;

  const topupNote = useMemo(
    () => `NAP ${currentUser.public_id} ${selectedCredit.amount}`,
    [currentUser.public_id, selectedCredit.amount],
  );

  const premiumNote = useMemo(
    () => `${premium ? 'GIAHAN' : 'PREMIUM'} ${selectedPremium.code.toUpperCase()} ${currentUser.public_id}`,
    [currentUser.public_id, premium, selectedPremium.code],
  );

  const qrNote = modal === 'premium' ? premiumNote : topupNote;
  const qrAmount = modal === 'premium' ? selectedPremium.amount : selectedCredit.amount;
  const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankCode}-${BANK_CONFIG.accountNumber}-compact2.png?amount=${qrAmount}&addInfo=${encodeURIComponent(qrNote)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;

  function closeModal() {
    setModal(null);
    const next = new URLSearchParams(searchParams);
    next.delete('open');
    setSearchParams(next, { replace: true });
  }

  async function copy(value) {
    await navigator.clipboard.writeText(value);
    toast('Đã sao chép nội dung chuyển khoản.');
  }

  function showCooldownMessage(seconds = cooldownSeconds) {
    toast(`Bạn vừa tạo giao dịch. Vui lòng chờ ${formatCountdown(seconds)} trước khi tạo giao dịch tiếp theo.`, 'error');
  }

  async function createPaymentRequest(payload) {
    if (requestLocked) {
      showCooldownMessage();
      return null;
    }

    const { data, error } = await supabase.rpc('create_payment_request', payload);
    if (error) throw error;

    if (!data?.ok) {
      if (data?.code === 'COOLDOWN_ACTIVE') {
        showCooldownMessage(Number(data.remaining_seconds || 0));
        await load();
        return null;
      }
      throw new Error(data?.message || 'Không thể tạo yêu cầu thanh toán.');
    }

    return data;
  }

  async function createTopup() {
    try {
      setBusy(true);

      const result = await createPaymentRequest({
        p_type: 'topup',
        p_amount_vnd: selectedCredit.amount,
        p_credit_amount: selectedCredit.credit,
        p_plan_code: null,
        p_bank_account_id: null,
        p_transfer_note: topupNote,
        p_receipt_email: receiptEmail.trim() || currentUser.email,
      });

      if (!result) return;

      toast('Đã gửi yêu cầu nạp tiền tới Admin. Credit chỉ được cộng sau khi Admin duyệt.');
      closeModal();
      await load();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function createPremium() {
    try {
      setBusy(true);

      const result = await createPaymentRequest({
        p_type: 'premium',
        p_amount_vnd: selectedPremium.amount,
        p_credit_amount: 0,
        p_plan_code: selectedPremium.code,
        p_bank_account_id: null,
        p_transfer_note: premiumNote,
        p_receipt_email: receiptEmail.trim() || currentUser.email,
      });

      if (!result) return;

      toast(`${premium ? 'Yêu cầu gia hạn' : 'Yêu cầu Premium'} đã được gửi tới Admin để duyệt.`);
      closeModal();
      await load();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function createWithdraw(event) {
    event.preventDefault();

    const amount = Number(withdraw.amount);

    if (!amount || amount < 10000) {
      toast('Số tiền rút tối thiểu là 10.000đ.', 'error');
      return;
    }

    if (!withdraw.receiptEmail.trim()) {
      toast('Hãy nhập Gmail hoặc email nhận biên nhận.', 'error');
      return;
    }

    if (requestLocked) {
      showCooldownMessage();
      return;
    }

    try {
      setBusy(true);

      const { data: bank, error: bankError } = await supabase
        .from('bank_accounts')
        .insert({
          user_id: currentUser.id,
          bank_code: withdraw.bankCode,
          bank_name: withdraw.bankName,
          account_number: withdraw.accountNumber,
          account_name: withdraw.accountName,
          is_default: true,
        })
        .select()
        .single();

      if (bankError) throw bankError;

      const result = await createPaymentRequest({
        p_type: 'withdraw',
        p_amount_vnd: amount,
        p_credit_amount: 0,
        p_plan_code: null,
        p_bank_account_id: bank.id,
        p_transfer_note: `RUT ${currentUser.public_id}`,
        p_receipt_email: withdraw.receiptEmail.trim(),
      });

      if (!result) return;

      toast('Đã gửi yêu cầu rút tiền tới Admin. Tiền chỉ được trừ sau khi Admin duyệt.');
      closeModal();
      await load();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading label="Đang tải ví..." />;

  return (
    <div className="page wallet-page">
      <BotanicalHero
        compact
        eyebrow="TÀI CHÍNH CÁ NHÂN"
        title="Ví & Premium"
        description="Mọi yêu cầu nạp, rút, mua Premium và gia hạn đều được gửi tới Admin để kiểm tra trước khi duyệt."
      />

      <section className="payment-review-banner botanical-card">
        <span className="payment-review-banner__icon"><ShieldCheck size={23} /></span>
        <div>
          <strong>Admin duyệt thủ công mọi giao dịch</strong>
          <p>Sau khi tạo yêu cầu, giao dịch sẽ xuất hiện trong Admin → Nạp / Rút / Premium với trạng thái chờ duyệt.</p>
        </div>
        {requestLocked ? (
          <span className="payment-review-banner__cooldown"><Clock3 size={17} /> Tạo giao dịch mới sau {formatCountdown(cooldownSeconds)}</span>
        ) : (
          <span className="payment-review-banner__ready">Có thể tạo giao dịch mới</span>
        )}
      </section>

      <div className="wallet-summary-grid">
        <section className="wallet-balance botanical-card">
          <div><span><WalletCards size={24} /></span><div><small>Số dư credit</small><strong>{formatNumber(wallet?.credit_balance || 0)}</strong></div></div>
          <div className="wallet-balance__actions">
            <button className="button" type="button" onClick={() => setModal('topup')}><PlusCircle size={17} /> Nạp tiền</button>
            <button className="button button--outline" type="button" onClick={() => setModal('withdraw')}><ArrowUpFromLine size={17} /> Rút tiền</button>
          </div>
        </section>

        <section className="premium-card botanical-card">
          <div><Crown size={28} /><div><small>Gói Premium</small><strong>{premium ? 'Đang hoạt động' : 'Chưa đăng ký'}</strong><span>{premium ? `Hết hạn ${new Date(premium.ends_at).toLocaleDateString('vi-VN')}` : 'Mở khóa quyền lợi cao cấp'}</span></div></div>
          <button className="button button--outline" type="button" onClick={() => setModal('premium')}>{premium ? 'Gia hạn Premium' : 'Mua Premium'}</button>
        </section>

        <section className="wallet-cash botanical-card">
          <div><span><Banknote size={24} /></span><div><small>Số dư tiền tác giả</small><strong>{formatNumber(wallet?.cash_balance || 0)}đ</strong></div></div>
          <small>Khoản này dùng cho yêu cầu rút tiền.</small>
        </section>
      </div>

      <div className="wallet-content-grid">
        <section className="botanical-card table-card">
          <div className="section-heading"><div><History size={21} /><h2>Lịch sử credit</h2></div></div>
          {transactions.length ? (
            <div className="table-scroll">
              <table>
                <thead><tr><th>Thời gian</th><th>Loại</th><th>Ghi chú</th><th>Số credit</th><th>Số dư sau</th></tr></thead>
                <tbody>{transactions.map((item) => <tr key={item.id}><td>{formatDateTime(item.created_at)}</td><td>{item.type}</td><td>{item.note || '-'}</td><td className={item.amount >= 0 ? 'positive' : 'negative'}>{item.amount >= 0 ? '+' : ''}{formatNumber(item.amount)}</td><td>{formatNumber(item.balance_after)}</td></tr>)}</tbody>
              </table>
            </div>
          ) : <EmptyState title="Chưa có giao dịch" />}
        </section>

        <section className="botanical-card table-card">
          <div className="section-heading"><div><ArrowDownToLine size={21} /><h2>Yêu cầu gửi Admin</h2></div></div>
          {requests.length ? (
            <div className="request-list">
              {requests.map((item) => (
                <article key={item.id}>
                  <div><strong>{requestTypeLabel(item)}</strong><small>{formatDateTime(item.created_at)}</small></div>
                  <span className={`status status--${item.status}`}>{requestStatusLabel(item.status)}</span>
                  <p>{formatNumber(item.amount_vnd)}đ · {item.transfer_note}</p>
                  {item.type === 'withdraw' && (
                    <small>Phí 5%: {formatNumber(item.fee_vnd || Number(item.amount_vnd || 0) * 0.05)}đ · Thực nhận: {formatNumber(item.net_amount_vnd || Number(item.amount_vnd || 0) * 0.95)}đ</small>
                  )}
                  {item.receipt_email && <small>Biên nhận: {item.receipt_email}</small>}
                  {item.admin_note && <small className="request-admin-note">Phản hồi Admin: {item.admin_note}</small>}
                </article>
              ))}
            </div>
          ) : <EmptyState title="Chưa có yêu cầu" />}
        </section>
      </div>

      <Modal open={modal === 'topup'} onClose={closeModal} title="Nạp credit" width={820}>
        <div className="payment-layout">
          <div>
            <div className="package-grid package-grid--credit">
              {CREDIT_PACKAGES.map((item) => (
                <button key={item.amount} className={selectedCredit.amount === item.amount ? 'package-option is-active' : 'package-option'} type="button" onClick={() => setSelectedCredit(item)}>
                  <strong>{formatNumber(item.amount)}đ</strong>
                  <span>{formatNumber(item.credit)} credit</span>
                </button>
              ))}
            </div>
            <ReceiptEmailField value={receiptEmail} onChange={setReceiptEmail} />
            <PaymentInfo qrUrl={qrUrl} note={topupNote} amount={selectedCredit.amount} onCopy={copy} />
          </div>
          <PaymentCooldown seconds={cooldownSeconds} label="Sau khi tạo, bạn phải chờ đủ 5 phút mới được tạo yêu cầu tiếp theo." />
          <button className="button button--wide button--large" type="button" onClick={createTopup} disabled={busy || requestLocked}>
            {busy ? 'Đang gửi tới Admin...' : requestLocked ? `Chờ ${formatCountdown(cooldownSeconds)}` : 'Tạo yêu cầu nạp và gửi Admin duyệt'}
          </button>
        </div>
      </Modal>

      <Modal open={modal === 'premium'} onClose={closeModal} title={premium ? 'Gia hạn Premium' : 'Mua Premium'} width={820}>
        <PremiumIntroduction active={Boolean(premium)} />
        <div className="package-grid package-grid--premium package-grid--premium-v70">
          {PREMIUM_PACKAGES.map((item) => (
            <button key={item.code} className={selectedPremium.code === item.code ? 'package-option is-active' : 'package-option'} type="button" onClick={() => setSelectedPremium(item)}>
              <Crown size={22} />
              <em>{item.highlight}</em>
              <strong>{item.name}</strong>
              <span>{formatNumber(item.amount)}đ</span>
              <small><GiftBonusIcon /> Tặng {formatNumber(item.bonusCredit)} credit</small>
            </button>
          ))}
        </div>
        <ReceiptEmailField value={receiptEmail} onChange={setReceiptEmail} />
        <PaymentInfo qrUrl={qrUrl} note={premiumNote} amount={selectedPremium.amount} onCopy={copy} />
        <PaymentCooldown seconds={cooldownSeconds} label="Yêu cầu Premium hoặc gia hạn cũng được gửi tới Admin duyệt." />
        <button className="button button--wide button--large" type="button" onClick={createPremium} disabled={busy || requestLocked}>
          {busy ? 'Đang gửi tới Admin...' : requestLocked ? `Chờ ${formatCountdown(cooldownSeconds)}` : premium ? 'Tạo yêu cầu gia hạn và gửi Admin' : 'Tạo yêu cầu Premium và gửi Admin'}
        </button>
      </Modal>

      <Modal open={modal === 'withdraw'} onClose={closeModal} title="Rút tiền" width={620}>
        <form className="form-grid" onSubmit={createWithdraw}>
          <label>Số tiền muốn rút *<input type="number" min="10000" value={withdraw.amount} onChange={(event) => setWithdraw((value) => ({ ...value, amount: event.target.value }))} required /></label>
          <label>Mã ngân hàng *<input value={withdraw.bankCode} onChange={(event) => setWithdraw((value) => ({ ...value, bankCode: event.target.value }))} required /></label>
          <label>Tên ngân hàng *<input value={withdraw.bankName} onChange={(event) => setWithdraw((value) => ({ ...value, bankName: event.target.value }))} required /></label>
          <label>Số tài khoản *<input value={withdraw.accountNumber} onChange={(event) => setWithdraw((value) => ({ ...value, accountNumber: event.target.value }))} required /></label>
          <label className="span-2">Gmail / email nhận biên nhận *<input type="email" value={withdraw.receiptEmail} onChange={(event) => setWithdraw((value) => ({ ...value, receiptEmail: event.target.value }))} placeholder="ten@gmail.com" required /></label>
          <div className="span-2 withdraw-fee-summary-v70">
            <div><Percent size={18} /><span><small>Phí rút tiền</small><strong>5%</strong></span></div>
            <div><Banknote size={18} /><span><small>Phí dự kiến</small><strong>{formatNumber((Number(withdraw.amount) || 0) * 0.05)}đ</strong></span></div>
            <div><ArrowDownToLine size={18} /><span><small>Thực nhận</small><strong>{formatNumber((Number(withdraw.amount) || 0) * 0.95)}đ</strong></span></div>
          </div>
          <div className="span-2"><PaymentCooldown seconds={cooldownSeconds} label="Yêu cầu rút tiền sẽ chuyển tới Admin kiểm tra. Phí 5% được trừ khi Admin duyệt." /></div>
          <div className="span-2 form-actions form-actions--end">
            <button className="button button--ghost" type="button" onClick={closeModal}>Hủy</button>
            <button className="button" disabled={busy || requestLocked}>{busy ? 'Đang gửi...' : requestLocked ? `Chờ ${formatCountdown(cooldownSeconds)}` : 'Gửi yêu cầu rút tới Admin'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function GiftBonusIcon() {
  return <Sparkles size={14} />;
}

function ReceiptEmailField({ value, onChange }) {
  return (
    <label className="receipt-email-field-v70">
      <span><Mail size={17} /> Gmail / email nhận hóa đơn</span>
      <input
        type="email"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="ten@gmail.com"
        required
      />
      <small>Admin duyệt xong, hệ thống sẽ gửi biên nhận tới địa chỉ này.</small>
    </label>
  );
}

function PremiumIntroduction({ active }) {
  return (
    <section className="premium-introduction-v70">
      <div className="premium-introduction-v70__icon"><Crown size={28} /></div>
      <div>
        <span>{active ? 'GIA HẠN DOCSHARE PREMIUM' : 'NÂNG CẤP DOCSHARE PREMIUM'}</span>
        <h3>{active ? 'Gia hạn để giữ toàn bộ đặc quyền' : 'Học tập tiết kiệm, chia sẻ nổi bật hơn'}</h3>
        <p>
          Giảm 10% tài liệu trả phí, nhận bonus credit sau khi Admin duyệt,
          mở hiệu ứng tên Premium nhiều màu, khung ảnh bìa tài liệu độc quyền,
          hiệu ứng quà nâng cao và quyền lợi ưu tiên.
        </p>
      </div>
    </section>
  );
}

function PaymentCooldown({ seconds, label }) {
  return <div className={seconds > 0 ? 'payment-cooldown is-locked' : 'payment-cooldown'}><Clock3 size={18} /><div><strong>{seconds > 0 ? `Vui lòng chờ ${formatCountdown(seconds)}` : 'Sẵn sàng tạo yêu cầu'}</strong><span>{label}</span></div></div>;
}

function PaymentInfo({ qrUrl, note, amount, onCopy }) {
  return <div className="payment-info botanical-card"><img src={qrUrl} alt="QR thanh toán" onError={(event) => { event.currentTarget.style.display = 'none'; }} /><div><h3>Thông tin chuyển khoản</h3><p><strong>Ngân hàng:</strong> {BANK_CONFIG.bankName}</p><p><strong>Số tài khoản:</strong> {BANK_CONFIG.accountNumber}</p><p><strong>Tên tài khoản:</strong> {BANK_CONFIG.accountName}</p><p><strong>Số tiền:</strong> {formatNumber(amount)}đ</p><label>Nội dung bắt buộc<div className="copy-field"><code>{note}</code><button type="button" onClick={() => onCopy(note)}><Copy size={16} /> Sao chép</button></div></label><small>Nội dung đã tự ghi ID người dùng. Hãy chuyển đúng nội dung; yêu cầu sẽ được gửi tới Admin để đối chiếu và duyệt.</small></div></div>;
}
