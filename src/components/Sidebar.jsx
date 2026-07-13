import { BookOpen, CircleHelp, Gift, History, Home, LayoutGrid, Mail, Newspaper, ShieldCheck, Trophy, Upload, WalletCards } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const primary = [
  ['/', Home, 'Trang chủ'],
  ['/documents', BookOpen, 'Tài liệu'],
  ['/categories', LayoutGrid, 'Danh mục'],
  ['/feed', Newspaper, 'Bảng tin'],
  ['/leaderboard', Trophy, 'Xếp hạng'],
  ['/upload', Upload, 'Đăng tải'],
  ['/wallet', WalletCards, 'Ví & Premium'],
  ['/gifts', Gift, 'Kho quà'],
  ['/messages', Mail, 'Tin nhắn'],
  ['/history', History, 'Lịch sử'],
  ['/support', CircleHelp, 'Hỗ trợ'],
];

export default function Sidebar() {
  const { currentUser } = useApp();
  return (
    <aside className="sidebar">
      <div className="sidebar-mini-brand"><img src="/assets/logo-mark.svg" alt="" /><span><strong>DocShare Pro</strong><small>ACADEMIC LIBRARY</small></span></div>
      <nav>
        {primary.map(([to, Icon, label]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={18} /><span>{label}</span></NavLink>
        ))}
        {currentUser?.role === 'admin' && <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}><ShieldCheck size={18} /><span>Quản trị Admin</span></NavLink>}
      </nav>
      <div className="sidebar-quote">
        <strong>Chia sẻ tri thức</strong>
        <span>Kết nối cộng đồng</span>
        <em>Cùng nhau tiến bộ</em>
      </div>
    </aside>
  );
}
