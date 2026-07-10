import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { normalizeText } from '../utils/helpers.js';
import { buildSuggestions } from '../utils/search.js';

export default function Categories() {
  const { state } = useApp();
  const [keyword, setKeyword] = useState('');
  const [focus, setFocus] = useState(false);
  const suggestions = buildSuggestions(state.documents, state.categories, keyword);
  const categories = useMemo(() => state.categories.filter((cat) => cat.id !== 'all' && normalizeText(cat.name).includes(normalizeText(keyword))), [state.categories, keyword]);

  return (
    <div className="page">
      <section className="page-hero category-hero">
        <div>
          <span className="eyebrow">DANH MỤC</span>
          <h1>Danh mục tài liệu</h1>
          <p>Danh mục phát sinh từ dữ liệu, phù hợp khi đưa lên Supabase.</p>
        </div>
        <div className="inline-search category-search">
          <input value={keyword} onFocus={() => setFocus(true)} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm danh mục, ví dụ: cntt, marketing..." />
          {focus && suggestions.length > 0 && <div className="search-suggestions inside">{suggestions.map((s) => <button type="button" key={s} onMouseDown={() => { setKeyword(s); setFocus(false); }}>{s}</button>)}</div>}
        </div>
      </section>
      <div className="category-grid-modern">
        {categories.map((cat) => <Link to={`/documents?cat=${cat.id}`} key={cat.id} className="category-card-modern"><span>{cat.icon}</span><h3>{cat.name}</h3><p>{cat.count} tài liệu</p></Link>)}
      </div>
    </div>
  );
}
