import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Flame,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
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

const SECTION_LIMIT = 14;

function mergeStats(documents, stats) {
  const statsMap = new Map(
    (stats || []).map((item) => [
      item.document_id,
      item,
    ]),
  );

  return (documents || []).map((item) => ({
    ...item,
    document_stats: statsMap.get(item.id) || {},
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

function HomeCarouselSection({
  tone,
  icon: Icon,
  title,
  description,
  linkLabel,
  documents,
  emptyTitle,
  emptyDescription,
}) {
  const railRef = useRef(null);

  function scroll(direction) {
    const rail = railRef.current;

    if (!rail) return;

    const distance = Math.max(
      340,
      Math.round(rail.clientWidth * 0.78),
    );

    rail.scrollBy({
      left: direction * distance,
      behavior: 'smooth',
    });
  }

  return (
    <section
      className={`home-carousel-section-v75 home-carousel-section-v75--${tone}`}
    >
      <div className="home-carousel-heading-v75">
        <div className="home-carousel-heading-v75__title">
          <span className="home-carousel-heading-v75__icon">
            <Icon size={17} />
          </span>

          <span>
            <h2>{title}</h2>
            <small>{description}</small>
          </span>
        </div>

        <div className="home-carousel-heading-v75__actions">
          <button
            type="button"
            className="home-carousel-arrow-v75"
            aria-label={`Xem tài liệu ${title} phía trước`}
            onClick={() => scroll(-1)}
          >
            <ArrowLeft size={15} />
          </button>

          <button
            type="button"
            className="home-carousel-arrow-v75"
            aria-label={`Xem thêm tài liệu ${title}`}
            onClick={() => scroll(1)}
          >
            <ArrowRight size={15} />
          </button>

          <Link to="/documents">
            {linkLabel}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {documents.length ? (
        <div
          ref={railRef}
          className="home-document-rail-v75"
        >
          {documents.map((item) => (
            <div
              key={item.id}
              className="home-document-item-v75"
            >
              <DocumentCard document={item} />
            </div>
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
  const [showSuggestions, setShowSuggestions] = useState(false);

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
            .limit(60),

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
              .limit(40),
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

        if (statsResult.error) {
          throw statsResult.error;
        }

        const normalized = (
          documentsResult.data || []
        ).map((item) => ({
          ...item,
          cover_path: item.document_files?.find(
            (file) => file.file_kind === 'cover',
          )?.storage_path || item.cover_path || null,
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
  }, [
    currentUser?.id,
    toast,
  ]);

  const hottest = useMemo(
    () => (
      [...documents]
        .sort((a, b) => hotScore(b) - hotScore(a))
        .slice(0, SECTION_LIMIT)
    ),
    [documents],
  );

  const recommended = useMemo(() => {
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

    return sorted.slice(0, SECTION_LIMIT);
  }, [
    documents,
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
        .slice(0, SECTION_LIMIT)
    ),
    [documents],
  );

  const suggestions = useMemo(() => {
    const query = keyword.trim().toLocaleLowerCase('vi');

    if (!query) return [];

    return documents
      .filter((item) => {
        const searchable = [
          item.title,
          item.description,
          item.categories?.name,
          item.profiles?.full_name,
          item.profiles?.username,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('vi');

        return searchable.includes(query);
      })
      .slice(0, 7);
  }, [
    documents,
    keyword,
  ]);

  function search(event) {
    event.preventDefault();

    const query = keyword.trim();

    setShowSuggestions(false);

    navigate(
      query
        ? `/documents?search=${encodeURIComponent(query)}`
        : '/documents',
    );
  }

  function openSuggestion(item) {
    setShowSuggestions(false);
    setKeyword(item.title || '');

    navigate(`/documents/${item.id}`);
  }

  return (
    <div className="page home-page home-page-v75">
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
          className="hero-search home-search-v75"
          onSubmit={search}
        >
          <Search size={20} />

          <input
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Tìm kiếm tài liệu, môn học, tác giả, trường học..."
            autoComplete="off"
          />

          <button
            className="button"
            type="submit"
          >
            Tìm kiếm
          </button>

          {showSuggestions && keyword.trim() ? (
            <div className="home-search-suggestions-v75">
              {suggestions.length ? (
                suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="home-search-suggestion-v75"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => openSuggestion(item)}
                  >
                    <span className="home-search-suggestion-v75__icon">
                      <Search size={14} />
                    </span>

                    <span className="home-search-suggestion-v75__text">
                      <strong>{item.title}</strong>

                      <small>
                        {item.categories?.name || 'Tài liệu'}
                        {' · '}
                        {item.profiles?.full_name
                          || item.profiles?.username
                          || 'Tác giả'}
                      </small>
                    </span>
                  </button>
                ))
              ) : (
                <div className="home-search-suggestion-v75 home-search-suggestion-v75--empty">
                  Không tìm thấy gợi ý phù hợp.
                </div>
              )}
            </div>
          ) : null}
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
        <div className="home-carousel-stack-v75">
          <HomeCarouselSection
            tone="hot"
            icon={Flame}
            title="Hot nhất"
            description="Tài liệu đang được cộng đồng quan tâm nhiều."
            linkLabel="Xem bảng hot"
            documents={hottest}
            emptyTitle="Chưa có tài liệu nổi bật"
            emptyDescription="Các tài liệu có nhiều lượt xem và tương tác sẽ xuất hiện tại đây."
          />

          <HomeCarouselSection
            tone="recommended"
            icon={Sparkles}
            title="Phù hợp với bạn"
            description="Gợi ý dựa trên danh mục và hoạt động gần đây."
            linkLabel="Khám phá thêm"
            documents={recommended}
            emptyTitle="Chưa có gợi ý phù hợp"
            emptyDescription="Hãy xem, thích hoặc lưu tài liệu để hệ thống hiểu sở thích của bạn."
          />

          <HomeCarouselSection
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
    </div>
  );
}
