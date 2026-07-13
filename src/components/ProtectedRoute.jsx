import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import Loading from './Loading.jsx';

export function RequireAuth() {
  const { session, currentUser, authLoading } = useApp();
  const location = useLocation();
  if (authLoading) return <Loading label="Đang kiểm tra tài khoản..." />;
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!currentUser) return <Loading label="Đang tải hồ sơ..." />;
  return <Outlet />;
}

export function RequireAdmin() {
  const { currentUser } = useApp();
  return currentUser?.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />;
}

export function GuestOnly() {
  const { session, authLoading } = useApp();
  if (authLoading) return <Loading />;
  return session ? <Navigate to="/" replace /> : <Outlet />;
}
