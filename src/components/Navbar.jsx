import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, BookOpenText, ChevronDown, FileText, Heart, Search, ShieldAlert, Sparkles, UserRound, WalletCards } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { normalizeText } from '../utils/helpers.js';
import Avatar from './Avatar.jsx';
import { PremiumBadge } from './Badges.jsx';

export default function Navbar() {
  const navigate = useNavigate();
  const { state, currentUser, logout, markNotification, markAllNotifications } = useApp();
  const [keyword, setKeyword] = useState('');
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotice, setOpenNotice] = useState(false);
  const [noticeTab, setNoticeTab] = useState('all');
  const [focus, setFocus] = useState(false);
  const headerRef = useRef(null);
  const unread = state.notifications.filter((notice) => notice.unread).length;

  const searchResults = useMemo(() => {
    const q = normalizeText(keyword.trim());
    if (!q) return [];
    const docs = state.documents
      .filter((doc) => normalizeText(`${doc.title} ${doc.subject} ${(doc.tags || []).join(' ')}`).includes(q))
      .slice(0, 5)
      .map((doc) => ({ id: doc.id, title: doc.title, subtitle: `${doc.type} · ${doc.subject}`, to: `/documents/${doc.id}`, icon: <FileText size={18} /> }));
    const users = state.users
      .filter((user) => normalizeText(`${user.name} ${user.school} ${user.major}`).includes(q))
      .slice(0, 3)
      .map((user) => ({ id: user.id, title: user.name, subtitle: `${user.school} · Cấp ${user.level}`, to: `/users/${user.id}`, user }));
    return [...docs, ...users];
  }, [keyword, state.documents, state.users]);

  const visibleNotices = useMemo(() => state.notifications.filter((notice) => {
    if (noticeTab === 'unread') return notice.unread;
    if (noticeTab === 'important') return notice.important;
    return true;
  }), [noticeTab, state.notifications]);

  useEffect(() => {
    function closeOutside(event) {
      if (!headerRef.current?.contains(event.target)) {
        setOpenProfile(false);
        setOpenNotice(false);
        setFocus(false);
      }
    }
    document.addEventListener('mousedown', closeOutside);
    return () => document.removeEventListener('mousedown', closeOutside);
  }, []);

  function submitSearch(event) {
    event.preventDefault();
    const q = keyword.trim();
    navigate(q ? `/documents?q=${encodeURIComponent(q)}` : '/documents');
    setFocus(false);
  }

  function openResult(item) {
    setKeyword(item.title);
    setFocus(false);
    navigate(item.to);
  }

  function openNotification(item) {
    const to = markNotification(item.id);
    setOpenNotice(false);
    navigate(to || '/');
  }

  return (
    <header className="topbar universe-topbar" ref={headerRef}>
      <Link to="/" className="brand"><span className="brand-mark"><BookOpenText size={19}/><i>D</i></span><span className="brand-copy"><b>DocShare</b><small>ACADEMIC LIBRARY</small></span></Link>

      <form className="global-search fb-search" onSubmit={submitSearch}>
        <Search size={18} />
        <input
          value={keyword}
          onFocus={() => setFocus(true)}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm tài liệu, tác giả, chủ đề..."
        />
        <button type="submit">Tìm</button>
        {focus && (
          <div className="search-suggestions social-search-panel">
            <div className="suggestion-title">{keyword.trim() ? 'Kết quả phù hợp' : 'Tìm kiếm trên DocShare'}</div>
            {keyword.trim() && searchResults.length === 0 && <p className="empty-search">Chưa tìm thấy kết quả. Nhấn Enter để tìm toàn bộ.</p>}
            {searchResults.map((item) => (
              <button type="button" key={item.id} onMouseDown={() => openResult(item)}>
                {item.user ? <Avatar user={item.user} /> : <span className="search-result-icon">{item.icon}</span>}
                <span><b>{item.title}</b><small>{item.subtitle}</small></span>
              </button>
            ))}
            {keyword.trim() && <button type="submit" className="search-all-row"><Search size={18}/><span>Xem tất cả kết quả cho “{keyword.trim()}”</span></button>}
          </div>
        )}
      </form>

      <nav className="nav-menu">
        <NavLink to="/">Trang chủ</NavLink>
        <NavLink to="/documents">Tài liệu</NavLink>
        <NavLink to="/categories">Danh mục</NavLink>
        <NavLink to="/feed">Bảng tin</NavLink>
        <NavLink to="/leaderboard">Xếp hạng</NavLink>
        <NavLink to="/upload">Đăng tải</NavLink>
        {currentUser?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
      </nav>

      <div className="nav-actions">
        <div className="dropdown-wrap">
          <button className="round-btn bell-btn" aria-label="Thông báo" onClick={() => { setOpenNotice((value) => !value); setOpenProfile(false); }}>
            <Bell size={19}/>{unread > 0 && <em>{unread}</em>}
          </button>
          {openNotice && (
            <div className="notice-panel universe-notice-panel">
              <div className="panel-head"><h3>Thông báo</h3><button onClick={markAllNotifications}>Đánh dấu đã đọc</button></div>
              <div className="notice-tabs-mini">
                <button className={noticeTab === 'all' ? 'active' : ''} onClick={() => setNoticeTab('all')}>Tất cả {state.notifications.length}</button>
                <button className={noticeTab === 'unread' ? 'active' : ''} onClick={() => setNoticeTab('unread')}>Chưa đọc {unread}</button>
                <button className={noticeTab === 'important' ? 'active' : ''} onClick={() => setNoticeTab('important')}>Quan trọng</button>
              </div>
              <div className="notice-list custom-scroll">
                {visibleNotices.map((item) => (
                  <button key={item.id} className={item.unread ? 'unread' : ''} onClick={() => openNotification(item)}>
                    <i className={`notice-kind ${item.kind || 'default'}`}>
                      {item.kind === 'like' ? <Heart size={19}/> : item.kind === 'wallet' ? <WalletCards size={19}/> : item.kind === 'report' ? <ShieldAlert size={19}/> : item.kind === 'frame' ? <Sparkles size={19}/> : <Bell size={19}/>} 
                    </i>
                    <span><b>{item.title}</b><small>{item.text}</small><time>{item.date || 'Vừa xong'}</time></span>
                    {item.unread && <em className="unread-dot"/>}
                  </button>
                ))}
                {!visibleNotices.length && <p className="empty-search">Không có thông báo trong mục này.</p>}
              </div>
            </div>
          )}
        </div>

        {currentUser ? (
          <div className="dropdown-wrap">
            <button className="profile-chip" onClick={() => { setOpenProfile((value) => !value); setOpenNotice(false); }}>
              <Avatar user={currentUser}/>
              <span className="profile-text"><b>{currentUser.name}</b><PremiumBadge show={currentUser.premium}/></span>
              <ChevronDown size={16}/>
            </button>
            {openProfile && (
              <div className="profile-dropdown universe-profile-dropdown">
                <div className="profile-card-mini"><Avatar user={currentUser} size="lg"/><div><b>{currentUser.name}</b><PremiumBadge show={currentUser.premium}/><small>ID: {currentUser.id}</small></div></div>
                <Link to="/profile" onClick={() => setOpenProfile(false)}><UserRound size={17}/>Hồ sơ cá nhân</Link>
                <Link to="/wallet" onClick={() => setOpenProfile(false)}><WalletCards size={17}/>Ví credit & Premium</Link>
                <Link to="/messages" onClick={() => setOpenProfile(false)}>Tin nhắn</Link>
                <Link to="/history" onClick={() => setOpenProfile(false)}>Lịch sử hoạt động</Link>
                <Link to="/support" onClick={() => setOpenProfile(false)}>Trung tâm hỗ trợ</Link>
                {currentUser.role === 'admin' && <Link to="/admin" onClick={() => setOpenProfile(false)}>Quản trị Admin</Link>}
                <button onClick={() => { logout(); setOpenProfile(false); navigate('/login'); }}>Đăng xuất</button>
              </div>
            )}
          </div>
        ) : <Link className="btn primary small" to="/login">Đăng nhập</Link>}
      </div>
    </header>
  );
}
