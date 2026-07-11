import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, Filter, Flame, Heart, Search, Sparkles, Tag, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import DocumentCard from '../components/DocumentCard.jsx';
import { normalizeText } from '../utils/helpers.js';
import { schools } from '../data/defaultData.js';

export default function Documents() {
  const { state, getUser } = useApp();
  const [params, setParams] = useSearchParams();
  const [keyword, setKeyword] = useState(params.get('q') || '');
  const [category, setCategory] = useState(params.get('cat') || 'all');
  const [sort, setSort] = useState('newest');
  const [focus, setFocus] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [fileType, setFileType] = useState('all');
  const [school, setSchool] = useState('all');
  const [tag, setTag] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    setKeyword(params.get('q') || '');
    setCategory(params.get('cat') || 'all');
  }, [params]);

  const tagSuggestions = useMemo(() => [...new Set(state.documents.flatMap((doc) => doc.tags || []))].sort(), [state.documents]);

  const suggestions = useMemo(() => {
    const q = normalizeText(keyword.trim());
    if (!q) return [];
    return state.documents.filter((doc) => {
      const authorName = getUser(doc.authorId)?.name || '';
      return normalizeText(`${doc.title} ${doc.subject} ${doc.school} ${authorName} ${(doc.tags || []).join(' ')}`).includes(q);
    }).slice(0, 6);
  }, [keyword, state.documents, getUser]);

  const filtered = useMemo(() => {
    const q = normalizeText(keyword);
    const normalizedTag = normalizeText(tag);
    const normalizedAuthor = normalizeText(author);
    const list = state.documents.filter((doc) => {
      const authorName = getUser(doc.authorId)?.name || '';
      const searchable = normalizeText(`${doc.title} ${doc.subject} ${doc.school} ${authorName} ${(doc.tags || []).join(' ')}`);
      const matchQ = !q || searchable.includes(q);
      const matchCategory = category === 'all' || doc.category === category;
      const matchType = fileType === 'all' || doc.type === fileType;
      const matchSchool = school === 'all' || normalizeText(doc.school || '') === normalizeText(school);
      const matchTag = !normalizedTag || (doc.tags || []).some((item) => normalizeText(item).includes(normalizedTag));
      const matchAuthor = !normalizedAuthor || normalizeText(authorName).includes(normalizedAuthor);
      return matchQ && matchCategory && matchType && matchSchool && matchTag && matchAuthor;
    });
    return [...list].sort((a, b) => (
      sort === 'popular' ? b.views - a.views :
      sort === 'liked' ? b.likes - a.likes :
      sort === 'downloaded' ? b.downloads - a.downloads :
      new Date(b.createdAt) - new Date(a.createdAt)
    ));
  }, [author, category, fileType, getUser, keyword, school, sort, state.documents, tag]);

  const topLiked = useMemo(() => [...state.documents].sort((a, b) => b.likes - a.likes).slice(0, 3), [state.documents]);
  const suggested = useMemo(() => [...state.documents].sort((a, b) => (b.rating * 100 + b.views / 100) - (a.rating * 100 + a.views / 100)).slice(0, 5), [state.documents]);

  function submit(event) {
    event.preventDefault();
    const next = {};
    if (keyword.trim()) next.q = keyword.trim();
    if (category !== 'all') next.cat = category;
    setParams(next);
    setFocus(false);
  }

  function clearAdvanced() {
    setFileType('all');
    setSchool('all');
    setTag('');
    setAuthor('');
  }

  const visibleCategories = state.categories.filter((cat) => cat.id !== 'all').slice(0, 8);

  return (
    <div className="page universe-page documents-universe">
      <section className="documents-head-universe">
        <div><span className="eyebrow"><Sparkles size={15}/> THƯ VIỆN TRI THỨC</span><h1>Khám phá tài liệu</h1><p>Tìm kiếm theo tên, tác giả, trường, hashtag và lọc chuyên sâu để ra đúng tài liệu bạn cần.</p></div>
      </section>

      <section className="panel-universe document-controls-universe">
        <form className="document-search-large" onSubmit={submit}>
          <Search size={20}/><input value={keyword} onFocus={() => setFocus(true)} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm tài liệu, tác giả, môn học, trường..."/><button>Tìm kiếm</button>
          {focus && keyword.trim() && <div className="document-search-suggest custom-scroll">{suggestions.map((doc) => <button type="button" key={doc.id} onMouseDown={() => { setKeyword(doc.title); setParams({ q: doc.title }); setFocus(false); }}><span className={`mini-doc-cover ${doc.color}`}>{doc.cover}</span><span><b>{doc.title}</b><small>{doc.subject} · {doc.school}</small></span></button>)}{!suggestions.length && <p>Không có gợi ý gần đúng.</p>}</div>}
        </form>
        <div className="document-filter-row">
          <div className="filter-group-universe"><span>Danh mục</span>{visibleCategories.map((cat) => <button key={cat.id} className={category === cat.id ? 'active' : ''} onClick={() => setCategory(cat.id)}>{cat.name}</button>)}<button onClick={() => setAdvanced((value) => !value)}>Khác <ChevronDown size={15}/></button></div>
          <div className="filter-group-universe sort-group"><span>Sắp xếp</span>{[['newest','Mới nhất'],['popular','Phổ biến'],['liked','Yêu thích'],['downloaded','Tải nhiều']].map(([id,label]) => <button key={id} className={sort === id ? 'active' : ''} onClick={() => setSort(id)}>{label}</button>)}</div>
          <button className="advanced-filter-btn" onClick={() => setAdvanced((value) => !value)}><Filter size={17}/>Bộ lọc nâng cao</button>
        </div>
        {advanced && <div className="advanced-filter-panel advanced-filter-panel-v23">
          <label>Loại file<select value={fileType} onChange={(event) => setFileType(event.target.value)}><option value="all">Tất cả</option><option>PDF</option><option>DOCX</option><option>PPTX</option><option>XLSX</option><option>ZIP</option><option>RAR</option></select></label>
          <label>Trường<select value={school} onChange={(event) => setSchool(event.target.value)}><option value="all">Tất cả trường</option>{schools.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label>Tác giả<input value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="Tìm theo tên tác giả"/></label>
          <label className="advanced-tag-field">Hashtag<div className="tag-field-wrap"><Tag size={15}/><input list="doc-tags" value={tag} onChange={(event) => setTag(event.target.value)} placeholder="Ví dụ: react, postgresql..."/></div><datalist id="doc-tags">{tagSuggestions.map((item) => <option key={item} value={item}/>)}</datalist></label>
          <button onClick={clearAdvanced}>Xóa bộ lọc</button>
        </div>}
      </section>

      <section className="panel-universe showcase-universe-section">
        <div className="panel-title-row"><div><h2><Heart size={21}/> Top được yêu thích nhất hôm nay</h2><p>Ba tài liệu được cộng đồng yêu thích nhiều nhất.</p></div><button className="link-btn" onClick={() => setSort('liked')}>Xem tất cả →</button></div>
        <div className="top-three-universe">{topLiked.map((doc,index) => <DocumentCard key={doc.id} doc={doc} compact rank={index + 1}/>)}</div>
      </section>

      <section className="panel-universe showcase-universe-section">
        <div className="panel-title-row"><div><h2><TrendingUp size={21}/> Gợi ý cho bạn</h2><p>Dựa trên lịch sử xem, lượt thích, tag và ngành học.</p></div></div>
        <div className="recommendation-row custom-scroll">{suggested.map((doc) => <DocumentCard key={doc.id} doc={doc} compact/>)}</div>
      </section>

      <section className="documents-result-section">
        <div className="panel-title-row"><div><h2><Flame size={21}/> Tất cả tài liệu</h2><p>{filtered.length} kết quả phù hợp.</p></div></div>
        <div className="universe-doc-grid">{filtered.map((doc) => <DocumentCard key={doc.id} doc={doc}/>)}</div>
      </section>
    </div>
  );
}
