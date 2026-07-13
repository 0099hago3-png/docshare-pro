import { Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell.jsx';
import { GuestOnly, RequireAdmin, RequireAuth } from './components/ProtectedRoute.jsx';
import Toasts from './components/Toasts.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Categories from './pages/Categories.jsx';
import DocumentDetail from './pages/DocumentDetail.jsx';
import Documents from './pages/Documents.jsx';
import Feed from './pages/Feed.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import GiftVault from './pages/GiftVault.jsx';
import History from './pages/History.jsx';
import Home from './pages/Home.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Login from './pages/Login.jsx';
import Messages from './pages/Messages.jsx';
import NotFound from './pages/NotFound.jsx';
import Profile from './pages/Profile.jsx';
import Register from './pages/Register.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Support from './pages/Support.jsx';
import UploadPage from './pages/UploadPage.jsx';
import Wallet from './pages/Wallet.jsx';

export default function App() {
  return (
    <>
      <Routes>
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route element={<GuestOnly />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route index element={<Home />} />
            <Route path="documents" element={<Documents />} />
            <Route path="documents/:id" element={<DocumentDetail />} />
            <Route path="documents/:id/edit" element={<UploadPage mode="edit" />} />
            <Route path="categories" element={<Categories />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="feed" element={<Feed />} />
            <Route path="profile/:id" element={<Profile />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="gifts" element={<GiftVault />} />
            <Route path="messages" element={<Messages />} />
            <Route path="history" element={<History />} />
            <Route path="support" element={<Support />} />
            <Route element={<RequireAdmin />}>
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
      <Toasts />
    </>
  );
}
