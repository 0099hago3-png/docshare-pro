import { Gift, Sparkles, Star } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Avatar from '../components/Avatar.jsx';
import GiftArtwork from '../components/GiftArtwork.jsx';
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
    <div className="page universe-page gift-vault-page gift-vault-v29">
      <section className="gift-vault-hero gift-vault-hero-v29 panel-universe frame-style-arch-v29">
        <div><span className="eyebrow"><Sparkles size={15}/> KHO QUÀ HỌC THUẬT</span><h1>Gửi một món quà, tiếp sức một hành trình tri thức</h1><p>Bộ quà mới có hình minh họa riêng và hiệu ứng nghi thức khi gửi. Điểm ủng hộ chỉ dùng trong cộng đồng, không tự quy đổi thành tiền.</p></div>
        <div className="gift-vault-stats gift-vault-stats-v29"><div><Gift/><b>{formatNumber(totalSent)}</b><small>Điểm đã tặng</small></div><div><Star/><b>{formatNumber(totalReceived)}</b><small>Điểm đã nhận</small></div><div><Sparkles/><b>{state.giftStore.length}</b><small>Mẫu quà</small></div></div>
      </section>

      <section className="panel-universe gift-collection-panel-v29 frame-style-vine-v29">
        <div className="panel-title-row"><div><span className="section-kicker">BỘ SƯU TẬP 2026</span><h2>Bộ quà tri ân được vẽ riêng</h2><p>Mỗi thẻ dùng bố cục khác nhau theo cấp hiệu ứng: nhỏ, vừa, lớn và đại cảnh.</p></div></div>
        <div className="gift-catalog-grid gift-catalog-grid-v29">{state.giftStore.map((gift, index) => (
          <article key={gift.id} className={`gift-catalog-card-v29 gift-rarity-${gift.effect} gift-layout-${index % 4}`}>
            <div className="gift-card-art-wrap-v29"><GiftArtwork gift={gift} size="catalog"/><span>{gift.effect === 'mega' ? 'ĐẠI CẢNH' : gift.effect === 'big' ? 'NỔI BẬT' : gift.effect === 'medium' ? 'MỞ RỘNG' : 'TINH GỌN'}</span></div>
            <div className="gift-card-copy-v29"><small>QUÀ TRI ÂN #{String(index + 1).padStart(2, '0')}</small><h3>{gift.name}</h3><p>Nghi thức chuyển động và hiệu ứng lá vàng xuất hiện ngay sau khi gửi.</p><b>{formatNumber(gift.credit)} credit</b></div>
          </article>
        ))}</div>
      </section>

      <div className="gift-history-grid gift-history-grid-v29">
        <section className="panel-universe frame-style-book-v29"><div className="panel-title-row"><div><h2>Lịch sử đã tặng</h2><p>{mine.length} giao dịch gần nhất</p></div></div><div className="history-list custom-scroll">{mine.map((item) => <HistoryRow key={item.id} item={item} user={getUser(item.userId)} gift={state.giftStore.find((gift) => gift.id === item.giftId)} />)}{!mine.length && <p className="muted">Bạn chưa tặng quà.</p>}</div></section>
        <section className="panel-universe frame-style-vine-v29"><div className="panel-title-row"><div><h2>Lịch sử đã nhận</h2><p>{received.length} giao dịch gần nhất</p></div></div><div className="history-list custom-scroll">{received.map((item) => <HistoryRow key={item.id} item={item} user={getUser(item.userId)} gift={state.giftStore.find((gift) => gift.id === item.giftId)} />)}{!received.length && <p className="muted">Chưa có quà được nhận.</p>}</div></section>
      </div>
    </div>
  );
}

function HistoryRow({ item, user, gift }) {
  return <div className="gift-history-row gift-history-row-v29"><GiftArtwork gift={gift || { name:item.giftName, theme:'star' }} size="mini"/><Avatar user={user}/><div><b>{user.name}</b><small>{item.giftName} · {item.targetType === 'document' ? 'Tài liệu' : 'Bài đăng'}</small></div><strong>+{formatNumber(item.credit)} điểm</strong><time>{item.date}</time></div>;
}
