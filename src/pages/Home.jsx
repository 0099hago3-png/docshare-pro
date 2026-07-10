import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, LibraryBig, Search, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import DocumentCard from '../components/DocumentCard.jsx';
import BookCover from '../components/BookCover.jsx';
import { getScore, formatNumber } from '../utils/helpers.js';

export default function Home() {
  const navigate = useNavigate();
  const { state, currentUser } = useApp();
  const [q, setQ] = useState('');
  const topToday = useMemo(() => [...state.documents].sort((a, b) => b.likes - a.likes).slice(0, 3), [state.documents]);
  const recommended = useMemo(() => [...state.documents].sort((a, b) => getScore(b, currentUser, state.likes.documents) - getScore(a, currentUser, state.likes.documents)).slice(0, 4), [state.documents, currentUser, state.likes.documents]);
  const hot = ['python cơ bản', 'cơ sở dữ liệu', 'react vite', 'supabase', 'giải tích 1', 'kỹ năng viết tin'];

  function submit(event) {
    event.preventDefault();
    navigate(q.trim() ? `/documents?q=${encodeURIComponent(q.trim())}` : '/documents');
  }

  return (
    <div className="page home-page home-library-v24">
      <section className="hero-pro library-hero-v24">
        <div className="hero-copy">
          <span className="eyebrow"><LibraryBig size={15}/> THƯ VIỆN HỌC THUẬT DOCSHARE</span>
          <h1>Tri thức được tuyển chọn, trình bày như một thư viện hiện đại.</h1>
          <p>Khám phá tài liệu chất lượng, xem trước nội dung, theo dõi tác giả và xây dựng hành trình học tập trong một không gian sáng, rõ ràng và chuyên nghiệp.</p>
          <form className="hero-search" onSubmit={submit}>
            <Search size={19}/>
            <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Tìm theo môn học, tài liệu, trường hoặc hashtag..." />
            <button>Tìm kiếm</button>
          </form>
          <div className="hot-row"><b>Gợi ý:</b>{hot.map((item) => <button key={item} onClick={() => navigate(`/documents?q=${encodeURIComponent(item)}`)}>{item}</button>)}</div>
          <div className="hero-stats">
            <div><BookOpen size={20}/><span><b>{formatNumber(state.documents.length * 1200)}+</b><small>Tài liệu học thuật</small></span></div>
            <div><LibraryBig size={20}/><span><b>{formatNumber(state.users.length * 3600)}+</b><small>Thành viên</small></span></div>
            <div><ShieldCheck size={20}/><span><b>Kiểm duyệt</b><small>Nội dung đáng tin cậy</small></span></div>
          </div>
          <Link className="hero-library-link" to="/documents">Khám phá thư viện <ArrowRight size={17}/></Link>
        </div>
        <div className="hero-art library-bookshelf-v24" aria-label="Bộ sưu tập tài liệu nổi bật">
          <div className="bookshelf-label"><span>Ấn phẩm nổi bật</span><small>Tuyển chọn bởi cộng đồng DocShare</small></div>
          <div className="bookshelf-row">
            {topToday.map((doc, index) => <BookCover key={doc.id} doc={doc} size="hero" className={`hero-book-${index + 1}`}/>) }
          </div>
          <div className="bookshelf-base" />
        </div>
      </section>

      <section className="two-row-showcase library-showcase-v24">
        <div className="panel showcase-box">
          <div className="section-head compact"><div><span className="section-kicker">ĐƯỢC CỘNG ĐỒNG ĐỀ XUẤT</span><h2>Tài liệu được yêu thích nhất</h2><p>Những ấn phẩm nhận nhiều lượt lưu và đánh giá tích cực.</p></div><Link to="/leaderboard">Xem xếp hạng <ArrowRight size={15}/></Link></div>
          <div className="doc-grid top-three">{topToday.map((doc) => <DocumentCard key={doc.id} doc={doc} compact />)}</div>
        </div>
        <div className="panel showcase-box">
          <div className="section-head compact"><div><span className="section-kicker">DÀNH RIÊNG CHO BẠN</span><h2>Gợi ý theo hành trình học tập</h2><p>Dựa trên lượt thích, lịch sử xem, hashtag và ngành học.</p></div><Link to="/documents">Xem thêm <ArrowRight size={15}/></Link></div>
          <div className="doc-grid suggested-grid">{recommended.map((doc) => <DocumentCard key={doc.id} doc={doc} compact />)}</div>
        </div>
      </section>

      <section className="section-head library-category-head"><div><span className="section-kicker">DANH MỤC TRI THỨC</span><h2>Khám phá theo lĩnh vực</h2><p>Chọn nhanh ngành học và chủ đề bạn đang quan tâm.</p></div><Link to="/categories">Xem tất cả <ArrowRight size={15}/></Link></section>
      <div className="category-strip library-category-strip">{state.categories.slice(1, 9).map((cat) => <Link to={`/documents?cat=${cat.id}`} key={cat.id} className="category-pill"><span>{cat.icon}</span><div><b>{cat.name}</b><small>{formatNumber(cat.count)} tài liệu</small></div></Link>)}</div>
    </div>
  );
}
