import {
  NavLink,
} from 'react-router-dom';

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10.5V21h14V10.5" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v17H7.5A3.5 3.5 0 0 0 4 22Z" />
      <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H12v17h4.5A3.5 3.5 0 0 1 20 22Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function Item({
  to,
  label,
  icon,
  end = false,
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        isActive
          ? 'mobile-nav-item active'
          : 'mobile-nav-item'
      }
    >
      <span className="mobile-nav-icon">
        {icon}
      </span>

      <span className="mobile-nav-label">
        {label}
      </span>
    </NavLink>
  );
}

export default function MobileBottomNav() {
  return (
    <nav className="mobile-bottom-nav">
      <Item
        to="/"
        end
        label="Trang chủ"
        icon={<HomeIcon />}
      />

      <Item
        to="/documents"
        label="Tài liệu"
        icon={<BookIcon />}
      />

      <NavLink
        to="/upload"
        className="mobile-upload-nav"
      >
        <span className="mobile-upload-circle">
          <PlusIcon />
        </span>

        <span>
          Đăng tải
        </span>
      </NavLink>

      <Item
        to="/messages"
        label="Tin nhắn"
        icon={<MessageIcon />}
      />

      <Item
        to="/profile"
        label="Cá nhân"
        icon={<UserIcon />}
      />
    </nav>
  );
}