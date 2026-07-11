import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="21"
      height="21"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="21"
      height="21"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

export default function MobileHeader() {
  const navigate = useNavigate();

  const {
    currentUser,
    state,
  } = useApp();

  const unreadCount = (
    state.notifications || []
  ).filter((item) => item.unread).length;

  return (
    <header className="mobile-header">
      <Link
        to="/"
        className="mobile-header-brand"
      >
        <span className="mobile-header-logo">
          📖
        </span>

        <span>
          <strong>DocShare Pro</strong>
          <small>Green Academic Library</small>
        </span>
      </Link>

      <div className="mobile-header-actions">
        <button
          type="button"
          className="mobile-header-button"
          onClick={() => navigate('/documents')}
          aria-label="Tìm tài liệu"
        >
          <SearchIcon />
        </button>

        <button
          type="button"
          className="mobile-header-button"
          onClick={() => navigate('/profile')}
          aria-label="Thông báo"
        >
          <BellIcon />

          {unreadCount > 0 && (
            <span className="mobile-header-badge">
              {unreadCount > 9
                ? '9+'
                : unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          className="mobile-header-avatar"
          onClick={() => navigate('/profile')}
          aria-label="Trang cá nhân"
        >
          {currentUser?.avatarImage ? (
            <img
              src={currentUser.avatarImage}
              alt={currentUser.name}
            />
          ) : (
            <span>
              {currentUser?.name
                ?.charAt(0)
                ?.toUpperCase() || 'U'}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}