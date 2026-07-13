import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import FloatingActions from './FloatingActions.jsx';
import ChatBot from './ChatBot.jsx';
import MiniMessenger from './MiniMessenger.jsx';

export default function AppShell() {
  return (
    <div className="app-shell">
      <Navbar />
      <Sidebar />
      <main className="app-main"><Outlet /></main>
      <FloatingActions />
      <ChatBot />
      <MiniMessenger />
    </div>
  );
}
