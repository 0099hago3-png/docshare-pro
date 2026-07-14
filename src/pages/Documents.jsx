import { Filter, Grid2X2, List, Search, SlidersHorizontal } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BotanicalHero from '../components/BotanicalHero.jsx';
import DocumentCard from '../components/DocumentCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import { useApp } from '../context/AppContext.jsx';
import { supabase } from '../lib/supabase.js';
import { normalizeError } from '../lib/helpers.js';

export default function Documents() {
  const { currentUser, toast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    price: '',
    sort: 'newest',
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from('documents').select('*,profiles:author_id(id,full_name,username,avatar_path,school_name,role,premium,premium_expires_at),categories(id,name,slug,icon_key),document_files(file_kind,storage_path)').eq('status', 'published');
      if (filters.search.trim()) query = query.or(`title.ilike.%${filters.search.trim()}%,description.ilike.%${filters.search.trim()}%,subject.ilike.%${filters.search.trim()}%`);
      if (filters.category) query = query.eq('category_id', filters.category);
      if (filters.price === 'free') query = query.eq('price_credit', 0);
      if (filters.price === 'paid') query = query.gt('price_credit', 0);
      query = filters.sort === 'oldest' ? query.order('created_at', { ascending: true }) : query.order('created_at', { ascending: false });
      const [{ data, error }, { data: statRows }] = await Promise.all([query, supabase.from('document_stats').select('*')]);
      if (error) throw error;
      setStats(statRows || []);
      const statMap = new Map((statRows || []).map((item) => [item.document_id, item]));
      setDocuments((data || []).map((item) => ({ ...item, cover_path: item.document_files?.find((file) => file.file_kind === 'cover')?.storage_path || null, document_stats: statMap.get(item.id) || {} })));
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => setCategories(data || []));
  }, []);

  useEffect(() => { load(); }, [load]);

  const topicCounts = useMemo(() => categories.slice(0, 8).map((category) => ({ ...category, count: documents.filter((item) => item.category_id === category.id).length })), [categories, documents]);

  async function toggleBookmark(document) {
    try {
      const { data } = await supabase.from('document_bookmarks').select('document_id').eq('document_id', document.id).eq('user_id', currentUser.id).maybeSingle();
      if (data) {
        const { error } = await supabase.from('document_bookmarks').delete().eq('document_id', document.id).eq('user_id', currentUser.id);
        if (error) throw error;
        toast('Đã bỏ lưu tài liệu.');
      } else {
        const { error } = await supabase.from('document_bookmarks').insert({ document_id: document.id, user_id: currentUser.id });
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
    if (filters.search) next.search = filters.search;
    if (filters.category) next.category = filters.category;
    setSearchParams(next);
    load();
  }

  return (
    <div className="page">
      <BotanicalHero compact eyebrow="KHO HỌC THUẬT" title="Kho tài liệu học thuật" description="Khám phá tài liệu chất lượng được chia sẻ bởi cộng đồng DocShare Pro." />
      <div className="documents-layout">
        <aside className="filter-panel botanical-card">
          <div className="filter-panel__title"><span><Filter size={18} /> Bộ lọc tìm kiếm</span><button type="button" onClick={() => setFilters({ search: '', category: '', price: '', sort: 'newest' })}>Làm mới</button></div>
          <form onSubmit={apply} className="stack-form">
            <label>Từ khóa<div className="input-icon"><Search size={16} /><input value={filters.search} onChange={(event) => setFilters((value) => ({ ...value, search: event.target.value }))} placeholder="Tên tài liệu, tác giả..." /></div></label>
            <label>Danh mục<select value={filters.category} onChange={(event) => setFilters((value) => ({ ...value, category: event.target.value }))}><option value="">Tất cả danh mục</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label>Mức giá<select value={filters.price} onChange={(event) => setFilters((value) => ({ ...value, price: event.target.value }))}><option value="">Tất cả</option><option value="free">Miễn phí</option><option value="paid">Có phí</option></select></label>
            <label>Sắp xếp<select value={filters.sort} onChange={(event) => setFilters((value) => ({ ...value, sort: event.target.value }))}><option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option></select></label>
            <button className="button button--wide" type="submit"><SlidersHorizontal size={17} /> Áp dụng lọc</button>
          </form>
          <div className="filter-topics"><strong>Chủ đề nổi bật</strong>{topicCounts.map((item) => <button key={item.id} type="button" onClick={() => setFilters((value) => ({ ...value, category: item.id }))}><span>{item.name}</span><small>{item.count}</small></button>)}</div>
        </aside>

        <section className="documents-results">
          <div className="results-toolbar botanical-card"><span>Hiển thị <strong>{documents.length}</strong> kết quả</span><div><button className={view === 'grid' ? 'is-active' : ''} type="button" onClick={() => setView('grid')}><Grid2X2 size={18} /></button><button className={view === 'list' ? 'is-active' : ''} type="button" onClick={() => setView('list')}><List size={18} /></button></div></div>
          {loading ? <Loading /> : documents.length ? <div className={view === 'grid' ? 'document-grid document-grid--4' : 'document-list'}>{documents.map((item) => <DocumentCard key={item.id} document={item} onBookmark={toggleBookmark} />)}</div> : <EmptyState title="Không tìm thấy tài liệu" description="Hãy đổi từ khóa hoặc bộ lọc để xem kết quả khác." />}
        </section>
      </div>
    </div>
  );
}
