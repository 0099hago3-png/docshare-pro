import {
  Bell,
  ChevronDown,
  LogOut,
  Search,
  ShieldCheck,
  Upload,
  UserRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useApp } from '../context/AppContext.jsx';
import { useUnread } from '../context/UnreadContext.jsx';
import Avatar from './Avatar.jsx';

const links = [
  ['/', 'Trang chủ'],
  ['/documents', 'Tài liệu'],
  ['/categories', 'Danh mục'],
  ['/feed', 'Bảng tin'],
  ['/leaderboard', 'Xếp hạng'],
];

function CountBadge({ value, title }) {
  const count = Number(value || 0);

  if (count <= 0) return null;

  return (
    <span className="unread-count-badge" title={title}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function Navbar() {
  const { currentUser, logout, toast } = useApp();
  const {
    notifications,
    adminTotal,
    markNotificationsRead,
  } = useUnread();

  const [keyword, setKeyword] = useState('');
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  const name = useMemo(
    () => currentUser?.full_name || currentUser?.username || 'Tài khoản',
    [currentUser],
  );

  function search(event) {
    event.preventDefault();

    navigate(
      keyword.trim()
        ? `/documents?search=${encodeURIComponent(keyword.trim())}`
        : '/documents',
    );
  }

  async function handleLogout() {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      toast(error.message, 'error');
    }
  }

  async function openNotifications() {
    await markNotificationsRead();
    navigate('/history');
  }

  return (
    <header className="navbar">
      <Link className="brand" to="/">
        <img src="/assets/logo-mark.svg" alt="" />

        <span>
          <strong>DocShare</strong> <em>Pro</em>
          <small>GREEN ACADEMIC LIBRARY</small>
        </span>
      </Link>

      <form className="navbar-search" onSubmit={search}>
        <Search size={17} />

        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm tài liệu, môn học, tác giả..."
        />

        <button type="submit">Tìm</button>
      </form>

      <nav className="navbar-links">
        {links.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {label}
          </NavLink>
        ))}

        <NavLink
          className={({ isActive }) => (
            `navbar-upload${isActive ? ' active' : ''}`
          )}
          to="/upload"
        >
          <Upload size={15} />
          Đăng tải
        </NavLink>

        {currentUser?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) => (
              `navbar-admin-link${isActive ? ' active' : ''}`
            )}
          >
            <span>Admin</span>
            <CountBadge
              value={adminTotal}
              title="Mục Admin đang chờ xử lý"
            />
          </NavLink>
        )}
      </nav>

      <div className="navbar-actions">
        <button
          className="icon-button notification-icon-button"
          type="button"
          onClick={openNotifications}
          title={
            notifications > 0
              ? `${notifications} thông báo chưa đọc`
              : 'Thông báo'
          }
          aria-label="Thông báo"
        >
          <Bell size={19} />

          <CountBadge
            value={notifications}
            title="Thông báo chưa đọc"
          />
        </button>

        <div className="account-menu">
          <button
            className="account-menu__trigger"
            type="button"
            onClick={() => setOpen((value) => !value)}
          >
            <Avatar profile={currentUser} size={34} />

            <span>
              <strong>{name}</strong>
              <small>
                {currentUser?.role === 'admin'
                  ? 'Quản trị viên'
                  : 'Thành viên'}
              </small>
            </span>

            <ChevronDown size={15} />
          </button>

          {open && (
            <>
              <button
                className="menu-backdrop"
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng"
              />

              <div className="account-menu__dropdown">
                <Link
                  to={`/profile/${currentUser?.id}`}
                  onClick={() => setOpen(false)}
                >
                  <UserRound size={17} />
                  Hồ sơ
                </Link>

                {currentUser?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                  >
                    <ShieldCheck size={17} />
                    Quản trị

                    <CountBadge
                      value={adminTotal}
                      title="Mục Admin đang chờ xử lý"
                    />
                  </Link>
                )}

                <button type="button" onClick={handleLogout}>
                  <LogOut size={17} />
                  Đăng xuất
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
