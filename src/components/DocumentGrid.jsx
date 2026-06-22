import { motion } from "framer-motion";
import { BookOpen, Download, Eye, Heart, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function DocumentGrid({
  documents,
  currentUser,
  activity = {
    reads: [],
    favorites: [],
    comments: [],
    ratings: [],
  },
  onRead,
  onToggleFavorite,
  onComment,
  onRate,
}) {
  const navigate = useNavigate();

  if (!documents.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-400">
        Không tìm thấy tài liệu phù hợp.
      </div>
    );
  }

  function needLogin() {
    alert("Bạn cần đăng nhập để sử dụng chức năng này.");
  }

  return (
    <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
      {documents.map((doc) => {
        const isLiked = activity.favorites?.some(
          (item) =>
            item.userEmail === currentUser?.email && item.docId === doc.id
        );

        const myRating = activity.ratings?.find(
          (item) =>
            item.userEmail === currentUser?.email && item.docId === doc.id
        );

        return (
          <motion.article
            key={doc.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            className="document-card"
          >
            <div className="mb-5 overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
              {doc.coverUrl ? (
                <img
                  src={doc.coverUrl}
                  alt={doc.title}
                  className="h-80 w-full object-cover transition duration-500 hover:scale-105"
                />
              ) : (
                <div className="flex h-80 items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                  <BookOpen size={60} className="text-amber-300" />
                </div>
              )}
            </div>

            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                {doc.type}
              </span>

              <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-300">
                {doc.subject}
              </span>
            </div>

            <h3 className="line-clamp-2 text-xl font-black">{doc.title}</h3>

            <p className="mt-2 text-sm text-slate-400">
              {doc.author} • {doc.year}
            </p>

            {doc.uploadedBy && (
              <p className="mt-2 text-sm text-slate-500">
                Người đăng:{" "}
                <Link
                  to={`/users/${encodeURIComponent(doc.uploadedBy)}`}
                  className="text-amber-300 hover:text-amber-200"
                >
                  {doc.uploadedBy}
                </Link>
              </p>
            )}

            <p className="mt-4 line-clamp-3 text-slate-300">
              {doc.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {doc.tags?.map((tag) => (
                <span key={tag} className="tag">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-4 gap-3 text-sm text-slate-300">
              <span className="flex items-center gap-1">
                <Eye size={16} /> {doc.views || 0}
              </span>

              <span className="flex items-center gap-1">
                <Download size={16} /> {doc.downloads || 0}
              </span>

              <span className="flex items-center gap-1">
                <Star size={16} /> {doc.rating || 0}
              </span>

              <span className="flex items-center gap-1">
                <Heart size={16} /> {doc.favoriteCount || 0}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  if (!currentUser) {
                    needLogin();
                    return;
                  }

                  onRead?.(doc);
                  navigate(`/documents/${doc.id}/read`);
                }}
                className="btn-soft"
              >
                <Eye size={17} />
                Đọc
              </button>

              <button
                onClick={() => {
                  if (!currentUser) {
                    needLogin();
                    return;
                  }

                  onToggleFavorite?.(doc);
                }}
                className={isLiked ? "btn-danger" : "btn-soft"}
              >
                <Heart size={17} />
                {isLiked ? "Đã thích" : "Thích"}
              </button>
            </div>

            <div className="mt-5 rounded-3xl bg-white/5 p-4">
              <p className="mb-3 text-sm font-bold text-slate-300">
                Đánh giá của bạn:
              </p>

              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      if (!currentUser) {
                        needLogin();
                        return;
                      }

                      onRate?.(doc, value);
                    }}
                    className={
                      value <= (myRating?.value || 0)
                        ? "text-amber-300"
                        : "text-slate-600 hover:text-amber-300"
                    }
                  >
                    <Star size={22} fill="currentColor" />
                  </button>
                ))}
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}