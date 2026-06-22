import {
  BookOpen,
  ChevronDown,
  Clock,
  FileText,
  Heart,
  MessageCircle,
  Star,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function HistoryDropdown() {
  const [open, setOpen] = useState(false);

  const items = [
    {
      label: "Tất cả lịch sử",
      path: "/history?tab=all",
      icon: <Clock size={18} />,
    },
    {
      label: "Lịch sử đã đọc",
      path: "/history?tab=reads",
      icon: <BookOpen size={18} />,
    },
    {
      label: "Tài liệu đã thích",
      path: "/history?tab=favorites",
      icon: <Heart size={18} />,
    },
    {
      label: "Bình luận của tôi",
      path: "/history?tab=comments",
      icon: <MessageCircle size={18} />,
    },
    {
      label: "Đánh giá của tôi",
      path: "/history?tab=ratings",
      icon: <Star size={18} />,
    },
    {
      label: "Tài liệu đã đăng",
      path: "/history?tab=uploaded",
      icon: <FileText size={18} />,
    },
    {
      label: "Tài liệu chờ duyệt",
      path: "/history?tab=pending",
      icon: <Clock size={18} />,
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="nav-link flex items-center gap-1"
      >
        Lịch sử
        <ChevronDown
          size={16}
          className={`transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-9 z-50 w-72 rounded-3xl border border-white/10 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-xl">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-amber-300"
            >
              <span className="text-amber-300">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}