import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BarChart3, BookOpen, CalendarDays, Camera, Check, Eye, FileText, Heart,
  LockKeyhole, MessageCircle, Pencil, Settings2, ShieldCheck, UsersRound,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Avatar from '../components/Avatar.jsx';
import AvatarEditorModal from '../components/AvatarEditorModal.jsx';
import BookCover from '../components/BookCover.jsx';
import MarketChart from '../components/MarketChart.jsx';
import { PremiumBadge, VerifyBadge } from '../components/Badges.jsx';
import { formatMoney, formatNumber } from '../utils/helpers.js';

const chartSets = {
  today: { labels: ['08h','10h','12h','14h','16h','18h','20h'], views: [230,390,350,620,570,840,760], downloads: [80,130,110,210,190,280,250], likes: [18,26,21,39,34,52,46], revenue: [20,45,35,70,65,100,92] },
  week: { labels: ['18/05','19/05','20/05','21/05','22/05','23/05','24/05'], views: [4200,5100,4550,6420,5900,7300,8420], downloads: [1350,1680,1450,1840,1710,2150,2430], likes: [310,420,365,532,490,610,690], revenue: [180,220,195,310,285,390,470] },
  month: { labels: ['Tuần 1','Tuần 2','Tuần 3','Tuần 4'], views: [14200,18900,23100,28800], downloads: [3900,4800,6100,7300], likes: [820,1050,1320,1680], revenue: [1250,1840,2460,3150] },
  year: { labels: ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'], views: [14000,18500,21000,24500,28600,33000,38100,42000,47500,53000,59000,64200], downloads: [3800,4500,5300,6100,7200,8400,9700,10900,12100,13600,15100,16900], likes: [620,780,860,1020,1180,1350,1540,1720,1940,2200,2450,2710], revenue: [820,950,1200,1450,1730,2050,2400,2880,3250,3670,4110,4820] },
  all: { labels: ['2022','2023','2024','2025','2026'], views: [8200,24100,58700,93600,128600], downloads: [1900,5800,13100,19800,24300], likes: [410,1220,3150,4820,6482], revenue: [300,1100,3400,5600,8820] },
};

const frameNameByTier = {
  1: 'Viền Tối giản',
  2: 'Bạc Học giả',
  3: 'Lam Thư viện',
  4: 'Xanh Oxford',
  5: 'Ngọc Lục bảo',
  6: 'Bạch kim Danh dự',
  7: 'Vàng Đồng Cổ điển',
  8: 'Hoàng gia Học thuật',
};

export default function Profile() {
  const { id } = useParams();
  const { state, currentUser, getUser, toggleFollow, updateProfile, setAvatarFrame } = useApp();
  const user = id ? getUser(id) : currentUser;
  const isOwner = currentUser?.id === user?.id;
  const isAdmin = currentUser?.role === 'admin';
  const canSeeBalance = isOwner || isAdmin;
  const [range, setRange] = useState('week');
  const [customOpen, setCustomOpen] = useState(false);
  const [customRange, setCustomRange] = useState({ from: '2026-07-01', to: '2026-07-09' });
  const [editing, setEditing] = useState(false);
  const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);
  const [contentTab, setContentTab] = useState('documents');
  const [frameView, setFrameView] = useState('owned');
  const [form, setForm] = useState({ name: user.name, bio: user.bio, school: user.school, major: user.major, avatar: user.avatar, cover: user.cover || '' });

  const docs = state.documents.filter((doc) => doc.authorId === user.id);
  const posts = state.posts.filter((post) => post.authorId === user.id);
  const following = state.follows.includes(user.id);
  const totalViews = docs.reduce((sum, doc) => sum + doc.views, 0);
  const totalDownloads = docs.reduce((sum, doc) => sum + doc.downloads, 0);
  const totalLikes = docs.reduce((sum, doc) => sum + doc.likes, 0);
  const followers = state.users.filter((member) => (member.following || []).includes(user.id)).concat(state.follows.includes(user.id) ? [currentUser] : []).filter(Boolean);
  const followingList = useMemo(() => (user.following || []).map((uid) => getUser(uid)).filter(Boolean), [getUser, user.following]);
  const chart = chartSets[range];
  const frameList = useMemo(() => state.avatarFrames.filter((frame) => frameView === 'all' || (user.ownedFrames || []).includes(frame.id)), [frameView, state.avatarFrames, user.ownedFrames]);

  function save() {
    updateProfile(form);
    setEditing(false);
  }

  function coverChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, cover: reader.result }));
      updateProfile({ cover: reader.result });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="page profile-page-v24">
      <section className="profile-cover-v24" style={form.cover ? { backgroundImage: `linear-gradient(90deg,rgba(24,33,29,.78),rgba(24,33,29,.16)),url(${form.cover})` } : undefined}>
        <div className="profile-cover-pattern" />
        <div className="profile-cover-tools">
          {isOwner && <label className="space-btn secondary"><Camera size={17}/>Đổi ảnh bìa<input type="file" accept="image/*" onChange={coverChange}/></label>}
          {isOwner && <button className="space-btn primary" onClick={() => setEditing(true)}><Pencil size={17}/>Chỉnh sửa hồ sơ</button>}
          {isOwner && <Link className="space-btn secondary" to="/wallet"><Settings2 size={17}/>Ví & Premium</Link>}
        </div>

        <div className="profile-cover-content-v24">
          <button className="profile-avatar-edit" onClick={() => isOwner && setAvatarEditorOpen(true)}>
            <Avatar user={user} size="xl"/><span><Camera size={15}/></span>
          </button>
          <div className="profile-main-copy-v24">
            <div className="profile-name-line"><h1>{user.name}</h1><VerifyBadge show={user.verified}/><PremiumBadge show={user.premium}/></div>
            <small>@{user.id.replace('u_','')}</small>
            <p>{user.bio}</p>
            <div className="profile-meta-inline"><span>{user.school}</span><span>{user.major}</span><span><CalendarDays size={14}/> Tham gia {user.joinedAt}</span></div>
            <div className="profile-level-v24"><span>Cấp {user.level}</span><div><i style={{ width: `${Math.min(100, ((user.xp || user.level * 800) % 10000) / 100)}%` }}/></div><small>{formatNumber(user.xp || user.level * 800)} XP</small></div>
          </div>
          <div className="profile-actions-v24">
            <button onClick={() => document.getElementById('following-list')?.scrollIntoView({ behavior: 'smooth' })}><UsersRound size={19}/><span><small>Đang theo dõi</small><b>{formatNumber(followingList.length)}</b></span></button>
            <div><UsersRound size={19}/><span><small>Người theo dõi</small><b>{formatNumber(user.followers || followers.length)}</b></span></div>
            {!isOwner && <button className="follow-action" onClick={() => toggleFollow(user.id)}>{following ? <><Check size={17}/>Đang theo dõi</> : '+ Theo dõi'}</button>}
            {!isOwner && <Link className="message-action" to="/messages"><MessageCircle size={17}/>Nhắn tin</Link>}
          </div>
        </div>
      </section>

      <section className="profile-stat-strip-v24">
        {[
          ['Tài liệu', docs.length, FileText], ['Bài đăng', posts.length, BookOpen], ['Lượt xem', formatNumber(totalViews), Eye], ['Lượt tải', formatNumber(totalDownloads), BarChart3], ['Tổng thích', formatNumber(totalLikes), Heart], ['Số dư', canSeeBalance ? formatMoney(user.balance) : 'Riêng tư', LockKeyhole],
        ].map(([label, value, Icon]) => <div key={label}><span><Icon size={20}/></span><p><b>{value}</b><small>{label}</small></p></div>)}
      </section>

      <div className="profile-layout-v24">
        <main className="profile-main-v24">
          <section className="panel-universe profile-analytics-v24">
            <div className="analytics-head-universe">
              <div><span className="section-kicker">PHÂN TÍCH TÁC GIẢ</span><h2>Thống kê hoạt động</h2><p>Theo dõi lượt xem, lượt tải, tương tác và doanh thu theo thời gian.</p></div>
              <div className="period-tabs universe-periods">
                {[['today','Hôm nay'],['week','7 ngày'],['month','30 ngày'],['year','12 tháng'],['all','Năm']].map(([key,label]) => <button key={key} className={range === key ? 'active' : ''} onClick={() => { setRange(key); setCustomOpen(false); }}>{label}</button>)}
                <button className={customOpen ? 'active' : ''} onClick={() => setCustomOpen((value) => !value)}>Tùy chọn ngày</button>
              </div>
            </div>
            {customOpen && <div className="custom-date-bar"><label>Từ ngày<input type="date" value={customRange.from} onChange={(event) => setCustomRange({ ...customRange, from: event.target.value })}/></label><label>Đến ngày<input type="date" value={customRange.to} onChange={(event) => setCustomRange({ ...customRange, to: event.target.value })}/></label><button onClick={() => setRange('week')}>Áp dụng</button></div>}
            <MarketChart labels={chart.labels} series={[
              { key: 'views', label: 'Lượt xem', values: chart.views, color: '#355d4a' },
              { key: 'downloads', label: 'Lượt tải', values: chart.downloads, color: '#8b6b44' },
              { key: 'likes', label: 'Lượt thích', values: chart.likes, color: '#b36b68' },
              { key: 'revenue', label: 'Doanh thu (credit)', values: chart.revenue, color: '#6d7990' },
            ]} height={310} title="" subtitle=""/>
          </section>

          <section className="panel-universe profile-content-v24">
            <div className="panel-title-row"><div><span className="section-kicker">THƯ VIỆN CÁ NHÂN</span><h2>Nội dung của {isOwner ? 'bạn' : 'tác giả'}</h2><p>Tài liệu và bài viết học thuật đã chia sẻ với cộng đồng.</p></div><div className="content-tabs"><button className={contentTab === 'documents' ? 'active' : ''} onClick={() => setContentTab('documents')}>Tài liệu</button><button className={contentTab === 'posts' ? 'active' : ''} onClick={() => setContentTab('posts')}>Bài đăng</button></div></div>
            {contentTab === 'documents' ? <div className="profile-document-list-v24">{docs.map((doc) => <article key={doc.id}><Link to={`/documents/${doc.id}`}><BookCover doc={doc} size="mini"/><div><b>{doc.title}</b><small>{formatNumber(doc.views)} xem · {formatNumber(doc.downloads)} tải · {formatNumber(doc.likes)} thích</small></div></Link>{isOwner && <button onClick={() => setRange('month')}>Phân tích</button>}</article>)}</div> : <div className="profile-post-list-v24">{posts.map((post) => <article key={post.id}><Link to="/feed"><span><MessageCircle size={20}/></span><div><b>{post.title || post.content}</b><small>{formatNumber(post.likes)} thích · {post.comments?.length || 0} bình luận</small></div></Link>{isOwner && <button onClick={() => setRange('month')}>Phân tích</button>}</article>)}</div>}
          </section>

          <div className="profile-lower-grid-v24">
            <section id="following-list" className="panel-universe following-panel-v24">
              <div className="panel-title-row"><div><span className="section-kicker">KẾT NỐI HỌC THUẬT</span><h2>Đang theo dõi</h2><p>Chỉ hiển thị những người {isOwner ? 'bạn' : 'tài khoản này'} đang theo dõi.</p></div></div>
              {followingList.length ? followingList.map((member) => <Link key={member.id} to={`/users/${member.id}`} className="people-row-cosmic"><Avatar user={member}/><div><b>{member.name}</b><small>{member.school}</small></div><span>Đang theo dõi</span></Link>) : <p className="muted">Chưa theo dõi ai.</p>}
            </section>
            <section className="panel-universe security-card-v24"><div className="panel-title-row"><div><span className="section-kicker">BẢO MẬT</span><h2>Tài khoản</h2><p>Quản lý mật khẩu và xác thực.</p></div></div><div className="security-line"><ShieldCheck/><span><b>Xác thực 2 lớp</b><small>Đang bật</small></span></div><div className="security-line"><LockKeyhole/><span><b>Mật khẩu</b><small>Có bước xác nhận mật khẩu mới</small></span></div>{isOwner && <Link className="space-btn secondary full" to="/wallet">Mở bảo mật</Link>}</section>
          </div>
        </main>

        <aside className="panel-universe avatar-vault-v24">
          <div className="avatar-vault-head"><span className="section-kicker">BỘ SƯU TẬP CÁ NHÂN</span><h2>Túi khung avatar</h2><p>Khung được thiết kế tối giản, tĩnh và phù hợp với giao diện thư viện hiện đại.</p></div>
          <div className="frame-view-tabs-v24"><button className={frameView === 'owned' ? 'active' : ''} onClick={() => setFrameView('owned')}>Đã sở hữu</button><button className={frameView === 'all' ? 'active' : ''} onClick={() => setFrameView('all')}>Tất cả</button></div>
          <div className="avatar-frame-grid-v24 custom-scroll">
            {frameList.map((frame, index) => {
              const owned = (user.ownedFrames || []).includes(frame.id);
              const active = user.activeFrame === frame.id;
              const previewUser = { ...user, activeFrame: frame.id };
              const elegantName = frameNameByTier[Math.min(8, frame.tier || 1)] || 'Khung Học thuật';
              return <button key={frame.id} className={`avatar-frame-card-v24 ${owned ? 'owned' : 'locked'} ${active ? 'active' : ''}`} disabled={!owned || !isOwner} onClick={() => owned && isOwner && setAvatarFrame(frame.id)}>
                <Avatar user={previewUser} size="lg"/>
                <span><strong>{elegantName}{index > 7 ? ` ${String(index + 1).padStart(2, '0')}` : ''}</strong><small>{frame.requirement}</small></span>
                <em>{active ? 'Đang dùng' : owned ? 'Chọn' : 'Chưa mở'}</em>
              </button>;
            })}
          </div>
          <div className="avatar-vault-note-v24"><BookOpen size={18}/><p><b>Thiết kế mới:</b> viền mảnh, màu học thuật, không phát sáng mạnh và không có chuyển động.</p></div>
        </aside>
      </div>

      {editing && <div className="modal-backdrop"><div className="modal-card profile-edit-modal"><h2>Chỉnh sửa hồ sơ</h2><label>Tên hiển thị<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })}/></label><label>Tiểu sử<textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })}/></label><label>Trường<input value={form.school} onChange={(event) => setForm({ ...form, school: event.target.value })}/></label><label>Ngành<input value={form.major} onChange={(event) => setForm({ ...form, major: event.target.value })}/></label><div className="modal-actions"><button onClick={() => setEditing(false)}>Hủy</button><button className="primary" onClick={save}>Lưu thay đổi</button></div></div></div>}
      <AvatarEditorModal open={avatarEditorOpen} onClose={() => setAvatarEditorOpen(false)}/>
    </div>
  );
}
