import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { supabase } from './lib/supabase.js';
import Navbar from './components/Navbar.jsx';
import LeftRail from './components/LeftRail.jsx';
import ChatBot from './components/ChatBot.jsx';
import MiniMessenger from './components/MiniMessenger.jsx';
import Toast from './components/Toast.jsx';
import GiftEffect from './components/GiftEffect.jsx';

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

import { useApp } from './context/AppContext.jsx';

/* Bắt buộc đăng nhập */
function RequireLogin({ children }) {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* Chỉ Admin mới được vào */
function RequireAdmin({ children }) {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

/* Đã đăng nhập thì không quay lại Login/Register */
function GuestOnly({ children }) {
  const { currentUser } = useApp();

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  console.log(
  'Supabase đã kết nối:',
  supabase
);
  const { currentUser } = useApp();
  const location = useLocation();

  const isLoginPage =
    location.pathname === '/login' ||
    location.pathname === '/register';

  /* Chỉ hiện Navbar và menu sau khi đăng nhập */
  const showWebsiteLayout = currentUser && !isLoginPage;

  return (
    <>
      {showWebsiteLayout && <Navbar />}

      {showWebsiteLayout && <LeftRail />}

      <main
        className={
          showWebsiteLayout
            ? 'app-main'
            : 'auth-main'
        }
      >
        <Routes>

          {/* ĐĂNG NHẬP */}
          <Route
            path="/login"
            element={
              <GuestOnly>
                <Login />
              </GuestOnly>
            }
          />

          {/* ĐĂNG KÝ */}
          <Route
            path="/register"
            element={
              <GuestOnly>
                <Register />
              </GuestOnly>
            }
          />

          {/* TRANG CHỦ */}
          <Route
            path="/"
            element={
              <RequireLogin>
                <Home />
              </RequireLogin>
            }
          />

          {/* DANH SÁCH TÀI LIỆU */}
          <Route
            path="/documents"
            element={
              <RequireLogin>
                <Documents />
              </RequireLogin>
            }
          />

          {/* CHI TIẾT TÀI LIỆU */}
          <Route
            path="/documents/:id"
            element={
              <RequireLogin>
                <DocumentDetail />
              </RequireLogin>
            }
          />

          {/* DANH MỤC */}
          <Route
            path="/categories"
            element={
              <RequireLogin>
                <Categories />
              </RequireLogin>
            }
          />

          {/* BẢNG TIN */}
          <Route
            path="/feed"
            element={
              <RequireLogin>
                <Feed />
              </RequireLogin>
            }
          />

          {/* XẾP HẠNG */}
          <Route
            path="/leaderboard"
            element={
              <RequireLogin>
                <Leaderboard />
              </RequireLogin>
            }
          />

          {/* HỖ TRỢ */}
          <Route
            path="/support"
            element={
              <RequireLogin>
                <Support />
              </RequireLogin>
            }
          />

          {/* ĐĂNG TÀI LIỆU */}
          <Route
            path="/upload"
            element={
              <RequireLogin>
                <UploadPage />
              </RequireLogin>
            }
          />

          {/* TRANG CÁ NHÂN */}
          <Route
            path="/profile"
            element={
              <RequireLogin>
                <Profile />
              </RequireLogin>
            }
          />

          {/* HỒ SƠ NGƯỜI KHÁC */}
          <Route
            path="/users/:id"
            element={
              <RequireLogin>
                <Profile />
              </RequireLogin>
            }
          />

          {/* VÍ CREDIT */}
          <Route
            path="/wallet"
            element={
              <RequireLogin>
                <Wallet />
              </RequireLogin>
            }
          />

          {/* HỘP THƯ */}
          <Route
            path="/messages"
            element={
              <RequireLogin>
                <Messages />
              </RequireLogin>
            }
          />

          {/* LỊCH SỬ */}
          <Route
            path="/history"
            element={
              <RequireLogin>
                <History />
              </RequireLogin>
            }
          />

          {/* KHO QUÀ */}
          <Route
            path="/gifts"
            element={
              <RequireLogin>
                <GiftVault />
              </RequireLogin>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />

          {/* LINK SAI */}
          <Route
            path="*"
            element={
              <Navigate
                to={currentUser ? '/' : '/login'}
                replace
              />
            }
          />

        </Routes>
      </main>

      {/* Chỉ hiện sau khi đăng nhập */}
      {showWebsiteLayout && <MiniMessenger />}

      {showWebsiteLayout && <ChatBot />}

      {showWebsiteLayout && <GiftEffect />}

      <Toast />
    </>
  );
}