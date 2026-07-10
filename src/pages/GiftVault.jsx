import { Gift, Sparkles, Star } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Avatar from '../components/Avatar.jsx';
import { formatNumber } from '../utils/helpers.js';

export default function GiftVault() {
  const { state, currentUser, getUser } = useApp();
  const mine = (state.giftHistory || []).filter((item) => item.userId === currentUser?.id);
  const received = (state.giftHistory || []).filter((item) => {
    if (item.targetType === 'document') return state.documents.find((doc) => doc.id === item.targetId)?.authorId === currentUser?.id;
    return state.posts.find((post) => post.id === item.targetId)?.authorId === currentUser?.id;
  });
  const totalSent = mine.reduce((sum, item) => sum + item.credit, 0);
  const totalReceived = received.reduce((sum, item) => sum + item.credit, 0);

  return (
    <div className="page universe-page gift-vault-page">
      <section className="gift-vault-hero panel-universe">
        <div><span className="eyebrow"><Sparkles size={15}/> KHO QUÀ VŨ TRỤ</span><h1>Quà tặng & điểm ủng hộ</h1><p>Quà chỉ dùng để thể hiện sự ủng hộ trong cộng đồng. Bảng xếp hạng hiển thị điểm, không quy đổi ra tiền.</p></div>
        <div className="gift-vault-stats"><div><Gift/><b>{formatNumber(totalSent)}</b><small>Điểm đã tặng</small></div><div><Star/><b>{formatNumber(totalReceived)}</b><small>Điểm đã nhận</small></div><div><Sparkles/><b>{state.giftStore.length}</b><small>Mẫu quà</small></div></div>
      </section>

      <section className="panel-universe">
        <div className="panel-title-row"><div><h2>Bộ sưu tập quà</h2><p>Các món quà lớn có hiệu ứng và âm thanh riêng.</p></div></div>
        <div className="gift-catalog-grid">{state.giftStore.map((gift) => <article key={gift.id} className={`gift-catalog-card ${gift.effect}`}><span>{gift.icon}</span><h3>{gift.name}</h3><b>{formatNumber(gift.credit)} credit</b><small>{gift.sound ? 'Có hiệu ứng âm thanh riêng' : 'Hiệu ứng ánh sáng'}</small></article>)}</div>
      </section>

      <div className="gift-history-grid">
        <section className="panel-universe"><div className="panel-title-row"><div><h2>Lịch sử đã tặng</h2><p>{mine.length} giao dịch gần nhất</p></div></div><div className="history-list custom-scroll">{mine.map((item) => <HistoryRow key={item.id} item={item} user={getUser(item.userId)} />)}{!mine.length && <p className="muted">Bạn chưa tặng quà.</p>}</div></section>
        <section className="panel-universe"><div className="panel-title-row"><div><h2>Lịch sử đã nhận</h2><p>{received.length} giao dịch gần nhất</p></div></div><div className="history-list custom-scroll">{received.map((item) => <HistoryRow key={item.id} item={item} user={getUser(item.userId)} />)}{!received.length && <p className="muted">Chưa có quà được nhận.</p>}</div></section>
      </div>
    </div>
  );
}

function HistoryRow({ item, user }) {
  return <div className="gift-history-row"><Avatar user={user}/><div><b>{user.name}</b><small>{item.giftName} · {item.targetType === 'document' ? 'Tài liệu' : 'Bài đăng'}</small></div><strong>+{formatNumber(item.credit)} điểm</strong><time>{item.date}</time></div>;
}
