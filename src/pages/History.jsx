import { BookOpen, Clock3, Heart, MessageCircle, ShoppingBag, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import BotanicalHero from '../components/BotanicalHero.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import { useApp } from '../context/AppContext.jsx';
import { formatDateTime, normalizeError } from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';

const iconMap = { view: BookOpen, like: Heart, comment: MessageCircle, rating: Star, purchase: ShoppingBag };

export default function History() {
  const { currentUser, toast } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('activity_history').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(100).then(({ data, error }) => {
      if (error) toast(normalizeError(error), 'error'); else setItems(data || []);
      setLoading(false);
    });
  }, [currentUser.id, toast]);

  return <div className="page"><BotanicalHero compact eyebrow="DẤU CHÂN HỌC TẬP" title="Lịch sử hoạt động" description="Theo dõi những tài liệu bạn đã xem, thích, bình luận, đánh giá và mua." />{loading ? <Loading /> : items.length ? <div className="history-list botanical-card">{items.map((item) => { const Icon = iconMap[item.action_type] || Clock3; return <article key={item.id}><span><Icon size={20} /></span><div><strong>{item.title || item.action_type}</strong><p>{item.metadata?.description || 'Hoạt động trên DocShare Pro'}</p><small>{formatDateTime(item.created_at)}</small></div></article>; })}</div> : <EmptyState title="Chưa có lịch sử" description="Các hoạt động mới sẽ xuất hiện tại đây." />}</div>;
}
