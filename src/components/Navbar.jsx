import { BookOpen, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import HistoryDropdown from "./HistoryDropdown.jsx";
import NotificationBell from "./NotificationBell.jsx";

export default function Navbar({ currentUser, logout }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-400 p-2 text-slate-950">
            <BookOpen size={24} />
          </div>

          <div>
            <h1 className="text-xl font-black">DocShare Pro</h1>
            <p className="text-xs text-slate-400">Kho tài liệu học tập</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link className="nav-link" to="/documents">
            Tài liệu
          </Link>

          <Link className="nav-link" to="/upload">
            Upload
          </Link>

          {currentUser && <HistoryDropdown />}

          {currentUser?.role === "ADMIN" && (
            <Link className="nav-link" to="/admin">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
            <NotificationBell currentUser={currentUser} />
              <Link to="/profile" className="btn-soft">
                <User size={18} />
                {currentUser.fullName}
              </Link>

              <button onClick={logout} className="btn-danger">
                <LogOut size={18} />
                Thoát
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-soft">
                Đăng nhập
              </Link>

              <Link to="/register" className="btn-primary">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}