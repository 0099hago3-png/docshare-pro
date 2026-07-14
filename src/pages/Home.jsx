import { ArrowRight, BookHeart, BookOpen, GraduationCap, Search, ShieldCheck, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BotanicalHero from '../components/BotanicalHero.jsx';
import DocumentCard from '../components/DocumentCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import { useApp } from '../context/AppContext.jsx';
import { supabase } from '../lib/supabase.js';
import { normalizeError } from '../lib/helpers.js';

function mergeStats(documents, stats) {
  const map = new Map((stats || []).map((item) => [item.document_id, item]));
  return (documents || []).map((item) => ({ ...item, document_stats: map.get(item.id) || {} }));
}

export default function Home() {
  const { toast } = useApp();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [{ data: docs, error }, { data: stats }] = await Promise.all([
          supabase.from('documents').select('*,profiles:author_id(id,full_name,username,avatar_path,role,premium,premium_expires_at),categories(id,name,slug,icon_key),document_files(file_kind,storage_bucket,storage_path)').eq('status', 'published').order('created_at', { ascending: false }).limit(12),
          supabase.from('document_stats').select('*'),
        ]);
        if (error) throw error;
        const normalized = (docs || []).map((item) => ({
          ...item,
          cover_path: item.document_files?.find((file) => file.file_kind === 'cover')?.storage_path || null,
        }));
        if (mounted) setDocuments(mergeStats(normalized, stats));
      } catch (error) {
        toast(normalizeError(error), 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [toast]);

  const loved = useMemo(() => [...documents].sort((a, b) => (b.document_stats?.like_count || 0) - (a.document_stats?.like_count || 0)).slice(0, 4), [documents]);
  const recommended = useMemo(() => documents.slice(4, 8), [documents]);

  function search(event) {
    event.preventDefault();
    navigate(keyword.trim() ? `/documents?search=${encodeURIComponent(keyword.trim())}` : '/documents');
  }

  return (
    <div className="page home-page">
      <BotanicalHero eyebrow="DOCSHARE PRO" title={<>Thư viện học thuật hiện đại<br /><span>Chia sẻ & kết nối tri thức</span></>} description="Kho tài liệu chất lượng, cộng đồng học tập văn minh và hành trình phát triển tri thức của riêng bạn.">
        <form className="hero-search" onSubmit={search}><Search size={20} /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm kiếm tài liệu, môn học, tác giả, trường học..." /><button className="button" type="submit">Tìm kiếm</button></form>
        <div className="hero-tags"><span>Tìm kiếm phổ biến:</span>{['Giải tích', 'Cấu trúc dữ liệu', 'Marketing', 'Kinh tế vi mô', 'Luật dân sự', 'Trí tuệ nhân tạo'].map((item) => <button key={item} type="button" onClick={() => navigate(`/documents?search=${encodeURIComponent(item)}`)}>{item}</button>)}</div>
      </BotanicalHero>

      {loading ? <Loading /> : (
        <>
          <section className="home-section">
            <div className="section-heading"><div><BookHeart size={24} /><h2>Tài liệu được yêu thích nhất</h2></div><Link to="/documents">Xem tất cả <ArrowRight size={17} /></Link></div>
            {loved.length ? <div className="document-grid document-grid--4">{loved.map((item) => <DocumentCard key={item.id} document={item} />)}</div> : <EmptyState title="Chưa có tài liệu" description="Tài liệu do người dùng đăng sẽ xuất hiện tại đây." action={<Link className="button" to="/upload">Đăng tài liệu đầu tiên</Link>} />}
          </section>

          <section className="home-section">
            <div className="section-heading"><div><BookOpen size={24} /><h2>Gợi ý cho bạn</h2></div><Link to="/documents">Khám phá thêm <ArrowRight size={17} /></Link></div>
            {recommended.length ? <div className="document-grid document-grid--4">{recommended.map((item) => <DocumentCard key={item.id} document={item} />)}</div> : <EmptyState title="Chưa có gợi ý" description="Hãy đăng hoặc tương tác với tài liệu để xây dựng hành trình học tập." />}
          </section>
        </>
      )}

      <section className="impact-strip botanical-card">
        <div><span><BookOpen /></span><strong>{documents.length}+</strong><small>Tài liệu học thuật</small></div>
        <div><span><Users /></span><strong>Cộng đồng</strong><small>Học tập văn minh</small></div>
        <div><span><GraduationCap /></span><strong>Đa ngành</strong><small>Kết nối tri thức</small></div>
        <div><span><ShieldCheck /></span><strong>Minh bạch</strong><small>Dữ liệu được bảo vệ</small></div>
      </section>
    </div>
  );
}
