import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LibraryBig, Search } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';
import { normalizeText } from '../utils/helpers.js';

export default function Categories() {
  const { state } = useApp();
  const [keyword, setKeyword] = useState('');
  const categories = useMemo(() => state.categories.filter((cat) => cat.id !== 'all' && normalizeText(cat.name).includes(normalizeText(keyword))), [state.categories, keyword]);

  return (
    <div className="page categories-page-v25">
      <section className="category-hero-v25">
        <div><span className="eyebrow"><LibraryBig size={15}/> BẢN ĐỒ TRI THỨC</span><h1>Khám phá theo lĩnh vực học thuật</h1><p>Mỗi danh mục được trình bày rõ ràng để bạn nhanh chóng tìm đúng môn học, chuyên ngành và tài liệu cần thiết.</p></div>
        <label className="category-search-v25"><Search size={18}/><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm danh mục..."/></label>
      </section>
      <div className="category-grid-v25">
        {categories.map((cat) => <Link to={`/documents?cat=${cat.id}`} key={cat.id} className="category-card-v25">
          <span className="category-icon-v25"><CategoryIcon id={cat.id} size={28}/></span>
          <div><h3>{cat.name}</h3><p>{cat.count.toLocaleString('vi-VN')} tài liệu</p></div>
          <ArrowRight size={18}/>
        </Link>)}
      </div>
    </div>
  );
}
