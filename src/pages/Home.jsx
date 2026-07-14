import {
  ArrowRight,
  Clock3,
  Flame,
  GraduationCap,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Link,
  useNavigate,
} from 'react-router-dom';

import BotanicalHero from '../components/BotanicalHero.jsx';
import DocumentCard from '../components/DocumentCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import { useApp } from '../context/AppContext.jsx';
import { normalizeError } from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';

function mergeStats(documents, stats) {
  const map = new Map(
    (stats || []).map((item) => [
      item.document_id,
      item,
    ]),
  );

  return (documents || []).map((item) => ({
    ...item,
    document_stats: map.get(item.id) || {},
  }));
}

function hotScore(item) {
  const stats = item.document_stats || {};

  return (
    Number(stats.like_count || 0) * 8
    + Number(stats.download_count || 0) * 5
    + Number(stats.comment_count || 0) * 4
    + Number(stats.view_count || 0)
    + Number(stats.average_rating || 0) * 10
  );
}

function CompactDocumentSection({
  tone,
  icon: Icon,
  title,
  description,
  linkLabel,
  documents,
  emptyTitle,
  emptyDescription,
}) {
  return (
    <section
      className={[
        'home-section',
        'home-section--compact-v71',
        `home-section--${tone}-v71`,
      ].join(' ')}
    >
      <div className="section-heading section-heading--compact-v71">
        <div className="section-heading__main-v71">
          <span className="section-heading__icon-v71">
            <Icon size={19} />
          </span>

          <span>
            <h2>{title}</h2>
            <small>{description}</small>
          </span>
        </div>

        <Link to="/documents">
          {linkLabel}
          <ArrowRight size={15} />
        </Link>
      </div>

      {documents.length ? (
        <div className="document-grid home-document-grid-v71">
          {documents.map((item) => (
            <DocumentCard
              key={item.id}
              document={item}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
        />
      )}
    </section>
  );
}

export default function Home() {
  const {
    currentUser,
    toast,
  } = useApp();

  const [documents, setDocuments] = useState([]);
  const [preferredCategoryIds, setPreferredCategoryIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const requests = [
          supabase
            .from('documents')
            .select(`
              *,
              profiles:author_id(
                id,
                full_name,
                username,
                avatar_path,
                role,
                premium,
                premium_expires_at
              ),
              categories(
                id,
                name,
                slug,
                icon_key
              ),
              document_files(
                file_kind,
                storage_bucket,
                storage_path
              )
            `)
            .eq('status', 'published')
            .order('created_at', {
              ascending: false,
            })
            .limit(24),

          supabase
            .from('document_stats')
            .select('*'),
        ];

        if (currentUser?.id) {
          requests.push(
            supabase
              .from('activity_history')
              .select(`
                target_id,
                target_type,
                action_type,
                created_at
              `)
              .eq('user_id', currentUser.id)
              .eq('target_type', 'document')
              .order('created_at', {
                ascending: false,
              })
              .limit(30),
          );
        }

        const [
          documentsResult,
          statsResult,
          historyResult,
        ] = await Promise.all(requests);

        if (documentsResult.error) {
          throw documentsResult.error;
        }

        const normalized = (
          documentsResult.data || []
        ).map((item) => ({
          ...item,
          cover_path: item.document_files?.find(
            (file) => file.file_kind === 'cover',
          )?.storage_path || null,
        }));

        const merged = mergeStats(
          normalized,
          statsResult.data || [],
        );

        const interactedIds = new Set(
          (historyResult?.data || [])
            .map((item) => item.target_id)
            .filter(Boolean),
        );

        const categoryIds = [
          ...new Set(
            merged
              .filter((item) => interactedIds.has(item.id))
              .map((item) => item.category_id)
              .filter(Boolean),
          ),
        ];

        if (mounted) {
          setDocuments(merged);
          setPreferredCategoryIds(categoryIds);
        }
      } catch (error) {
        toast(normalizeError(error), 'error');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [currentUser?.id, toast]);

  const hottest = useMemo(
    () => (
      [...documents]
        .sort((a, b) => hotScore(b) - hotScore(a))
        .slice(0, 4)
    ),
    [documents],
  );

  const recommended = useMemo(() => {
    const hotIds = new Set(
      hottest.map((item) => item.id),
    );

    const sorted = [...documents].sort((a, b) => {
      const aPreferred = preferredCategoryIds.includes(
        a.category_id,
      ) ? 1 : 0;

      const bPreferred = preferredCategoryIds.includes(
        b.category_id,
      ) ? 1 : 0;

      if (aPreferred !== bPreferred) {
        return bPreferred - aPreferred;
      }

      return hotScore(b) - hotScore(a);
    });

    const uniqueFirst = sorted.filter(
      (item) => !hotIds.has(item.id),
    );

    return (
      uniqueFirst.length >= 4
        ? uniqueFirst
        : sorted
    ).slice(0, 4);
  }, [
    documents,
    hottest,
    preferredCategoryIds,
  ]);

  const newest = useMemo(
    () => (
      [...documents]
        .sort(
          (a, b) => (
            new Date(b.created_at).getTime()
            - new Date(a.created_at).getTime()
          ),
        )
        .slice(0, 4)
    ),
    [documents],
  );

  function search(event) {
    event.preventDefault();

    navigate(
      keyword.trim()
        ? `/documents?search=${encodeURIComponent(keyword.trim())}`
        : '/documents',
    );
  }

  return (
    <div className="page home-page home-page--v71">
      <BotanicalHero
        eyebrow="DOCSHARE PRO"
        title={(
          <>
            Thư viện học thuật hiện đại
            <br />
            <span>Chia sẻ & kết nối tri thức</span>
          </>
        )}
        description="Kho tài liệu chất lượng, cộng đồng học tập văn minh và hành trình phát triển tri thức của riêng bạn."
      >
        <form
          className="hero-search"
          onSubmit={search}
        >
          <Search size={20} />

          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm kiếm tài liệu, môn học, tác giả, trường học..."
          />

          <button
            className="button"
            type="submit"
          >
            Tìm kiếm
          </button>
        </form>

        <div className="hero-tags">
          <span>Tìm kiếm phổ biến:</span>

          {[
            'Giải tích',
            'Cấu trúc dữ liệu',
            'Marketing',
            'Kinh tế vi mô',
            'Luật dân sự',
            'Trí tuệ nhân tạo',
          ].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => navigate(
                `/documents?search=${encodeURIComponent(item)}`,
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </BotanicalHero>

      {loading ? (
        <Loading />
      ) : (
        <div className="home-sections-v71">
          <CompactDocumentSection
            tone="hot"
            icon={Flame}
            title="Hot nhất"
            description="Tài liệu đang được cộng đồng quan tâm nhiều."
            linkLabel="Xem bảng hot"
            documents={hottest}
            emptyTitle="Chưa có tài liệu nổi bật"
            emptyDescription="Các tài liệu có nhiều lượt xem và tương tác sẽ xuất hiện tại đây."
          />

          <CompactDocumentSection
            tone="recommended"
            icon={Sparkles}
            title="Phù hợp với bạn"
            description="Gợi ý dựa trên ngành học và hoạt động gần đây."
            linkLabel="Khám phá thêm"
            documents={recommended}
            emptyTitle="Chưa có gợi ý phù hợp"
            emptyDescription="Hãy xem, thích hoặc lưu tài liệu để hệ thống hiểu sở thích của bạn."
          />

          <CompactDocumentSection
            tone="new"
            icon={Clock3}
            title="Mới nhất"
            description="Những tài liệu vừa được cộng đồng đăng tải."
            linkLabel="Xem tài liệu mới"
            documents={newest}
            emptyTitle="Chưa có tài liệu mới"
            emptyDescription="Tài liệu mới do người dùng đăng sẽ xuất hiện tại đây."
          />
        </div>
      )}

      <section className="impact-strip botanical-card impact-strip--compact-v71">
        <div>
          <span><Clock3 /></span>
          <strong>{documents.length}+</strong>
          <small>Tài liệu đang hiển thị</small>
        </div>

        <div>
          <span><Users /></span>
          <strong>Cộng đồng</strong>
          <small>Học tập văn minh</small>
        </div>

        <div>
          <span><GraduationCap /></span>
          <strong>Đa ngành</strong>
          <small>Kết nối tri thức</small>
        </div>

        <div>
          <span><ShieldCheck /></span>
          <strong>Minh bạch</strong>
          <small>Dữ liệu được bảo vệ</small>
        </div>
      </section>
    </div>
  );
}
