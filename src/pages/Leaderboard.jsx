import { Award, Crown, Medal, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import BotanicalHero from '../components/BotanicalHero.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import { useApp } from '../context/AppContext.jsx';
import { getProfileName, normalizeError } from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';

export default function Leaderboard() {
  const { toast } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: profiles, error }, { data: docs }, { data: gifts }] = await Promise.all([
          supabase.from('profiles').select('id,full_name,username,avatar_path,premium,level,school_name').eq('status', 'active'),
          supabase.from('documents').select('author_id').eq('status', 'published'),
          supabase.from('gift_transactions').select('receiver_id,receiver_credit'),
        ]);
        if (error) throw error;
        setItems((profiles || []).map((profile) => ({ ...profile, document_count: (docs || []).filter((item) => item.author_id === profile.id).length, gift_credit: (gifts || []).filter((item) => item.receiver_id === profile.id).reduce((sum, item) => sum + Number(item.receiver_credit || 0), 0) })).sort((a, b) => (b.document_count * 100 + b.gift_credit) - (a.document_count * 100 + a.gift_credit)).slice(0, 20));
      } catch (error) { toast(normalizeError(error), 'error'); } finally { setLoading(false); }
    })();
  }, [toast]);

  return <div className="page"><BotanicalHero compact eyebrow="VINH DANH CỘNG ĐỒNG" title="Bảng xếp hạng" description="Ghi nhận những thành viên tích cực chia sẻ tài liệu và đóng góp cho cộng đồng." />{loading ? <Loading /> : items.length ? <div className="leaderboard-layout"><section className="leaderboard-podium">{items.slice(0, 3).map((item, index) => <Link key={item.id} className={`podium-card podium-card--${index + 1} botanical-card`} to={`/profile/${item.id}`}><span className="podium-rank">{index === 0 ? <Crown /> : index === 1 ? <Medal /> : <Award />}</span><Avatar profile={item} size={82} /><strong>{getProfileName(item)}</strong><small>{item.school_name || 'DocShare Pro'}</small><b>{item.document_count} tài liệu · {item.gift_credit} credit tri ân</b></Link>)}</section><section className="ranking-list botanical-card">{items.slice(3).map((item, index) => <Link key={item.id} to={`/profile/${item.id}`}><span>{index + 4}</span><Avatar profile={item} size={42} /><div><strong>{getProfileName(item)}</strong><small>{item.document_count} tài liệu · Lv.{item.level || 1}</small></div><Trophy size={18} /></Link>)}</section></div> : <EmptyState title="Chưa có dữ liệu xếp hạng" />}</div>;
}
