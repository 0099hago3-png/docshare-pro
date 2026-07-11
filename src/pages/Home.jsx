import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
  ArrowRight, BookMarked, BookOpen, ChevronLeft, ChevronRight, LibraryBig, Quote, Search, ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import DocumentCard from '../components/DocumentCard.jsx';
import BookCover from '../components/BookCover.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';
import { getScore, formatNumber } from '../utils/helpers.js';

export default function Home() {
  const navigate = useNavigate();
  const { state, currentUser } = useApp();
  const [q, setQ] = useState('');
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const topToday = useMemo(() => [...state.documents].sort((a, b) => b.likes - a.likes).slice(0, 3), [state.documents]);
  const recommended = useMemo(() => [...state.documents].sort((a, b) => getScore(b, currentUser, state.likes.documents) - getScore(a, currentUser, state.likes.documents)).slice(0, 4), [state.documents, currentUser, state.likes.documents]);
  const hot = ['python cơ bản', 'cơ sở dữ liệu', 'react vite', 'supabase', 'giải tích 1', 'kỹ năng viết tin'];

  function submit(event) {
    event.preventDefault();
    navigate(q.trim() ? `/documents?q=${encodeURIComponent(q.trim())}` : '/documents');
  }

  function openFeaturedDocument() {
    const current = topToday[featuredIndex];
    if (!current) return;
    navigate(`/documents/${current.id}`);
  }

  return (
    <div className="page home-page home-library-v25">
      <section className="hero-pro library-hero-v25">
        <div className="library-ambient-lines" aria-hidden="true"/>
        <div className="hero-copy">
          <span className="eyebrow"><LibraryBig size={15}/> THƯ VIỆN HỌC THUẬT DOCSHARE PRO</span>
          <h1>Không gian tri thức hiện đại dành cho học tập nghiêm túc.</h1>
          <p>Khám phá tài liệu chất lượng, theo dõi tác giả và xây dựng thư viện cá nhân trong một trải nghiệm sáng, tinh gọn và chuyên nghiệp.</p>
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

        <div className="hero-art library-scene-v25 library-flip-showcase-v28" aria-label="Sổ tài liệu nổi bật có thể lật trang">
          <div className="library-scene-heading"><span>Sổ tay tài liệu nổi bật</span><small>Dùng mũi tên để lật qua các tài liệu hot</small></div>
          <div className="library-window-v25" aria-hidden="true"><i/><i/><i/></div>
          <div className="featured-book-viewer-v28">
            <button className="featured-book-arrow prev" aria-label="Tài liệu trước" onClick={() => setFeaturedIndex((value) => (value - 1 + topToday.length) % topToday.length)}><ChevronLeft size={24}/></button>
            <button type="button" className="featured-open-book-v28 featured-open-book-button-v30" key={topToday[featuredIndex]?.id} onClick={openFeaturedDocument}>
              <div className="featured-page-v28 left-page">
                <span className="featured-page-kicker">DOCSHARE PRO · TUYỂN CHỌN</span>
                <h3>{topToday[featuredIndex]?.title}</h3>
                <p>{topToday[featuredIndex]?.description || 'Tài liệu học thuật được cộng đồng quan tâm và đánh giá tích cực trong tuần.'}</p>
                <div className="featured-book-meta-v28"><span>{topToday[featuredIndex]?.subject}</span><span>{formatNumber(topToday[featuredIndex]?.likes)} lượt yêu thích</span></div>
                <span className="featured-open-hint-v30">Mở tài liệu</span>
              </div>
              <div className="featured-book-gutter-v28"/>
              <div className="featured-page-v28 right-page"><BookCover doc={topToday[featuredIndex]} size="hero" /></div>
            </button>
            <button className="featured-book-arrow next" aria-label="Tài liệu tiếp theo" onClick={() => setFeaturedIndex((value) => (value + 1) % topToday.length)}><ChevronRight size={24}/></button>
          </div>
          <div className="featured-book-dots-v28">{topToday.map((doc, index) => <button key={doc.id} aria-label={`Mở tài liệu ${index + 1}`} className={featuredIndex === index ? 'active' : ''} onClick={() => setFeaturedIndex(index)}/>)}</div>
          <div className="library-shelf-v25" aria-hidden="true"/>
          <div className="library-quote-v25"><Quote size={18}/><p>“Tri thức tốt nhất là tri thức được trình bày rõ ràng và có thể chia sẻ.”</p></div>
          <div className="library-seal-v25" aria-hidden="true"><BookMarked size={23}/><span>DOCSHARE<br/>CURATED</span></div>
        </div>
      </section>

      <section className="two-row-showcase library-showcase-v25">
        <div className="panel showcase-box">
          <div className="section-head compact"><div><span className="section-kicker">ĐƯỢC CỘNG ĐỒNG ĐỀ XUẤT</span><h2>Tài liệu được yêu thích nhất</h2><p>Những tài liệu nhận nhiều lượt lưu và đánh giá tích cực.</p></div><Link to="/leaderboard">Xem xếp hạng <ArrowRight size={15}/></Link></div>
          <div className="doc-grid top-three">{topToday.map((doc) => <DocumentCard key={doc.id} doc={doc} compact />)}</div>
        </div>
        <div className="panel showcase-box">
          <div className="section-head compact"><div><span className="section-kicker">DÀNH RIÊNG CHO BẠN</span><h2>Gợi ý theo hành trình học tập</h2><p>Dựa trên lượt thích, lịch sử xem, hashtag và ngành học.</p></div><Link to="/documents">Xem thêm <ArrowRight size={15}/></Link></div>
          <div className="doc-grid suggested-grid">{recommended.map((doc) => <DocumentCard key={doc.id} doc={doc} compact />)}</div>
        </div>
      </section>

      <section className="section-head library-category-head"><div><span className="section-kicker">DANH MỤC TRI THỨC</span><h2>Khám phá theo lĩnh vực</h2><p>Chọn nhanh ngành học và chủ đề bạn đang quan tâm.</p></div><Link to="/categories">Xem tất cả <ArrowRight size={15}/></Link></section>
      <div className="category-strip library-category-strip-v25">{state.categories.slice(1, 9).map((cat) => <Link to={`/documents?cat=${cat.id}`} key={cat.id} className="category-pill-v25"><span><CategoryIcon id={cat.id}/></span><div><b>{cat.name}</b><small>{formatNumber(cat.count)} tài liệu</small></div><ArrowRight size={16}/></Link>)}</div>
    </div>
  );
}
