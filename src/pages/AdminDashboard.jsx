import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  Activity, BadgeCheck, BanknoteArrowDown, BellRing, BookOpen, CircleDollarSign, FileClock, FileText,
  Frame, Gift, History, LayoutDashboard, LockKeyhole, MessageSquareText, Search, Settings, ShieldAlert,
  Sparkles, Upload, UserRoundCog, UsersRound, WalletCards, XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Avatar from '../components/Avatar.jsx';
import MarketChart from '../components/MarketChart.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { formatMoney, formatNumber } from '../utils/helpers.js';

const ranges = {
  today: { labels: ['08h','10h','12h','14h','16h','18h','20h'], users: [12,18,14,26,21,35,31], docs: [7,12,9,16,14,23,19], posts: [4,6,5,8,7,11,10], revenue: [120,220,180,350,300,510,460] },
  week: { labels: ['18/05','19/05','20/05','21/05','22/05','23/05','24/05'], users: [4200,5100,4550,6420,5900,7300,8420], docs: [2800,3600,3150,4700,4400,5900,6800], posts: [320,470,390,610,560,720,840], revenue: [7600,10300,8900,12800,11900,14200,15400] },
  month: { labels: ['Tuần 1','Tuần 2','Tuần 3','Tuần 4'], users: [15842,18912,21450,24860], docs: [10240,13550,16230,19680], posts: [1250,1680,1940,2310], revenue: [35600,42800,51600,64200] },
  year: { labels: ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'], users: [18000,22000,26000,31000,36000,42000,49000,57000,66000,78000,92000,108000], docs: [12000,15000,19000,23000,28000,34000,41000,49000,58000,68000,79000,92000], posts: [2100,2800,3400,4100,4900,5700,6600,7600,8700,9900,11200,12600], revenue: [42000,51000,62000,74000,88000,103000,119000,138000,158000,181000,207000,236000] },
};

const sideItems = [
  ['overview', LayoutDashboard, 'Tổng quan'], ['users', UsersRound, 'Người dùng'], ['documents', FileText, 'Tài liệu'],
  ['posts', MessageSquareText, 'Bài đăng'], ['transactions', WalletCards, 'Giao dịch & Credit'], ['topup', Upload, 'Nạp tiền'],
  ['withdraw', BanknoteArrowDown, 'Rút tiền'], ['reports', ShieldAlert, 'Báo cáo'], ['premium', BadgeCheck, 'Premium'],
  ['frames', Frame, 'Khung avatar'], ['logs', History, 'Nhật ký hoạt động'], ['settings', Settings, 'Cài đặt'],
];

export default function AdminDashboard() {
  const {
    state, getUser, adminApproveTransaction, adminRejectTransaction, adminLockUser, adminUnlockUser,
    adminDeleteDocument, adminDeletePost, adminChangeRole, adminToggleVerified,
    adminRevokeCredit, adminAddCredit, adminGrantFrame, adminUnlockAllFrames,
    adminSendNotification, adminResolveReport, adminAddBannedWord, adminRemoveBannedWord, resetDemo,
  } = useApp();
  const [tab, setTab] = useState('overview');
  const [range, setRange] = useState('week');
  const [query, setQuery] = useState('');
  const [lock, setLock] = useState({ userId: '', days: '7', reason: 'Spam / quảng cáo' });
  const [deleteDoc, setDeleteDoc] = useState(null);
  const [deleteReason, setDeleteReason] = useState('Nội dung vi phạm quy định cộng đồng.');
  const [deletePost, setDeletePost] = useState(null);
  const [postDeleteReason, setPostDeleteReason] = useState('Bài đăng vi phạm quy định cộng đồng.');
  const [newBannedWord, setNewBannedWord] = useState('');
  const [creditModal, setCreditModal] = useState({ userId: '', mode: 'add', amount: 100, reason: 'Thưởng hoạt động cộng đồng' });
  const [frameModal, setFrameModal] = useState({ userId: '', frameId: state.avatarFrames[0]?.id || '' });
  const [noticeModal, setNoticeModal] = useState({ userId: '', title: '', text: '' });
  const [premiumUser, setPremiumUser] = useState(null);
  const [reportNote, setReportNote] = useState('Đã kiểm tra và xử lý theo quy định.');
  const [statusFilter, setStatusFilter] = useState('pending');

  const pendingReports = state.reports.filter((item) => item.status === 'pending');
  const pendingTopup = state.transactions.filter((item) => item.status === 'pending' && item.type === 'topup');
  const pendingPremium = state.transactions.filter((item) => item.status === 'pending' && item.type === 'premium');
  const pendingWithdraw = state.transactions.filter((item) => item.status === 'pending' && item.type === 'withdraw');
  const premiumUsers = state.users.filter((user) => user.premium);
  const chart = ranges[range];
  const filterByStatus = (items) => statusFilter === 'all' ? items : items.filter((item) => statusFilter === 'done' ? ['done','resolved'].includes(item.status) : item.status === statusFilter);
  const filteredReports = filterByStatus(state.reports);

  const foundUsers = state.users.filter((user) => `${user.name} ${user.email} ${user.id}`.toLowerCase().includes(query.toLowerCase()));
  const foundDocs = state.documents.filter((doc) => `${doc.title} ${doc.subject} ${doc.id}`.toLowerCase().includes(query.toLowerCase()));
  const foundPosts = state.posts.filter((post) => `${post.content} ${post.id}`.toLowerCase().includes(query.toLowerCase()));

  const stats = useMemo(() => ({
    users: 128764 + state.users.length,
    newUsers: 2341,
    docs: 126482 + state.documents.length,
    posts: 15842 + state.posts.length,
    revenue: 164250000,
    spentCredit: 412875 + state.transactions.reduce((sum, tx) => sum + (tx.credit || 0), 0),
    premium: premiumUsers.length,
    reports: pendingReports.length,
  }), [pendingReports.length, premiumUsers.length, state]);

  const detailRows = [
    ['Đăng ký mới',128,842,2841,18234], ['Người dùng Premium mới',76,512,1732,9876], ['Tổng người dùng',2341,15842,48912,128764],
    ['Bài đăng mới',95,603,2115,11245], ['Tài liệu mới',173,1245,4782,22719], ['Credit đã tiêu',3560,24310,89450,412875],
    ['Người nạp mới',66,412,1285,6842], ['Yêu cầu nạp',pendingTopup.length,563,1867,9765], ['Yêu cầu rút',pendingWithdraw.length,287,1024,5620],
    ['Báo cáo mới',pendingReports.length,87,312,1250], ['Gia hạn Premium chờ duyệt',pendingPremium.length,152,512,2734], ['Tài liệu bị xóa',9,41,156,694],
  ];

  function exportExcel() {
    const workbook = XLSX.utils.book_new();
    const summary = [
      ['Chỉ số','Giá trị'], ['Tổng người dùng',stats.users], ['Người dùng mới 7 ngày',stats.newUsers], ['Tổng tài liệu',stats.docs],
      ['Tổng bài đăng',stats.posts], ['Doanh thu hệ thống',stats.revenue], ['Credit đã tiêu',stats.spentCredit], ['Tài khoản Premium',stats.premium],
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summary), 'Tong quan');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(state.users.map((user) => ({ ID:user.id, Ten:user.name, Email:user.email, Vai_tro:user.role, Premium:user.premium ? 'Có' : 'Không', Goi:user.premiumInfo?.plan || '', Ngay_mua:user.premiumInfo?.purchasedAt || '', Het_han:user.premiumInfo?.expiresAt || '', Credit:user.credit, Trang_thai:user.lockedUntil ? `Khóa ${user.lockedUntil}` : 'Hoạt động' }))), 'Nguoi dung');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(state.documents.map((doc) => ({ ID:doc.id, Tai_lieu:doc.title, Tac_gia:getUser(doc.authorId).name, Luot_xem:doc.views, Luot_tai:doc.downloads, Luot_thich:doc.likes, Danh_gia:doc.rating }))), 'Tai lieu');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(state.transactions), 'Giao dich');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(state.adminLogs || []), 'Nhat ky admin');
    XLSX.writeFile(workbook, `DocShare-Bao-Cao-${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  function quick(action) {
    const map = { users:'users', documents:'documents', reports:'reports', withdraw:'withdraw', premium:'premium', frames:'frames', logs:'logs', settings:'settings' };
    setTab(map[action] || 'overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="admin-universe page">
      <aside className="admin-nav-universe">
        <div className="admin-brand"><b>DocShare</b><span>ADMIN CENTER</span></div>
        <div className="admin-nav-scroll custom-scroll">
          {sideItems.map(([id, Icon, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}><Icon size={18}/><span>{label}</span>{id === 'reports' && pendingReports.length > 0 && <em>{pendingReports.length}</em>}</button>)}
        </div>
        <div className="admin-system-card"><Activity size={18}/><b>Hệ thống ổn định</b><small>Uptime 99,98% · V16</small><button onClick={() => setTab('logs')}>Xem nhật ký</button></div>
      </aside>

      <main className="admin-main-universe">
        <div className="admin-top-title"><div><h1>{sideItems.find(([id]) => id === tab)?.[2]}</h1><p>Quản trị dữ liệu, tài chính, nội dung và quyền người dùng.</p></div><div><button className="space-btn secondary" onClick={exportExcel}>Xuất báo cáo Excel</button></div></div>
        <div className="admin-global-search"><Search size={18}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm người dùng, tài liệu, ID, giao dịch..."/><button onClick={() => setQuery('')}>Xóa lọc</button></div>

        {tab === 'overview' && <>
          <section className="admin-kpi-grid-universe">
            <Kpi icon={UsersRound} label="Tổng người dùng" value={formatNumber(stats.users)} delta="12,6%" tone="violet"/>
            <Kpi icon={UserRoundCog} label="Người dùng mới (7 ngày)" value={formatNumber(stats.newUsers)} delta="18,3%" tone="green"/>
            <Kpi icon={FileText} label="Tài liệu" value={formatNumber(stats.docs)} delta="9,7%" tone="blue"/>
            <Kpi icon={MessageSquareText} label="Bài đăng" value={formatNumber(stats.posts)} delta="11,2%" tone="orange"/>
            <Kpi icon={CircleDollarSign} label="Doanh thu hệ thống" value={formatMoney(stats.revenue)} delta="22,4%" tone="emerald"/>
          </section>

          <div className="admin-overview-universe">
            <section className="panel-universe admin-chart-panel">
              <div className="analytics-head-universe"><div><h2>Thống kê hoạt động</h2><p>Các nút thời gian hoạt động và cập nhật biểu đồ.</p></div><div className="period-tabs universe-periods">{[['today','Hôm nay'],['week','7 ngày'],['month','30 ngày'],['year','12 tháng']].map(([key,label]) => <button key={key} className={range === key ? 'active' : ''} onClick={() => setRange(key)}>{label}</button>)}</div></div>
              <MarketChart labels={chart.labels} series={[
                { key:'users', label:'Người dùng mới', values:chart.users, color:'#8b5cf6' },
                { key:'docs', label:'Tài liệu mới', values:chart.docs, color:'#3b82f6' },
                { key:'posts', label:'Bài đăng mới', values:chart.posts, color:'#f59e0b' },
                { key:'revenue', label:'Doanh thu', values:chart.revenue, color:'#22c55e' },
              ]} height={320} title="" subtitle=""/>
              <div className="admin-detail-table"><table><thead><tr><th>Chỉ số</th><th>Hôm nay</th><th>7 ngày</th><th>30 ngày</th><th>Tổng</th></tr></thead><tbody>{detailRows.map((row) => <tr key={row[0]}><td>{row[0]}</td>{row.slice(1).map((value,index) => <td key={index}>{formatNumber(value)}</td>)}</tr>)}</tbody></table></div>
            </section>
            <aside className="admin-queues">
              <Queue title="Báo cáo đang xử lý" count={pendingReports.length} onAll={() => quick('reports')} items={pendingReports.map((item) => [item.reason, item.userId, item.createdAt])}/>
              <Queue title="Duyệt gia hạn Premium" count={pendingPremium.length} onAll={() => quick('premium')} items={pendingPremium.map((item) => [item.userId, item.note, item.date])}/>
              <Queue title="Rút tiền đang chờ" count={pendingWithdraw.length} onAll={() => quick('withdraw')} items={pendingWithdraw.map((item) => [item.userId, formatMoney(item.amount), item.date])}/>
            </aside>
          </div>

          <section className="panel-universe admin-quick-tools"><div className="panel-title-row"><div><h2>Công cụ quản trị nhanh</h2><p>Mọi nút đều chuyển đến khu vực thao tác tương ứng.</p></div></div><div>{[
            ['users','Tìm người dùng',UsersRound],['documents','Tìm tài liệu',FileText],['reports','Duyệt báo cáo',ShieldAlert],['withdraw','Duyệt rút tiền',BanknoteArrowDown],
            ['premium','Quản lý Premium',BadgeCheck],['frames','Cấp khung avatar',Frame],['logs','Nhật ký hoạt động',History],['settings','Cấu hình hệ thống',Settings],
          ].map(([id,label,Icon]) => <button key={id} onClick={() => quick(id)}><Icon size={20}/>{label}</button>)}</div></section>
        </>}

        {tab === 'users' && <section className="panel-universe admin-list-panel"><PanelHead title="Quản lý người dùng" text={`${foundUsers.length} tài khoản phù hợp`}/>{foundUsers.map((user) => <div className="admin-user-row" key={user.id}><Avatar user={user}/><div><b>{user.name}</b><small>{user.email} · {user.id} · {formatNumber(user.credit)} credit</small><span className={user.lockedUntil ? 'danger-text' : 'success-text'}>{user.lockedUntil ? `Đang khóa: ${user.lockedUntil}` : 'Đang hoạt động'}</span></div><div className="row-actions"><Link to={`/users/${user.id}`}>Hồ sơ</Link><button onClick={() => setCreditModal({ userId:user.id, mode:'add', amount:100, reason:'Thưởng hoạt động cộng đồng' })}>Cộng credit</button><button onClick={() => setCreditModal({ userId:user.id, mode:'revoke', amount:100, reason:'Điều chỉnh vi phạm hoặc hoàn tác giao dịch' })}>Thu hồi</button><button onClick={() => adminToggleVerified(user.id)}>{user.verified ? 'Bỏ tích xanh' : 'Cấp tích xanh'}</button><select aria-label="Đổi quyền" value={user.role} onChange={(event) => adminChangeRole(user.id,event.target.value)}><option value="user">User</option><option value="teacher">Teacher</option><option value="admin">Admin</option></select><button onClick={() => setFrameModal({ userId:user.id, frameId:state.avatarFrames[0].id })}>Trao khung</button><button onClick={() => adminUnlockAllFrames(user.id)}>Mở mọi khung</button>{user.lockedUntil ? <button onClick={() => adminUnlockUser(user.id)}>Mở khóa</button> : <button className="danger" onClick={() => setLock({ ...lock, userId:user.id })}>Khóa</button>}</div></div>)}</section>}

        {tab === 'documents' && <section className="panel-universe admin-list-panel"><PanelHead title="Quản lý tài liệu" text={`${foundDocs.length} tài liệu`}/>{foundDocs.map((doc) => <div className="admin-content-row" key={doc.id}><span className={`mini-doc-cover ${doc.color}`}>{doc.cover}</span><div><b>{doc.title}</b><small>{getUser(doc.authorId).name} · {formatNumber(doc.views)} xem · {formatNumber(doc.downloads)} tải</small></div><div className="row-actions"><Link to={`/documents/${doc.id}`}>Mở tài liệu</Link><button className="danger" onClick={() => setDeleteDoc(doc)}>Xóa</button></div></div>)}</section>}

        {tab === 'posts' && <section className="panel-universe admin-list-panel"><PanelHead title="Quản lý bài đăng" text={`${foundPosts.length} bài đăng`}/>{foundPosts.map((post) => <div className="admin-content-row" key={post.id}><MessageSquareText/><div><b>{post.content}</b><small>{getUser(post.authorId).name} · {formatNumber(post.likes)} thích · {post.comments?.length || 0} bình luận</small></div><div className="row-actions"><Link to="/feed">Mở bảng tin</Link><button className="danger" onClick={() => setDeletePost(post)}>Xóa bài</button></div></div>)}</section>}

        {['transactions','topup'].includes(tab) && <section className="panel-universe admin-list-panel"><PanelHead title={tab === 'topup' ? 'Duyệt nạp credit' : 'Tất cả giao dịch'} text="Lọc nhanh theo trạng thái để xử lý không bị nhầm."/><AdminStatusFilter value={statusFilter} onChange={setStatusFilter} items={state.transactions.filter((item) => tab === 'topup' ? item.type === 'topup' : true)}/><TransactionList embedded title="" items={filterByStatus(state.transactions.filter((item) => tab === 'topup' ? item.type === 'topup' : true))} getUser={getUser} approve={adminApproveTransaction} reject={adminRejectTransaction}/></section>} 
        {tab === 'withdraw' && <section className="panel-universe admin-list-panel"><PanelHead title="Duyệt rút tiền" text="Theo dõi yêu cầu chờ, đã duyệt và đã từ chối."/><AdminStatusFilter value={statusFilter} onChange={setStatusFilter} items={state.transactions.filter((item) => item.type === 'withdraw')}/><TransactionList embedded title="" items={filterByStatus(state.transactions.filter((item) => item.type === 'withdraw'))} getUser={getUser} approve={adminApproveTransaction} reject={adminRejectTransaction}/></section>} 

        {tab === 'reports' && <section className="panel-universe admin-list-panel"><PanelHead title="Duyệt báo cáo" text="Xem nội dung, xử lý, khóa tài khoản hoặc xóa tài liệu"/><AdminStatusFilter value={statusFilter} onChange={setStatusFilter} items={state.reports}/>{filteredReports.length ? filteredReports.map((report) => { const target = report.type === 'document' ? state.documents.find((doc) => doc.id === report.targetId) : state.posts.find((post) => post.id === report.targetId); return <div className={`admin-report-row ${report.status}`} key={report.id}><ShieldAlert/><div><b>{target?.title || target?.content || report.targetId}</b><small>{getUser(report.userId).name} · {report.reason} · {report.createdAt}</small><span>{report.status === 'pending' ? 'Chờ xử lý' : `Đã xử lý: ${report.action || 'Hoàn tất'}`}</span></div><div className="row-actions"><Link to={report.type === 'document' ? `/documents/${report.targetId}` : '/feed'}>Xem</Link>{report.status === 'pending' && <><button onClick={() => adminResolveReport(report.id,'Cảnh cáo',reportNote)}>Cảnh cáo</button><button onClick={() => setLock({ ...lock, userId:report.userId })}>Khóa user</button>{report.type === 'document' && target && <button className="danger" onClick={() => setDeleteDoc(target)}>Xóa</button>}<button onClick={() => adminResolveReport(report.id,'Bỏ qua',reportNote)}>Bỏ qua</button></>}</div></div>; }) : <div className="admin-empty-filter"><ShieldAlert/><h3>Không có báo cáo trong bộ lọc này</h3><p>Chọn trạng thái khác để xem thêm.</p></div>}</section>}

        {tab === 'premium' && <section className="panel-universe admin-list-panel"><PanelHead title="Danh sách người đăng ký Premium" text="Xem đầy đủ gói, ngày mua, hạn dùng và lịch sử gia hạn"/>
          <div className="premium-admin-table"><table><thead><tr><th>Người dùng</th><th>Gói</th><th>Ngày mua</th><th>Hết hạn</th><th>Trạng thái</th><th>Lịch sử</th></tr></thead><tbody>{premiumUsers.map((user) => <tr key={user.id}><td><span className="table-user"><Avatar user={user}/><span><b>{user.name}</b><small>{user.id}</small></span></span></td><td>{user.premiumInfo?.plan || 'Premium'}</td><td>{user.premiumInfo?.purchasedAt || 'Chưa có dữ liệu'}</td><td>{user.premiumInfo?.expiresAt || 'Không xác định'}</td><td><span className="status done">Đang hoạt động</span></td><td><button onClick={() => setPremiumUser(user)}>Xem lịch sử</button></td></tr>)}</tbody></table></div>
          <h3 className="subsection-title">Yêu cầu gia hạn Premium</h3><AdminStatusFilter value={statusFilter} onChange={setStatusFilter} items={state.transactions.filter((item) => item.type === 'premium')}/><TransactionList embedded title="" items={filterByStatus(state.transactions.filter((item) => item.type === 'premium'))} getUser={getUser} approve={adminApproveTransaction} reject={adminRejectTransaction}/>
        </section>}

        {tab === 'frames' && <section className="panel-universe admin-list-panel"><PanelHead title="Quản lý khung avatar" text="Admin có thể mở toàn bộ hoặc cấp từng khung cho người dùng"/>{foundUsers.map((user) => <div className="admin-user-row" key={user.id}><Avatar user={user}/><div><b>{user.name}</b><small>{(user.ownedFrames || []).length}/{state.avatarFrames.length} khung đã mở · Đang dùng {user.activeFrame}</small></div><div className="row-actions"><button onClick={() => setFrameModal({ userId:user.id, frameId:state.avatarFrames[0].id })}>Cấp khung</button><button onClick={() => adminUnlockAllFrames(user.id)}>Mở toàn bộ</button></div></div>)}</section>}

        {tab === 'logs' && <section className="panel-universe admin-list-panel"><PanelHead title="Nhật ký hoạt động Admin" text="Mọi hành động quản trị được ghi lại"/><div className="admin-log-list custom-scroll">{(state.adminLogs || []).map((log) => <div key={log.id}><History/><span><b>{log.action}</b><small>{log.detail}</small></span><time>{log.date}</time></div>)}</div></section>}

        {tab === 'settings' && <section className="panel-universe admin-list-panel"><PanelHead title="Cài đặt hệ thống" text="Từ khóa vi phạm, dữ liệu demo và thông báo hệ thống"/><div className="settings-grid-admin"><div><h3>Từ khóa không cho đăng</h3><div className="banned-word-compose"><input value={newBannedWord} onChange={(event) => setNewBannedWord(event.target.value)} placeholder="Nhập từ/cụm từ cần chặn"/><button onClick={() => { if (adminAddBannedWord(newBannedWord)) setNewBannedWord(''); }}>Thêm</button></div><div className="tag-cloud">{state.bannedWords.map((word) => <button title="Bấm để xóa" key={word} onClick={() => adminRemoveBannedWord(word)}>{word} ×</button>)}</div></div><div><h3>Gửi thông báo</h3><button className="space-btn primary" onClick={() => setNoticeModal({ userId:state.users[1]?.id || '', title:'Thông báo từ DocShare', text:'' })}><BellRing size={17}/>Tạo thông báo</button></div><div><h3>Dữ liệu demo</h3><button className="space-btn danger" onClick={resetDemo}><XCircle size={17}/>Reset dữ liệu demo</button></div></div></section>}
      </main>

      <ConfirmModal open={Boolean(lock.userId)} title="Khóa tài khoản" confirmText="Khóa tài khoản" danger onClose={() => setLock({ ...lock, userId:'' })} onConfirm={() => { adminLockUser(lock.userId,lock.days,lock.reason); setLock({ ...lock, userId:'' }); }}><label>Thời hạn<select value={lock.days} onChange={(event) => setLock({ ...lock, days:event.target.value })}><option value="1">1 ngày</option><option value="3">3 ngày</option><option value="7">7 ngày</option><option value="30">30 ngày</option><option value="90">90 ngày</option><option value="365">365 ngày</option><option value="forever">Vĩnh viễn</option></select></label><label>Lý do<select value={lock.reason} onChange={(event) => setLock({ ...lock, reason:event.target.value })}><option>Spam / quảng cáo</option><option>Vi phạm bản quyền</option><option>Ngôn từ không phù hợp</option><option>Lừa đảo</option><option>Tái phạm nhiều lần</option></select></label></ConfirmModal>
      <ConfirmModal open={Boolean(deleteDoc)} title="Xác nhận xóa tài liệu" confirmText="Xóa tài liệu" danger onClose={() => setDeleteDoc(null)} onConfirm={() => { adminDeleteDocument(deleteDoc.id,deleteReason); setDeleteDoc(null); }}><p>Tài liệu: <b>{deleteDoc?.title}</b></p><label>Lý do xóa<textarea value={deleteReason} onChange={(event) => setDeleteReason(event.target.value)} /></label></ConfirmModal>
      <ConfirmModal open={Boolean(deletePost)} title="Xác nhận xóa bài đăng" confirmText="Xóa bài đăng" danger onClose={() => setDeletePost(null)} onConfirm={() => { adminDeletePost(deletePost.id,postDeleteReason); setDeletePost(null); }}><p>Bài đăng: <b>{deletePost?.content}</b></p><label>Lý do xóa<textarea value={postDeleteReason} onChange={(event) => setPostDeleteReason(event.target.value)} /></label></ConfirmModal>

      {creditModal.userId && <div className="modal-backdrop"><div className="modal-card admin-tool-modal"><h2>{creditModal.mode === 'add' ? 'Cộng credit' : 'Thu hồi credit'}</h2><p>Tài khoản: <b>{getUser(creditModal.userId).name}</b></p><label>Số credit<input type="number" value={creditModal.amount} onChange={(event) => setCreditModal({ ...creditModal, amount:event.target.value })}/></label><label>Lý do<textarea value={creditModal.reason} onChange={(event) => setCreditModal({ ...creditModal, reason:event.target.value })}/></label><div className="modal-actions"><button onClick={() => setCreditModal({ ...creditModal, userId:'' })}>Hủy</button><button className="primary" onClick={() => { creditModal.mode === 'add' ? adminAddCredit(creditModal.userId,creditModal.amount,creditModal.reason) : adminRevokeCredit(creditModal.userId,creditModal.amount,creditModal.reason); setCreditModal({ ...creditModal, userId:'' }); }}>Xác nhận</button></div></div></div>}

      {frameModal.userId && <div className="modal-backdrop"><div className="modal-card admin-tool-modal"><h2>Trao khung avatar</h2><p>Tài khoản: <b>{getUser(frameModal.userId).name}</b></p><label>Chọn khung<select value={frameModal.frameId} onChange={(event) => setFrameModal({ ...frameModal, frameId:event.target.value })}>{state.avatarFrames.map((frame) => <option key={frame.id} value={frame.id}>{frame.name} · {frame.requirement}</option>)}</select></label><div className="modal-actions"><button onClick={() => setFrameModal({ ...frameModal, userId:'' })}>Hủy</button><button className="primary" onClick={() => { adminGrantFrame(frameModal.userId,frameModal.frameId); setFrameModal({ ...frameModal, userId:'' }); }}>Trao khung</button></div></div></div>}

      {noticeModal.userId && <div className="modal-backdrop"><div className="modal-card admin-tool-modal"><h2>Gửi thông báo</h2><label>Người nhận<select value={noticeModal.userId} onChange={(event) => setNoticeModal({ ...noticeModal, userId:event.target.value })}>{state.users.map((user) => <option key={user.id} value={user.id}>{user.name} · {user.id}</option>)}</select></label><label>Tiêu đề<input value={noticeModal.title} onChange={(event) => setNoticeModal({ ...noticeModal, title:event.target.value })}/></label><label>Nội dung<textarea value={noticeModal.text} onChange={(event) => setNoticeModal({ ...noticeModal, text:event.target.value })}/></label><div className="modal-actions"><button onClick={() => setNoticeModal({ ...noticeModal, userId:'' })}>Hủy</button><button className="primary" onClick={() => { adminSendNotification(noticeModal.userId,noticeModal.title,noticeModal.text); setNoticeModal({ ...noticeModal, userId:'' }); }}>Gửi</button></div></div></div>}

      {premiumUser && <div className="modal-backdrop"><div className="modal-card premium-history-modal"><button className="modal-close" onClick={() => setPremiumUser(null)}>×</button><div className="premium-history-user"><Avatar user={premiumUser} size="lg"/><div><h2>{premiumUser.name}</h2><p>{premiumUser.email} · {premiumUser.id}</p></div></div><dl><dt>Gói hiện tại</dt><dd>{premiumUser.premiumInfo?.plan || 'Premium'}</dd><dt>Ngày mua</dt><dd>{premiumUser.premiumInfo?.purchasedAt || 'Chưa có'}</dd><dt>Hết hạn</dt><dd>{premiumUser.premiumInfo?.expiresAt || 'Không xác định'}</dd><dt>Credit hiện có</dt><dd>{formatNumber(premiumUser.credit)}</dd><dt>Điểm hoạt động</dt><dd>{formatNumber(premiumUser.activityPoints || 0)}</dd></dl><h3>Lịch sử gia hạn</h3>{(premiumUser.premiumInfo?.renewals || []).map((item,index) => <div className="renewal-history-row" key={index}><span><b>{item.plan}</b><small>{item.date}</small></span><strong>+{item.creditBonus} credit</strong><em>{item.status}</em></div>)}</div></div>}
    </div>
  );
}

function Kpi({ icon: Icon, label, value, delta, tone }) { return <article className={`admin-kpi-universe ${tone}`}><div><small>{label}</small><b>{value}</b><span>↑ {delta} so với kỳ trước</span></div><i><Icon size={24}/></i></article>; }
function PanelHead({ title, text }) { return <div className="panel-title-row"><div><h2>{title}</h2><p>{text}</p></div></div>; }
function Queue({ title, count, onAll, items }) { return <section className="queue-universe"><div><h3>{title} <em>{count}</em></h3><button onClick={onAll}>Xem tất cả →</button></div><div className="queue-scroll custom-scroll">{items.length ? items.slice(0,5).map((item,index) => <p key={index}><i>●</i><span><b>{item[0]}</b><small>{item[1]}</small></span><time>{item[2]}</time></p>) : <p className="empty">Không có yêu cầu chờ.</p>}</div></section>; }
function AdminStatusFilter({ value, onChange, items }) {
  const counts = {
    all: items.length,
    pending: items.filter((item) => item.status === 'pending').length,
    done: items.filter((item) => item.status === 'done' || item.status === 'resolved').length,
    rejected: items.filter((item) => item.status === 'rejected').length,
  };
  return <div className="admin-status-filter">{[
    ['pending','Chưa xử lý'],['done','Đã xử lý'],['rejected','Đã từ chối'],['all','Tất cả'],
  ].map(([key,label]) => <button key={key} className={value === key ? 'active' : ''} onClick={() => onChange(key)}><span>{label}</span><b>{counts[key]}</b></button>)}</div>;
}
function TransactionList({ title, items, getUser, approve, reject, embedded = false }) { const content = <>{title && <PanelHead title={title} text="Duyệt hoặc từ chối, trạng thái được lưu ngay"/>}{items.map((tx) => <div className="admin-transaction-row" key={tx.id}><div><b>{getUser(tx.userId).name}</b><small>{tx.type} · {formatMoney(tx.amount)} · {formatNumber(tx.credit)} credit · {tx.note}</small></div><span className={`status ${tx.status}`}>{tx.status}</span><div className="row-actions">{tx.status === 'pending' && <><button className="success" onClick={() => approve(tx.id)}>Duyệt</button><button className="danger" onClick={() => reject(tx.id,'Thông tin không hợp lệ')}>Từ chối</button></>}</div></div>)}</>; return embedded ? content : <section className="panel-universe admin-list-panel">{content}</section>; }
