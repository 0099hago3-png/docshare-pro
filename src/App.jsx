import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import LeftRail from './components/LeftRail.jsx';
import ChatBot from './components/ChatBot.jsx';
import MiniMessenger from './components/MiniMessenger.jsx';
import Toast from './components/Toast.jsx';
import GiftEffect from './components/GiftEffect.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Documents from './pages/Documents.jsx';
import Categories from './pages/Categories.jsx';
import DocumentDetail from './pages/DocumentDetail.jsx';
import UploadPage from './pages/UploadPage.jsx';
import Feed from './pages/Feed.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Wallet from './pages/Wallet.jsx';
import Messages from './pages/Messages.jsx';
import Support from './pages/Support.jsx';
import History from './pages/History.jsx';
import GiftVault from './pages/GiftVault.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <LeftRail />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/support" element={<Support />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/users/:id" element={<Profile />} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/gifts" element={<ProtectedRoute><GiftVault /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <MiniMessenger />
      <ChatBot />
      <GiftEffect />
      <Toast />
    </>
  );
}
