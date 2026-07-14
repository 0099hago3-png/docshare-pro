import { Filter, Grid2X2, List, SlidersHorizontal } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BotanicalHero from '../components/BotanicalHero.jsx';
import DocumentCard from '../components/DocumentCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import { SmartSearchInput } from '../components/SmartSearch.jsx';
import { useApp } from '../context/AppContext.jsx';
import { normalizeError } from '../lib/helpers.js';
import { rankDocuments } from '../lib/searchEngine.js';
import { supabase } from '../lib/supabase.js';

const DEFAULT_FILTERS = {
  search: '',
  category: '',
  price: '',
  sort: 'newest',
};

function documentDate(document) {
  return new Date(document?.created_at || 0).getTime();
}

export default function Documents() {
  const { currentUser, toast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allDocuments, setAllDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const [{ data, error }, { data: statRows, error: statError }, purchaseResult] = await Promise.all([
        supabase
          .from('documents')
          .select('*,profiles:author_id(id,full_name,username,email,avatar_path,school_name,role,premium,premium_expires_at),categories(id,name,slug,icon_key),document_files(file_kind,storage_path)')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(500),
        supabase.from('document_stats').select('*'),
        supabase.from('document_purchases').select('document_id').eq('buyer_id', currentUser.id),
      ]);

      if (error) throw error;
      if (statError) throw statError;

      const statMap = new Map((statRows || []).map((item) => [item.document_id, item]));
      const purchasedIds = new Set((purchaseResult.data || []).map((item) => item.document_id));

      setAllDocuments((data || []).map((item) => ({
        ...item,
        cover_path: item.document_files?.find((file) => file.file_kind === 'cover')?.storage_path || null,
        document_stats: statMap.get(item.id) || {},
        is_purchased: purchasedIds.has(item.id),
      })));
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser.id, toast]);

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('sort_order')
      .then(({ data }) => setCategories(data || []));
  }, []);

  useEffect(() => {
    load();

    const refreshPurchases = () => load();
    window.addEventListener('docshare:purchases-refresh', refreshPurchases);

    return () => window.removeEventListener('docshare:purchases-refresh', refreshPurchases);
  }, [load]);

  useEffect(() => {
    const nextSearch = searchParams.get('search') || '';
    const nextCategory = searchParams.get('category') || '';

    setFilters((current) => {
      if (current.search === nextSearch && current.category === nextCategory) return current;
      return {
        ...current,
        search: nextSearch,
        category: nextCategory,
      };
    });
  }, [searchParams]);

  const documents = useMemo(() => {
    let result = allDocuments.filter((item) => {
      if (filters.category && item.category_id !== filters.category) return false;
      if (filters.price === 'free' && Number(item.price_credit || 0) !== 0) return false;
      if (filters.price === 'paid' && Number(item.price_credit || 0) <= 0) return false;
      return true;
    });

    if (filters.search.trim()) {
      result = rankDocuments(result, filters.search);
    } else {
      result = [...result].sort((left, right) => documentDate(right) - documentDate(left));
    }

    if (filters.sort === 'oldest') {
      result = [...result].sort((left, right) => documentDate(left) - documentDate(right));
    }

    return result;
  }, [allDocuments, filters]);

  const topicCounts = useMemo(
    () => categories.slice(0, 8).map((category) => ({
      ...category,
      count: allDocuments.filter((item) => item.category_id === category.id).length,
    })),
    [allDocuments, categories],
  );

  async function toggleBookmark(document) {
    try {
      const { data } = await supabase
        .from('document_bookmarks')
        .select('document_id')
        .eq('document_id', document.id)
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (data) {
        const { error } = await supabase
          .from('document_bookmarks')
          .delete()
          .eq('document_id', document.id)
          .eq('user_id', currentUser.id);

        if (error) throw error;
        toast('Đã bỏ lưu tài liệu.');
      } else {
        const { error } = await supabase
          .from('document_bookmarks')
          .insert({ document_id: document.id, user_id: currentUser.id });

        if (error) throw error;
        toast('Đã lưu tài liệu.');
      }
    } catch (error) {
      toast(normalizeError(error), 'error');
    }
  }

  function apply(event) {
    event.preventDefault();
    const next = {};
    if (filters.search.trim()) next.search = filters.search.trim();
    if (filters.category) next.category = filters.category;
    setSearchParams(next);
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    setSearchParams({});
  }

  return (
    <div className="page">
      <BotanicalHero compact eyebrow="KHO HỌC THUẬT" title="Kho tài liệu học thuật" description="Khám phá tài liệu chất lượng được chia sẻ bởi cộng đồng DocShare Pro." />
      <div className="documents-layout">
        <aside className="filter-panel botanical-card">
          <div className="filter-panel__title">
            <span><Filter size={18} /> Bộ lọc tìm kiếm</span>
            <button type="button" onClick={resetFilters}>Làm mới</button>
          </div>

          <form onSubmit={apply} className="stack-form">
            <label>
              Từ khóa
              <SmartSearchInput
                onChange={(search) => setFilters((value) => ({ ...value, search }))}
                onChoose={(search) => setFilters((value) => ({ ...value, search }))}
                placeholder="Tên tài liệu, tác giả, môn học, trường học..."
                value={filters.search}
              />
            </label>

            <label>
              Danh mục
              <select value={filters.category} onChange={(event) => setFilters((value) => ({ ...value, category: event.target.value }))}>
                <option value="">Tất cả danh mục</option>
                {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>

            <label>
              Mức giá
              <select value={filters.price} onChange={(event) => setFilters((value) => ({ ...value, price: event.target.value }))}>
                <option value="">Tất cả</option>
                <option value="free">Miễn phí</option>
                <option value="paid">Có phí</option>
              </select>
            </label>

            <label>
              Sắp xếp
              <select value={filters.sort} onChange={(event) => setFilters((value) => ({ ...value, sort: event.target.value }))}>
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </label>

            <button className="button button--wide" type="submit">
              <SlidersHorizontal size={17} /> Áp dụng lọc
            </button>
          </form>

          <div className="filter-topics">
            <strong>Chủ đề nổi bật</strong>
            {topicCounts.map((item) => (
              <button key={item.id} type="button" onClick={() => setFilters((value) => ({ ...value, category: item.id }))}>
                <span>{item.name}</span>
                <small>{item.count}</small>
              </button>
            ))}
          </div>
        </aside>

        <section className="documents-results">
          <div className="results-toolbar botanical-card">
            <span>Hiển thị <strong>{documents.length}</strong> kết quả</span>
            <div>
              <button className={view === 'grid' ? 'is-active' : ''} type="button" onClick={() => setView('grid')}><Grid2X2 size={18} /></button>
              <button className={view === 'list' ? 'is-active' : ''} type="button" onClick={() => setView('list')}><List size={18} /></button>
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : documents.length ? (
            <div className={view === 'grid' ? 'document-grid document-grid--4' : 'document-list'}>
              {documents.map((item) => <DocumentCard key={item.id} document={item} onBookmark={toggleBookmark} />)}
            </div>
          ) : (
            <EmptyState
              title="Không tìm thấy tài liệu"
              description="Hãy thử tên tác giả, username, môn học, danh mục hoặc một từ khóa gần đúng."
            />
          )}
        </section>
      </div>
    </div>
  );
}
