import { useApp } from '../context/AppContext.jsx';
import {
  EmptyState,
  PageHeader,
  formatNumber,
} from '../components/LiveUI.jsx';

export default function GiftVault() {
  const { state, currentUser } = useApp();

  const received = state.giftHistory.filter((item) => item.recipientId === currentUser?.id);
  const sent = state.giftHistory.filter((item) => item.userId === currentUser?.id);

  return (
    <div className="live-page">
      <PageHeader
        eyebrow="KHO QUÀ DỮ LIỆU THẬT"
        title="Quà tri ân"
        text="Danh sách quà lấy từ bảng gifts; lịch sử gửi nhận lấy từ gift_transactions."
      />

      {state.giftStore.length ? (
        <div className="live-gift-grid">
          {state.giftStore.map((gift) => (
            <article className="live-gift-card" key={gift.id}>
              <span>{gift.icon || '🎁'}</span>
              <h3>{gift.name}</h3>
              <p>{formatNumber(gift.credit)} credit</p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🎁"
          title="Kho quà đang trống"
          text="Không có quà mẫu. Admin có thể thêm quà thật trong Supabase → Table Editor → gifts."
        />
      )}

      <div className="live-wallet-grid">
        <section className="live-panel">
          <h2>Quà đã nhận ({received.length})</h2>
          {received.map((item) => (
            <p key={item.id}>Nhận {formatNumber(item.creatorShare)} credit · {item.date}</p>
          ))}
          {!received.length && <p>Chưa nhận quà.</p>}
        </section>

        <section className="live-panel">
          <h2>Quà đã gửi ({sent.length})</h2>
          {sent.map((item) => (
            <p key={item.id}>Đã dùng {formatNumber(item.credit)} credit · {item.date}</p>
          ))}
          {!sent.length && <p>Chưa gửi quà.</p>}
        </section>
      </div>
    </div>
  );
}
