import { useEffect, useState } from "react";
import { Bell, CheckCircle, XCircle, Upload, MessageCircle, Flag } from "lucide-react";
import { api } from "../services/api.js";

function getIcon(type) {
  if (type === "APPROVED") return <CheckCircle size={18} className="text-emerald-300" />;
  if (type === "REJECTED") return <XCircle size={18} className="text-red-300" />;
  if (type === "UPLOAD") return <Upload size={18} className="text-amber-300" />;
  if (type === "COMMENT") return <MessageCircle size={18} className="text-sky-300" />;

  return <Bell size={18} className="text-slate-300" />;
}

export default function NotificationBell({ currentUser }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  async function loadNotifications() {
    if (!currentUser?.email) return;

    try {
      setLoading(true);
      const data = await api.getNotifications(currentUser.email);
      setNotifications(data);
    } catch (error) {
      console.log("Lỗi tải thông báo:", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id) {
    try {
      await api.markNotificationAsRead(id);

      setNotifications((items) =>
        items.map((item) =>
          item.id === id ? { ...item, isRead: true } : item
        )
      );
    } catch (error) {
      alert("Lỗi cập nhật thông báo: " + error.message);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, [currentUser?.email]);

  if (!currentUser) return null;

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          loadNotifications();
        }}
        className="relative rounded-2xl bg-white/10 p-3 text-slate-200 hover:bg-white/20"
        title="Thông báo"
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-[999] w-96 overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
          <div className="border-b border-white/10 px-5 py-4">
            <h3 className="text-lg font-black text-white">Thông báo</h3>
            <p className="text-sm text-slate-400">
              Theo dõi trạng thái tài liệu và hoạt động hệ thống
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto p-3">
            {loading && (
              <p className="p-4 text-center text-sm text-slate-400">
                Đang tải thông báo...
              </p>
            )}

            {!loading && notifications.length === 0 && (
              <p className="p-4 text-center text-sm text-slate-400">
                Chưa có thông báo nào.
              </p>
            )}

            {!loading &&
              notifications.map((item) => (
                <button
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`mb-3 w-full rounded-2xl border p-4 text-left transition hover:bg-white/10 ${
                    item.isRead
                      ? "border-white/10 bg-white/5"
                      : "border-amber-400/30 bg-amber-400/10"
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    {getIcon(item.type)}
                    <h4 className="font-bold text-white">{item.title}</h4>
                  </div>

                  <p className="text-sm leading-6 text-slate-300">
                    {item.message}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString("vi-VN")
                      : ""}
                  </p>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}