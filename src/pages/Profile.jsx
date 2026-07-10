import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BarChart3, BookOpen, CalendarDays, Camera, Eye, FileText, Heart, LockKeyhole, MessageCircle, Pencil, Settings2, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Avatar from '../components/Avatar.jsx';
import AvatarEditorModal from '../components/AvatarEditorModal.jsx';
import MarketChart from '../components/MarketChart.jsx';
import CoverPets from '../components/CoverPets.jsx';
import PetBag from '../components/PetBag.jsx';
import { PremiumBadge, TitleBadge, VerifyBadge } from '../components/Badges.jsx';
import { formatMoney, formatNumber } from '../utils/helpers.js';

const chartSets = {
  today: { labels: ['08h','10h','12h','14h','16h','18h','20h'], views: [230,390,350,620,570,840,760], downloads: [80,130,110,210,190,280,250], likes: [18,26,21,39,34,52,46], revenue: [20,45,35,70,65,100,92] },
  week: { labels: ['18/05','19/05','20/05','21/05','22/05','23/05','24/05'], views: [4200,5100,4550,6420,5900,7300,8420], downloads: [1350,1680,1450,1840,1710,2150,2430], likes: [310,420,365,532,490,610,690], revenue: [180,220,195,310,285,390,470] },
  month: { labels: ['Tuần 1','Tuần 2','Tuần 3','Tuần 4'], views: [14200,18900,23100,28800], downloads: [3900,4800,6100,7300], likes: [820,1050,1320,1680], revenue: [1250,1840,2460,3150] },
  year: { labels: ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'], views: [14000,18500,21000,24500,28600,33000,38100,42000,47500,53000,59000,64200], downloads: [3800,4500,5300,6100,7200,8400,9700,10900,12100,13600,15100,16900], likes: [620,780,860,1020,1180,1350,1540,1720,1940,2200,2450,2710], revenue: [820,950,1200,1450,1730,2050,2400,2880,3250,3670,4110,4820] },
  all: { labels: ['2022','2023','2024','2025','2026'], views: [8200,24100,58700,93600,128600], downloads: [1900,5800,13100,19800,24300], likes: [410,1220,3150,4820,6482], revenue: [300,1100,3400,5600,8820] },
};

export default function Profile() {
  const { id } = useParams();
  const {
    state, currentUser, getUser, toggleFollow, updateProfile, setAvatarFrame, setActiveTitle, setPanelSkin,
    buyPet, toggleActivePet, togglePetsVisibility, feedPet, petPet,
    buyPetAccessory, equipPetAccessory, setPetPlacement,
  } = useApp();
  const user = id ? getUser(id) : currentUser;
  const isOwner = currentUser?.id === user?.id;
  const isAdmin = currentUser?.role === 'admin';
  const canSeeBalance = isOwner || isAdmin;
  const [range, setRange] = useState('week');
  const [customOpen, setCustomOpen] = useState(false);
  const [customRange, setCustomRange] = useState({ from: '2026-07-01', to: '2026-07-09' });
  const [editing, setEditing] = useState(false);
  const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);
  const [frameFilter, setFrameFilter] = useState('all');
  const [contentTab, setContentTab] = useState('documents');
  const [customizationTab, setCustomizationTab] = useState('frames');
  const [panelKind, setPanelKind] = useState('comment');
  const [form, setForm] = useState({ name: user.name, bio: user.bio, school: user.school, major: user.major, avatar: user.avatar, cover: user.cover || '' });

  const docs = state.documents.filter((doc) => doc.authorId === user.id);
  const posts = state.posts.filter((post) => post.authorId === user.id);
  const following = state.follows.includes(user.id);
  const totalViews = docs.reduce((sum, doc) => sum + doc.views, 0);
  const totalDownloads = docs.reduce((sum, doc) => sum + doc.downloads, 0);
  const totalLikes = docs.reduce((sum, doc) => sum + doc.likes, 0);
  const followers = state.users.filter((member) => (member.following || []).includes(user.id)).concat(state.follows.includes(user.id) ? [currentUser] : []).filter(Boolean);
  const followingList = useMemo(() => (user.following || []).map((uid) => getUser(uid)), [getUser, state.users, user.following]);
  const chart = chartSets[range];
  
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

  const petActions = { buyPet, toggleActivePet, togglePetsVisibility, feedPet, petPet, buyPetAccessory, equipPetAccessory, setPetPlacement };

  return (
    <div className="page universe-page profile-universe profile-v21">
      <section className="profile-cosmos-cover" style={form.cover ? { backgroundImage: `linear-gradient(90deg,rgba(2,6,23,.94),rgba(15,23,42,.28)),url(${form.cover})` } : undefined}>
        <div className="cosmos-dust" />
        <CoverPets user={user} isOwner={isOwner} onFeed={feedPet} onPet={petPet}/>
        <div className="profile-cover-tools">
          {isOwner && <label className="space-btn secondary"><Camera size={17}/>Đổi ảnh bìa<input type="file" accept="image/*" onChange={coverChange}/></label>}
          {isOwner && <button className="space-btn primary" onClick={() => setEditing(true)}><Pencil size={17}/>Chỉnh sửa hồ sơ</button>}
          {isOwner && <Link className="space-btn secondary" to="/wallet"><Settings2 size={17}/>Ví & Premium</Link>}
        </div>

        <div className="profile-cosmos-content">
          <button className="profile-avatar-edit" onClick={() => isOwner && setAvatarEditorOpen(true)}>
            <Avatar user={user} size="xl"/><span><Camera size={15}/></span>
          </button>
          <div className="profile-main-copy">
            <div className="profile-name-line"><h1>{user.name}</h1><VerifyBadge show={user.verified}/><PremiumBadge show={user.premium}/></div>
            <small>@{user.id.replace('u_','')}</small>
            <p>{user.bio}</p>
            <div className="profile-meta-inline"><span>✦ {user.school}</span><span>◈ {user.major}</span><span><CalendarDays size={14}/> Tham gia {user.joinedAt}</span></div>
            <div className="level-progress-row"><span className={`cosmic-level level-${Math.min(5, Math.ceil((user.level || 1) / 20))}`}>Lv.{user.level}</span><div className="xp-track"><i style={{ width: `${Math.min(100, ((user.xp || user.level * 800) % 10000) / 100)}%` }}/></div><small>{formatNumber(user.xp || user.level * 800)} XP</small></div>
          </div>
          <div className="profile-follow-stats">
            <button onClick={() => document.getElementById('follow-lists')?.scrollIntoView({ behavior: 'smooth' })}><UsersRound size={21}/><span><small>Đang theo dõi</small><b>{formatNumber(followingList.length)}</b></span></button>
            <button><UsersRound size={21}/><span><small>Người theo dõi</small><b>{formatNumber(user.followers || followers.length)}</b></span></button>
            {!isOwner && <button className="follow-action" onClick={() => toggleFollow(user.id)}>{following ? '✓ Đang theo dõi' : '+ Theo dõi'}</button>}
            {!isOwner && <Link className="message-action" to="/messages"><MessageCircle size={18}/>Nhắn tin</Link>}
          </div>
        </div>
      </section>

      <section className="cosmic-stat-strip">
        {[
          ['Tài liệu', docs.length, FileText], ['Bài đăng', posts.length, BookOpen], ['Lượt xem', formatNumber(totalViews), Eye], ['Lượt tải', formatNumber(totalDownloads), BarChart3], ['Tổng thích', formatNumber(totalLikes), Heart], ['Số dư', canSeeBalance ? formatMoney(user.balance) : 'Riêng tư', LockKeyhole],
        ].map(([label, value, Icon]) => <div key={label}><span><Icon size={21}/></span><p><b>{value}</b><small>{label}</small></p></div>)}
      </section>

      <div className="profile-cosmos-grid profile-cosmos-grid-v21">
        <main>
          <section className="panel-universe profile-analytics">
            <div className="analytics-head-universe">
              <div><h2>Thống kê hoạt động</h2><p>Theo dõi lượt xem, lượt tải, tương tác và doanh thu theo thời gian.</p></div>
              <div className="period-tabs universe-periods">
                {[['today','Hôm nay'],['week','7 ngày'],['month','30 ngày'],['year','12 tháng'],['all','Năm']].map(([key,label]) => <button key={key} className={range === key ? 'active' : ''} onClick={() => { setRange(key); setCustomOpen(false); }}>{label}</button>)}
                <button className={customOpen ? 'active' : ''} onClick={() => setCustomOpen((value) => !value)}>Tùy chọn ngày</button>
              </div>
            </div>
            {customOpen && <div className="custom-date-bar"><label>Từ ngày<input type="date" value={customRange.from} onChange={(event) => setCustomRange({ ...customRange, from: event.target.value })}/></label><label>Đến ngày<input type="date" value={customRange.to} onChange={(event) => setCustomRange({ ...customRange, to: event.target.value })}/></label><button onClick={() => setRange('week')}>Áp dụng</button></div>}
            <MarketChart labels={chart.labels} series={[
              { key: 'views', label: 'Lượt xem', values: chart.views, color: '#4ea8ff' },
              { key: 'downloads', label: 'Lượt tải', values: chart.downloads, color: '#35e0a1' },
              { key: 'likes', label: 'Lượt thích', values: chart.likes, color: '#ff4da6' },
              { key: 'revenue', label: 'Doanh thu (credit)', values: chart.revenue, color: '#ffb84d' },
            ]} height={330} title="" subtitle=""/>
            <div className="analytics-detail-table"><table><thead><tr><th>Mốc thời gian</th><th>Lượt xem</th><th>Lượt tải</th><th>Lượt thích</th><th>Doanh thu</th></tr></thead><tbody>{chart.labels.map((label,index) => <tr key={label}><td>{label}</td><td>{formatNumber(chart.views[index])}</td><td>{formatNumber(chart.downloads[index])}</td><td>{formatNumber(chart.likes[index])}</td><td>{formatNumber(chart.revenue[index])} credit</td></tr>)}</tbody></table></div>
          </section>

          <section className="panel-universe profile-content-panel">
            <div className="panel-title-row"><div><h2>Nội dung của {isOwner ? 'bạn' : 'tác giả'}</h2><p>Tài liệu và bài viết học thuật đã chia sẻ với cộng đồng.</p></div><div className="content-tabs"><button className={contentTab === 'documents' ? 'active' : ''} onClick={() => setContentTab('documents')}>Tài liệu</button><button className={contentTab === 'posts' ? 'active' : ''} onClick={() => setContentTab('posts')}>Bài đăng</button></div></div>
            {contentTab === 'documents' ? <div className="author-content-list">{docs.map((doc) => <article key={doc.id}><Link to={`/documents/${doc.id}`}><span className={`mini-doc-cover ${doc.color}`}>{doc.cover}</span><div><b>{doc.title}</b><small>{formatNumber(doc.views)} xem · {formatNumber(doc.downloads)} tải · {formatNumber(doc.likes)} thích</small></div></Link>{isOwner && <button onClick={() => setRange('month')}>Phân tích</button>}</article>)}</div> : <div className="author-content-list">{posts.map((post) => <article key={post.id}><Link to="/feed"><span className="mini-doc-cover post"><MessageCircle/></span><div><b>{post.title || post.content}</b><small>{formatNumber(post.likes)} thích · {post.comments?.length || 0} bình luận</small></div></Link>{isOwner && <button onClick={() => setRange('month')}>Phân tích</button>}</article>)}</div>}
          </section>
          <div id="follow-lists" className="profile-follow-grid profile-follow-grid-v23">
            <section className="panel-universe follow-only-panel-v23">
              <div className="panel-title-row"><div><h2>Đang theo dõi</h2><p>Chỉ hiển thị những người {isOwner ? 'bạn' : 'tài khoản này'} đang theo dõi.</p></div></div>
              {followingList.length ? followingList.map((member) => <Link key={member.id} to={`/users/${member.id}`} className="people-row-cosmic"><Avatar user={member}/><div><b>{member.name}</b><small>@{member.id.replace('u_','')}</small></div><span>Đang theo dõi</span></Link>) : <p className="muted">Chưa theo dõi ai.</p>}
            </section>
            <section className="panel-universe security-card"><div className="panel-title-row"><div><h2>Bảo mật</h2><p>Quản lý mật khẩu và xác thực.</p></div></div><div className="security-line"><ShieldCheck/><span><b>Xác thực 2 lớp</b><small>Đang bật</small></span></div><div className="security-line"><LockKeyhole/><span><b>Mật khẩu</b><small>Có bước xác nhận mật khẩu mới</small></span></div>{isOwner && <Link className="space-btn secondary full" to="/wallet">Mở bảo mật</Link>}</section>
            <section className="panel-universe quick-note-panel-v23"><div className="panel-title-row"><div><h2>Tùy chỉnh hồ sơ</h2><p>Đã ẩn khu danh hiệu, túi bảng và khung để giao diện gọn hơn.</p></div></div><ul className="quick-note-list"><li>Giữ tối đa 2 thú cưng hoạt động ngoài bìa.</li><li>Cổ long tinh vân bay phía sau nội dung ảnh bìa.</li><li>Thú cưng thường đứng cạnh nút hoặc giữa bìa cho dễ nhìn.</li></ul></section>
          </div>
        </main>
      </div>

      <PetBag user={user} petCatalog={state.petCatalog || []} petAccessories={state.petAccessories || []} isOwner={isOwner} actions={petActions}/>

      {editing && <div className="modal-backdrop"><div className="modal-card profile-edit-modal"><h2>Chỉnh sửa hồ sơ</h2><label>Tên hiển thị<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })}/></label><label>Tiểu sử<textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })}/></label><label>Trường<input value={form.school} onChange={(event) => setForm({ ...form, school: event.target.value })}/></label><label>Ngành<input value={form.major} onChange={(event) => setForm({ ...form, major: event.target.value })}/></label><div className="modal-actions"><button onClick={() => setEditing(false)}>Hủy</button><button className="primary" onClick={save}>Lưu thay đổi</button></div></div></div>}
      <AvatarEditorModal open={avatarEditorOpen} onClose={() => setAvatarEditorOpen(false)}/>
    </div>
  );
}
