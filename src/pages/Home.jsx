import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import DocumentCard from '../components/DocumentCard.jsx';
import { getScore, formatNumber } from '../utils/helpers.js';

export default function Home() {
  const navigate = useNavigate();
  const { state, currentUser } = useApp();
  const [q, setQ] = useState('');
  const topToday = useMemo(() => [...state.documents].sort((a, b) => b.likes - a.likes).slice(0, 3), [state.documents]);
  const recommended = useMemo(() => [...state.documents].sort((a, b) => getScore(b, currentUser, state.likes.documents) - getScore(a, currentUser, state.likes.documents)).slice(0, 4), [state.documents, currentUser, state.likes.documents]);
  const hot = ['python cơ bản', 'cơ sở dữ liệu', 'react vite', 'supabase', 'giải tích 1', 'kỹ năng viết tin'];

  function submit(e) {
    e.preventDefault();
    navigate(q.trim() ? `/documents?q=${encodeURIComponent(q.trim())}` : '/documents');
  }

  return (
    <div className="page home-page">
      <section className="hero-pro">
        <div className="hero-copy">
          <span className="eyebrow">DOCSHARE PRO</span>
          <h1>Kho tài liệu học tập, mạng xã hội học thuật và chợ tài liệu số.</h1>
          <p>Tìm tài liệu, xem trước demo, theo dõi tác giả, donate bằng credit và học cùng cộng đồng.</p>
          <form className="hero-search" onSubmit={submit}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nhập môn học, tài liệu, trường, tag..." />
            <button>Tìm kiếm</button>
          </form>
          <div className="hot-row"><b>Hot search:</b>{hot.map((item) => <button key={item} onClick={() => navigate(`/documents?q=${encodeURIComponent(item)}`)}>{item}</button>)}</div>
          <div className="hero-stats">
            <div><b>{formatNumber(state.documents.length * 1200)}+</b><span>Tài liệu</span></div>
            <div><b>{formatNumber(state.users.length * 3600)}+</b><span>Thành viên</span></div>
            <div><b>Premium</b><span>Nội dung cao cấp</span></div>
          </div>
        </div>
        <div className="hero-art">
          {topToday.map((doc, index) => <div key={doc.id} className={`floating-doc f${index + 1}`}><span>{doc.type}</span><b>{doc.cover}</b><strong>{doc.title}</strong><small>{doc.likes} thích · {doc.subject}</small></div>)}
        </div>
      </section>

      <section className="two-row-showcase">
        <div className="panel showcase-box">
          <div className="section-head compact"><div><h2>Top được yêu thích nhất hôm nay</h2><p>3 tài liệu có nhiều lượt thích nhất.</p></div><Link to="/leaderboard">Xem xếp hạng →</Link></div>
          <div className="doc-grid top-three">{topToday.map((doc) => <DocumentCard key={doc.id} doc={doc} compact />)}</div>
        </div>
        <div className="panel showcase-box">
          <div className="section-head compact"><div><h2>Gợi ý cho bạn</h2><p>Dựa trên lượt thích, lịch sử xem, tag và ngành học.</p></div><Link to="/documents">Xem thêm →</Link></div>
          <div className="doc-grid suggested-grid">{recommended.map((doc) => <DocumentCard key={doc.id} doc={doc} compact />)}</div>
        </div>
      </section>

      <section className="section-head"><div><h2>Danh mục nổi bật</h2><p>Chọn nhanh lĩnh vực đang cần học.</p></div><Link to="/categories">Xem tất cả →</Link></section>
      <div className="category-strip">{state.categories.slice(1, 9).map((cat) => <Link to={`/documents?cat=${cat.id}`} key={cat.id} className="category-pill"><span>{cat.icon}</span><b>{cat.name}</b><small>{cat.count} tài liệu</small></Link>)}</div>
    </div>
  );
}
