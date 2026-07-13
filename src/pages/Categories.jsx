import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BotanicalHero from '../components/BotanicalHero.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import { useApp } from '../context/AppContext.jsx';
import { supabase } from '../lib/supabase.js';
import { normalizeError } from '../lib/helpers.js';

export default function Categories() {
  const { toast } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: categories, error }, { data: documents }] = await Promise.all([
          supabase.from('categories').select('*').order('sort_order'),
          supabase.from('documents').select('category_id').eq('status', 'published'),
        ]);
        if (error) throw error;
        setItems((categories || []).map((item) => ({ ...item, count: (documents || []).filter((doc) => doc.category_id === item.id).length })));
      } catch (error) {
        toast(normalizeError(error), 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  return (
    <div className="page">
      <BotanicalHero compact eyebrow="KHÁM PHÁ THEO LĨNH VỰC" title="Danh mục học thuật" description="Danh mục được quản lý tập trung. Người dùng chỉ chọn danh mục có sẵn khi đăng tài liệu." />
      {loading ? <Loading /> : items.length ? <div className="category-grid">{items.map((item) => <Link className="category-card botanical-card" key={item.id} to={`/documents?category=${item.id}`}><span className="category-card__icon"><CategoryIcon name={item.icon_key} size={28} /></span><div><h3>{item.name}</h3><p>{item.description || 'Tài liệu học thuật thuộc lĩnh vực này.'}</p><small>{item.count} tài liệu</small></div><ArrowRight size={18} /></Link>)}</div> : <EmptyState title="Chưa có danh mục" description="Admin có thể thêm danh mục bằng SQL trong Supabase." />}
    </div>
  );
}
