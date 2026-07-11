import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpen, Crown, Download, Eye, Gift, Heart, MessageSquareText, Sparkles, Trophy, UsersRound } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Avatar from '../components/Avatar.jsx';
import { formatNumber } from '../utils/helpers.js';

const tabs = [
  { id: 'members', label: 'Thành viên', icon: UsersRound },
  { id: 'authors', label: 'Tác giả', icon: BookOpen },
  { id: 'donate', label: 'Ủng hộ', icon: Gift },
  { id: 'liked', label: 'Yêu thích', icon: Heart },
  { id: 'views', label: 'Xem nhiều', icon: Eye },
  { id: 'downloads', label: 'Tải nhiều', icon: Download },
  { id: 'posts', label: 'Bài đăng', icon: MessageSquareText },
];

const rewardFrameByTab = {
  members: 'Nexus Champion',
  authors: 'Tác giả Học thuật',
  donate: 'Nebula Patron',
  liked: 'Stellar Heart',
  views: 'Oracle Lens',
  downloads: 'Comet Archive',
  posts: 'Nova Voice',
};

export default function Leaderboard() {
  const { state, getUser } = useApp();
  const [tab, setTab] = useState('members');
  const [period, setPeriod] = useState('month');

  const ranking = useMemo(() => {
    const factor = { week: 0.18, month: 0.46, year: 0.82, all: 1 }[period] || 1;
    const periodScore = (value, seed = 1) => Math.max(0, Math.round(Number(value || 0) * factor * (0.94 + ((seed * 7) % 9) / 100)));
    if (tab === 'members') return state.users.map((user, index) => ({ id: user.id, user, points: periodScore((user.activityPoints || 0) + user.level * 100, index + 1), note: `Cấp ${user.level} · ${formatNumber(user.followers)} người theo dõi` })).sort((a, b) => b.points - a.points);
    if (tab === 'authors') return state.users.map((user, index) => ({ id: user.id, user, points: periodScore(user.creatorPoints || 0, index + 2), note: `${state.documents.filter((doc) => doc.authorId === user.id).length} tài liệu · ${formatNumber(user.likes)} lượt thích` })).sort((a, b) => b.points - a.points);
    if (tab === 'donate') return state.users.map((user, index) => ({ id: user.id, user, points: periodScore(user.supportPoints || 0, index + 3), note: 'Điểm ủng hộ tích lũy' })).sort((a, b) => b.points - a.points);
    if (tab === 'posts') return state.users.map((user, index) => {
      const posts = state.posts.filter((post) => post.authorId === user.id);
      const rawPoints = posts.reduce((sum, post) => sum + (post.likes || 0) + (post.comments?.length || 0) * 20 + (post.shares || 0) * 5, 0);
      return { id: user.id, user, points: periodScore(rawPoints, index + 4), note: `${posts.length} bài đăng cộng đồng` };
    }).sort((a, b) => b.points - a.points);

    const metric = tab === 'liked' ? 'likes' : tab === 'views' ? 'views' : 'downloads';
    return state.documents.map((doc, index) => ({ id: doc.id, doc, user: getUser(doc.authorId), points: periodScore(doc[metric] || 0, index + 5), note: doc.title })).sort((a, b) => b.points - a.points);
  }, [getUser, period, state, tab]);

  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3, 10);

  return (
    <div className="page universe-page leaderboard-universe">
      <section className="rank-universe-hero">
        <div><span className="eyebrow"><Sparkles size={15}/> MÙA THƯ KHỐ 2026</span><h1>Bảng xếp hạng DocShare Pro</h1><p>Điểm được tính từ hoạt động, sáng tạo, lượt xem, tải xuống và đóng góp cho cộng đồng. Không quy đổi thành tiền.</p></div>
        <div className="season-counter"><small>Kết thúc mùa giải sau</small><b>12 : 05 : 32 : 18</b><span>Ngày · Giờ · Phút · Giây</span></div>
      </section>

      <div className="rank-toolbar">
        <div className="rank-tabs universe-tabs">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}><Icon size={17}/>{label}</button>)}</div>
        <div className="period-tabs universe-periods">{[['week','Tuần'],['month','Tháng'],['year','Năm'],['all','Tất cả']].map(([id,label]) => <button key={id} className={period === id ? 'active' : ''} onClick={() => setPeriod(id)}>{label}</button>)}</div>
      </div>

      <div className="leaderboard-layout">
        <main>
          <section className="podium-universe">
            {top3.map((item, index) => (
              <Link key={item.id} to={item.doc ? `/documents/${item.doc.id}` : `/users/${item.user.id}`} className={`podium-card rank-${index + 1}`}>
                <div className="podium-rank">#{index + 1}</div>
                <div className="podium-avatar"><Avatar user={item.user} size="xl"/></div>
                <div><h2>{item.doc ? item.doc.title : item.user.name}</h2><p>{item.note}</p><strong>{formatNumber(item.points)} điểm</strong></div>
                <span className="reward-name"><Award size={16}/>{index === 0 ? rewardFrameByTab[tab] : index === 1 ? 'Khung Quỹ Đạo Bạc' : 'Khung Quỹ Đạo Đồng'}</span>
              </Link>
            ))}
          </section>

          <section className="rank-list-universe panel-universe">
            <div className="panel-title-row"><div><h2>Top 4–10</h2><p>Những thành viên nổi bật tiếp theo trong mùa.</p></div><span className="season-badge">{period === 'month' ? 'Tháng này' : period === 'week' ? 'Tuần này' : period === 'year' ? 'Năm nay' : 'Mọi thời gian'}</span></div>
            {rest.map((item, index) => (
              <Link key={item.id} to={item.doc ? `/documents/${item.doc.id}` : `/users/${item.user.id}`} className="rank-row-universe">
                <b>{index + 4}</b><Avatar user={item.user}/><div><strong>{item.doc ? item.doc.title : item.user.name}</strong><small>{item.note}</small></div><span>{formatNumber(item.points)} điểm</span>
              </Link>
            ))}
          </section>
        </main>

        <aside>
          <section className="panel-universe rank-reward-summary">
            <Crown size={28}/><h2>Phần thưởng mùa</h2><p>Hạng 1 nhận khung riêng theo từng bảng. Hạng 2–3 nhận khung Quỹ Đạo Bạc/Đồng. Hạng 4–10 nhận khung Nexus Orbit.</p>
            <div className="reward-preview-orbits"><i className="mini-orbit gold"/><i className="mini-orbit silver"/><i className="mini-orbit bronze"/><i className="mini-orbit comfort"/></div>
          </section>

          <section className="panel-universe mission-panel">
            <div className="panel-title-row"><div><h2>Nhiệm vụ nhận khung</h2><p>Hoàn thành để mở khung trong túi đồ.</p></div></div>
            {[
              ['100 người theo dõi', Math.min(100, (state.users[1]?.followers || 0) / 10), 'Galaxy Signal'],
              ['1.000 lượt thích', Math.min(100, (state.users[1]?.likes || 0) / 10), 'Pulsar Heart'],
              ['10.000 điểm ủng hộ', Math.min(100, (state.users[1]?.supportPoints || 0) / 100), 'Celestial Benefactor'],
              ['Đạt Top 3 bất kỳ', 67, 'Khung mùa giải'],
            ].map(([label,value,reward]) => <div className="mission-item" key={label}><div><b>{label}</b><small>Phần thưởng: {reward}</small></div><div className="progress"><i style={{ width: `${value}%` }}/></div><span>{Math.round(value)}%</span></div>)}
          </section>

          <Link className="gift-vault-link" to="/gifts"><Gift size={22}/><div><b>Kho quà & lịch sử</b><small>Xem quà đã tặng và điểm ủng hộ</small></div><span>→</span></Link>
        </aside>
      </div>
    </div>
  );
}
