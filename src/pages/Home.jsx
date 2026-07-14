import { BookHeart, BookOpen, Clock3, GraduationCap, ShieldCheck, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BotanicalHero from '../components/BotanicalHero.jsx';
import EmptyState from '../components/EmptyState.jsx';
import HomeDocumentRail from '../components/DocumentRail.jsx';
import Loading from '../components/Loading.jsx';
import { SmartSearchForm } from '../components/SmartSearch.jsx';
import { useApp } from '../context/AppContext.jsx';
import { normalizeError } from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';

function mergeStats(documents, stats) {
  const map = new Map((stats || []).map((item) => [item.document_id, item]));
  return (documents || []).map((item) => ({
    ...item,
    document_stats: map.get(item.id) || {},
  }));
}

export default function Home() {
  const { currentUser, toast } = useApp();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const purchaseQuery = currentUser?.id
          ? supabase.from('document_purchases').select('document_id').eq('buyer_id', currentUser.id)
          : Promise.resolve({ data: [] });

        const [{ data: docs, error }, { data: stats }, purchaseResult] = await Promise.all([
          supabase
            .from('documents')
            .select('*,profiles:author_id(id,full_name,username,avatar_path,role,premium,premium_expires_at),categories(id,name,slug,icon_key),document_files(file_kind,storage_bucket,storage_path)')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(40),
          supabase.from('document_stats').select('*'),
          purchaseQuery,
        ]);

        if (error) throw error;

        const purchasedIds = new Set((purchaseResult?.data || []).map((item) => item.document_id));
        const normalized = (docs || []).map((item) => ({
          ...item,
          cover_path: item.document_files?.find((file) => file.file_kind === 'cover')?.storage_path || null,
          is_purchased: purchasedIds.has(item.id),
        }));

        if (mounted) setDocuments(mergeStats(normalized, stats));
      } catch (error) {
        toast(normalizeError(error), 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [currentUser?.id, toast]);

  useEffect(() => {
    const markPurchased = (event) => {
      const ids = new Set([
        ...(event?.detail?.documentIds || []),
        event?.detail?.documentId,
      ].filter(Boolean));

      if (!ids.size) return;

      setDocuments((current) => current.map((item) => (
        ids.has(item.id) ? { ...item, is_purchased: true } : item
      )));
    };

    window.addEventListener('docshare:purchases-refresh', markPurchased);
    return () => window.removeEventListener('docshare:purchases-refresh', markPurchased);
  }, []);

  const latest = useMemo(() => documents.slice(0, 18), [documents]);

  const loved = useMemo(() => (
    [...documents]
      .sort((a, b) => (b.document_stats?.like_count || 0) - (a.document_stats?.like_count || 0))
      .slice(0, 18)
  ), [documents]);

  const recommended = useMemo(() => (
    [...documents]
      .sort((a, b) => {
        const scoreA = (a.document_stats?.view_count || 0)
          + ((a.document_stats?.like_count || 0) * 4)
          + ((a.document_stats?.average_rating || 0) * 5);
        const scoreB = (b.document_stats?.view_count || 0)
          + ((b.document_stats?.like_count || 0) * 4)
          + ((b.document_stats?.average_rating || 0) * 5);
        return scoreB - scoreA;
      })
      .slice(0, 18)
  ), [documents]);

  function submitSearch(value, suggestion) {
    if (suggestion?.to) {
      navigate(suggestion.to);
      return;
    }

    const searchValue = value.trim();
    navigate(searchValue ? `/documents?search=${encodeURIComponent(searchValue)}` : '/documents');
  }

  return (
    <div className="page home-page home-page-v70-3">
      <BotanicalHero
        description="Kho tài liệu chất lượng, cộng đồng học tập văn minh và hành trình phát triển tri thức của riêng bạn."
        eyebrow="DOCSHARE PRO"
        title={<>Thư viện học thuật hiện đại<br /><span>Chia sẻ & kết nối tri thức</span></>}
      >
        <SmartSearchForm
          buttonClassName="button"
          buttonLabel="Tìm kiếm"
          className="hero-search"
          onChange={setKeyword}
          onSubmit={submitSearch}
          placeholder="Tìm kiếm tài liệu, môn học, tác giả, trường học..."
          value={keyword}
        />
        <div className="hero-tags">
          <span>Tìm kiếm phổ biến:</span>
          {['Giải tích', 'Cấu trúc dữ liệu', 'Marketing', 'Kinh tế vi mô', 'Luật dân sự', 'Trí tuệ nhân tạo'].map((item) => (
            <button
              key={item}
              onClick={() => navigate(`/documents?search=${encodeURIComponent(item)}`)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </BotanicalHero>

      {loading ? <Loading /> : documents.length ? (
        <>
          <HomeDocumentRail
            documents={latest}
            icon={<Clock3 size={22} />}
            linkLabel="Xem tài liệu mới"
            title="Tài liệu mới nhất"
          />

          <HomeDocumentRail
            documents={loved}
            icon={<BookHeart size={22} />}
            title="Tài liệu được yêu thích nhất"
          />

          <HomeDocumentRail
            documents={recommended}
            icon={<BookOpen size={22} />}
            linkLabel="Khám phá thêm"
            title="Gợi ý cho bạn"
          />
        </>
      ) : (
        <EmptyState
          action={<Link className="button" to="/upload">Đăng tài liệu đầu tiên</Link>}
          description="Tài liệu do người dùng đăng sẽ xuất hiện tại đây."
          title="Chưa có tài liệu"
        />
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
