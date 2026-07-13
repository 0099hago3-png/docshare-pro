import { Outlet } from 'react-router-dom';

import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import FloatingActions from './FloatingActions.jsx';
import ChatBot from './ChatBot.jsx';
import MiniMessenger from './MiniMessenger.jsx';
import { UnreadProvider } from '../context/UnreadContext.jsx';

import '../v61-hotfix.css';

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
