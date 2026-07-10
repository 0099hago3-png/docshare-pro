import { NavLink } from 'react-router-dom';
import {
  BarChart3, BookOpen, CircleHelp, Gift, Home, Mail, ShieldCheck,
  Trophy, UploadCloud, UsersRound, WalletCards,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const commonLinks = [
  ['/', Home, 'Trang chủ'],
  ['/documents', BookOpen, 'Tài liệu'],
  ['/feed', UsersRound, 'Bảng tin'],
  ['/leaderboard', Trophy, 'Xếp hạng'],
  ['/upload', UploadCloud, 'Đăng tải'],
  ['/wallet', WalletCards, 'Ví & Premium'],
  ['/gifts', Gift, 'Kho quà'],
  ['/messages', Mail, 'Tin nhắn'],
  ['/support', CircleHelp, 'Hỗ trợ'],
];

export default function LeftRail() {
  const { currentUser } = useApp();
  const links = currentUser?.role === 'admin'
    ? [...commonLinks, ['/admin', ShieldCheck, 'Quản trị Admin']]
    : commonLinks;

  return (
    <aside className="left-rail-v17" aria-label="Điều hướng nhanh">
      <div className="rail-title"><span>✦</span><div><b>DocShare</b><small>UNIVERSE</small></div></div>
      <nav>
        {links.map(([to, Icon, text]) => (
          <NavLink key={to} to={to} end={to === '/'} title={text}>
            <Icon size={19}/><span>{text}</span>
          </NavLink>
        ))}
      </nav>
      <div className="rail-season-card">
        <span>◈</span><small>MÙA HIỆN TẠI</small><b>THIÊN HÀ 2026</b>
        <div><i style={{width:'72%'}}/></div><em>72% tiến độ</em>
      </div>
    </aside>
  );
}
