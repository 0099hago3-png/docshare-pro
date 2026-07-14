import { Outlet } from 'react-router-dom';

import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import FloatingActions from './FloatingActions.jsx';
import ChatBot from './ChatBot.jsx';
import MiniMessenger from './MiniMessenger.jsx';
import { UnreadProvider } from '../context/UnreadContext.jsx';

import '../v61-hotfix.css';
import '../v62-admin-notifications.css';
import '../v63-premium-notifications.css';
import '../v64-premium-security-modal-fix.css';
import '../v65-green-premium-wallet-gifts.css';
import '../v66-layout-avatar-fix.css';
import '../v67-profile-images.css';
import '../v68-profile-avatar-left.css';
import '../v69-auto-cover-ratio.css';
import '../v70-premium-cart-email.css';
import '../v72-home-search-dropdown-fix.css';
import '../v74-compact-home-hover-sidebar.css';

export default function AppShell() {
  return (
    <UnreadProvider>
      <div className="app-shell">
        <Navbar />
        <Sidebar />

        <main className="app-main">
          <Outlet />
        </main>

        <FloatingActions />
        <ChatBot />
        <MiniMessenger />
      </div>
    </UnreadProvider>
  );
}
