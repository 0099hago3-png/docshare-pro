import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark, Download, Eye, FileText, Heart, MessageCircle, PenLine, Search, Star,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const tabs = [
  ['view', 'Đã xem', Eye],
  ['like', 'Đã thích', Heart],
  ['saved', 'Đã lưu', Bookmark],
  ['comment', 'Đã bình luận', MessageCircle],
  ['review', 'Đã đánh giá', Star],
  ['download', 'Đã tải', Download],
  ['post', 'Đã đăng', PenLine],
];

export default function History() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('view');
  const [query, setQuery] = useState('');

  const itemsByType = useMemo(() => {
    const map = Object.fromEntries(tabs.map(([key]) => [key, []]));
    (state.history || []).forEach((item) => {
      const key = item.type === 'saved' ? 'saved' : item.type === 'rating' ? 'review' : item.type;
      if (map[key]) map[key].push(item);
    });
    state.savedDocuments?.forEach((id) => {
      if (!map.saved.some((item) => item.targetId === id)) {
        const doc = state.documents.find((item) => item.id === id);
        if (doc) map.saved.push({ id: `saved-${id}`, type: 'saved', targetId: id, title: `Đã lưu ${doc.title}`, date: 'Trong danh sách yêu thích' });
      }
    });
    state.posts?.filter((post) => post.authorId === state.currentUserId).forEach((post) => map.post.push({ id: `post-${post.id}`, type: 'post', targetId: post.id, title: post.title || post.content, date: post.createdAt }));
    return map;
  }, [state]);

  const visible = (itemsByType[activeTab] || []).filter((item) => String(item.title || '').toLowerCase().includes(query.toLowerCase()));
  const activeMeta = tabs.find(([key]) => key === activeTab);
  const ActiveIcon = activeMeta?.[2] || Eye;

  function targetLink(item) {
    if (item.type === 'post') return '/feed';
    return item.targetId ? `/documents/${item.targetId}` : '/documents';
  }

  return (
    <div className="page universe-page history-v22-page">
      <section className="history-v22-hero">
        <div><span className="eyebrow">NHẬT KÝ CÁ NHÂN</span><h1>Lịch sử hoạt động</h1><p>Mỗi loại hoạt động được tách riêng để dễ tìm và không bị dồn rối trong một danh sách.</p></div>
        <div className="history-summary-v22">{tabs.slice(0, 6).map(([key, label, Icon]) => <button key={key} className={activeTab === key ? 'active' : ''} onClick={() => setActiveTab(key)}><Icon/><span><b>{itemsByType[key]?.length || 0}</b><small>{label}</small></span></button>)}</div>
      </section>

      <section className="panel-universe history-shell-v22">
        <div className="history-tabs-v22 custom-scroll">{tabs.map(([key, label, Icon]) => <button key={key} className={activeTab === key ? 'active' : ''} onClick={() => setActiveTab(key)}><Icon size={17}/>{label}<em>{itemsByType[key]?.length || 0}</em></button>)}</div>
        <div className="history-toolbar-v22"><div><ActiveIcon/><span><h2>{activeMeta?.[1]}</h2><p>{visible.length} hoạt động</p></span></div><label><Search size={16}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm trong mục này..."/></label></div>

        <div className="history-panel-v22">
          {visible.length ? visible.map((item) => <Link to={targetLink(item)} key={item.id} className="history-row-v22"><span className={`history-icon-v22 type-${activeTab}`}><ActiveIcon/></span><div><b>{item.title}</b><small>{item.date}</small></div><em>Xem chi tiết →</em></Link>) : <div className="history-empty-v22"><ActiveIcon/><h3>Chưa có hoạt động trong mục “{activeMeta?.[1]}”</h3><p>Khi bạn sử dụng DocShare, lịch sử tương ứng sẽ xuất hiện tại đây.</p><Link to="/documents">Khám phá tài liệu</Link></div>}
        </div>
      </section>
    </div>
  );
}
