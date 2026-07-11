import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { useApp } from './context/AppContext.jsx';

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


function RequireLogin({ children }) {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


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


function GuestOnly({ children }) {
  const { currentUser } = useApp();

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return children;
}


function AppLayout({ children }) {
  const { currentUser } = useApp();
  const location = useLocation();

  const isAuthPage =
    location.pathname === '/login'
    || location.pathname === '/register';

  const showWebsiteLayout =
    Boolean(currentUser)
    && !isAuthPage;

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
        {children}
      </main>

      {showWebsiteLayout && <MiniMessenger />}

      {showWebsiteLayout && <ChatBot />}

      {showWebsiteLayout && <GiftEffect />}

      <Toast />
    </>
  );
}


export default function App() {
  const { currentUser } = useApp();

  return (
    <AppLayout>
      <Routes>

        <Route
          path="/login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />

        <Route
          path="/register"
          element={
            <GuestOnly>
              <Register />
            </GuestOnly>
          }
        />

        <Route
          path="/"
          element={
            <RequireLogin>
              <Home />
            </RequireLogin>
          }
        />

        <Route
          path="/documents"
          element={
            <RequireLogin>
              <Documents />
            </RequireLogin>
          }
        />

        <Route
          path="/documents/:id"
          element={
            <RequireLogin>
              <DocumentDetail />
            </RequireLogin>
          }
        />

        <Route
          path="/categories"
          element={
            <RequireLogin>
              <Categories />
            </RequireLogin>
          }
        />

        <Route
          path="/feed"
          element={
            <RequireLogin>
              <Feed />
            </RequireLogin>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <RequireLogin>
              <Leaderboard />
            </RequireLogin>
          }
        />

        <Route
          path="/support"
          element={
            <RequireLogin>
              <Support />
            </RequireLogin>
          }
        />

        <Route
          path="/upload"
          element={
            <RequireLogin>
              <UploadPage />
            </RequireLogin>
          }
        />

        <Route
          path="/profile"
          element={
            <RequireLogin>
              <Profile />
            </RequireLogin>
          }
        />

        <Route
          path="/users/:id"
          element={
            <RequireLogin>
              <Profile />
            </RequireLogin>
          }
        />

        <Route
          path="/wallet"
          element={
            <RequireLogin>
              <Wallet />
            </RequireLogin>
          }
        />

        <Route
          path="/messages"
          element={
            <RequireLogin>
              <Messages />
            </RequireLogin>
          }
        />

        <Route
          path="/history"
          element={
            <RequireLogin>
              <History />
            </RequireLogin>
          }
        />

        <Route
          path="/gifts"
          element={
            <RequireLogin>
              <GiftVault />
            </RequireLogin>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to={
                currentUser
                  ? '/'
                  : '/login'
              }
              replace
            />
          }
        />

      </Routes>
    </AppLayout>
  );
}
