import {
  BookOpen,
  CircleHelp,
  Gift,
  History,
  Home,
  LayoutGrid,
  Mail,
  Newspaper,
  ShieldCheck,
  Trophy,
  Upload,
  WalletCards,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { useApp } from '../context/AppContext.jsx';
import { useUnread } from '../context/UnreadContext.jsx';

const primary = [
  ['/', Home, 'Trang chủ', null],
  ['/documents', BookOpen, 'Tài liệu', null],
  ['/categories', LayoutGrid, 'Danh mục', null],
  ['/feed', Newspaper, 'Bảng tin', null],
  ['/leaderboard', Trophy, 'Xếp hạng', null],
  ['/upload', Upload, 'Đăng tải', null],
  ['/wallet', WalletCards, 'Ví & Premium', null],
  ['/gifts', Gift, 'Kho quà', null],
  ['/messages', Mail, 'Tin nhắn', 'messages'],
  ['/history', History, 'Lịch sử', null],
  ['/support', CircleHelp, 'Hỗ trợ', null],
];

function CountBadge({ value, title }) {
  const count = Number(value || 0);

  if (count <= 0) return null;

  return (
    <span
      className="sidebar-unread-badge"
      title={title}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function Sidebar() {
  const { currentUser } = useApp();
  const { messages } = useUnread();

  return (
    <aside className="sidebar">
      <div className="sidebar-mini-brand">
        <img src="/assets/logo-mark.svg" alt="" />

        <span>
          <strong>DocShare Pro</strong>
          <small>ACADEMIC LIBRARY</small>
        </span>
      </div>

      <nav>
        {primary.map(([to, Icon, label, badgeKey]) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => (
              isActive ? 'active' : ''
            )}
          >
            <Icon size={18} />
            <span>{label}</span>

            {badgeKey === 'messages' && (
              <CountBadge
                value={messages}
                title="Tin nhắn chưa đọc"
              />
            )}
          </NavLink>
        ))}

        {currentUser?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) => (
              isActive ? 'active' : ''
            )}
          >
            <ShieldCheck size={18} />
            <span>Quản trị Admin</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-quote">
        <strong>Chia sẻ tri thức</strong>
        <span>Kết nối cộng đồng</span>
        <em>Cùng nhau tiến bộ</em>
      </div>
    </aside>
  );
}
