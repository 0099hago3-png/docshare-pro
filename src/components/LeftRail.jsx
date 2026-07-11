import { NavLink } from 'react-router-dom';
import {
  Award, BookOpen, CircleHelp, Gift, Home, LibraryBig, Mail, ShieldCheck,
  Trophy, UploadCloud, UsersRound, WalletCards,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const commonLinks = [
  ['/', Home, 'Trang chủ'],
  ['/documents', BookOpen, 'Tài liệu'],
  ['/categories', LibraryBig, 'Danh mục'],
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
  const links = currentUser?.role === 'admin' ? [...commonLinks, ['/admin', ShieldCheck, 'Quản trị Admin']] : commonLinks;

  return (
    <aside className="left-rail-v17 left-rail-v25" aria-label="Điều hướng nhanh">
      <div className="rail-title"><span><BookOpen size={18}/></span><div><b>DocShare Pro</b><small>ACADEMIC LIBRARY</small></div></div>
      <nav>{links.map(([to, Icon, text]) => <NavLink key={to} to={to} end={to === '/'} title={text}><Icon size={18}/><span>{text}</span></NavLink>)}</nav>
      <div className="rail-season-card rail-season-v25">
        <span><Award size={20}/></span><small>MÙA HỌC THUẬT</small><b>THƯ KHỐ 2026</b>
        <div><i style={{width:'72%'}}/></div><em>72% tiến độ mùa</em>
      </div>
    </aside>
  );
}
