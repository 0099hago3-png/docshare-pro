import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Download,
  Eye,
  FileText,
  Flag,
  Heart,
  MessageCircle,
  Send,
  Star,
  X,
} from "lucide-react";
import { api } from "../services/api.js";

function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  return String(tags)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function PreviewBox({ preview, doc, loading }) {
  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-3xl border border-white/10 bg-slate-900 p-8 text-center">
        <div>
          <BookOpen size={60} className="mx-auto mb-4 text-amber-300" />
          <p className="text-lg font-bold">Đang tải bản đọc trước...</p>
          <p className="mt-2 text-sm text-slate-400">
            Hệ thống đang kiểm tra định dạng tài liệu.
          </p>
        </div>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-3xl border border-white/10 bg-slate-900 p-8 text-center">
        <div>
          <FileText size={60} className="mx-auto mb-4 text-amber-300" />
          <p className="text-lg font-bold">Chưa có dữ liệu đọc trước</p>
          <p className="mt-2 text-sm text-slate-400">
            Bạn có thể tải tài liệu về máy nếu file chưa hỗ trợ xem trực tiếp.
          </p>
        </div>
      </div>
    );
  }

  const previewUrl = preview.previewUrl || doc.previewUrl || doc.fileUrl;

  if (preview.previewType === "pdf" && previewUrl) {
    return (
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
        <iframe
          src={previewUrl}
          title={doc.title}
          className="h-[720px] w-full bg-white"
        />
      </div>
    );
  }

  if (preview.previewType === "image" && previewUrl) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-4">
        <img
          src={previewUrl}
          alt={doc.title}
          className="mx-auto max-h-[720px] rounded-2xl object-contain"
        />
      </div>
    );
  }

  if (preview.previewType === "text" && previewUrl) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
        <iframe
          src={previewUrl}
          title={doc.title}
          className="h-[620px] w-full rounded-2xl bg-white"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-[520px] items-center justify-center rounded-3xl border border-white/10 bg-slate-900 p-8 text-center">
      <div>
        <FileText size={64} className="mx-auto mb-4 text-amber-300" />

        <h3 className="text-2xl font-black">
          Chưa hỗ trợ đọc trước định dạng này
        </h3>

        <p className="mx-auto mt-3 max-w-xl text-slate-400">
          File này có thể là Word, PowerPoint, Excel hoặc định dạng khác. Hệ
          thống hiện ưu tiên đọc trước trực tiếp với PDF, ảnh và text. Bạn có
          thể tải về hoặc chuyển file sang PDF để xem trực tuyến.
        </p>

        {doc.fileUrl && (
          <a
            href={doc.fileUrl}
            download={doc.fileName}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 font-black text-slate-950 hover:bg-amber-300"
          >
            <Download size={18} />
            Tải tài liệu
          </a>
        )}
      </div>
    </div>
  );
}

export default function DocumentReader({
  documents = [],
  currentUser,
  activity = {
    comments: [],
    favorites: [],
    ratings: [],
    reads: [],
  },
  onRead,
  onComment,
  onDeleteComment,
  onToggleFavorite,
  onRate,
}) {
  const { id } = useParams();

  const [preview, setPreview] = useState(null);
  const [comment, setComment] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
const [reportOpen, setReportOpen] = useState(false);
const [reportReason, setReportReason] = useState("File không mở được");
const [reportDetail, setReportDetail] = useState("");
const [reportLoading, setReportLoading] = useState(false);
  const doc = documents.find((item) => String(item.id) === String(id));

  const comments = useMemo(() => {
    return (activity.comments || []).filter(
      (item) => String(item.docId) === String(id)
    );
  }, [activity.comments, id]);

  const isFavorite = useMemo(() => {
    if (!currentUser) return false;

    return (activity.favorites || []).some(
      (item) =>
        item.userEmail === currentUser.email &&
        String(item.docId) === String(id)
    );
  }, [activity.favorites, currentUser, id]);

  const myRating = useMemo(() => {
    if (!currentUser) return null;

    return (activity.ratings || []).find(
      (item) =>
        item.userEmail === currentUser.email &&
        String(item.docId) === String(id)
    );
  }, [activity.ratings, currentUser, id]);

  const tags = normalizeTags(doc?.tags);

  async function loadPreview() {
    if (!doc?.id) return;

    try {
      setLoadingPreview(true);

      const data = await api.getDocumentPreview(doc.id);

      setPreview(data);
    } catch (error) {
      setPreview({
        previewType: "unsupported",
        previewUrl: doc.fileUrl,
        canPreview: false,
        message: error.message,
      });
    } finally {
      setLoadingPreview(false);
    }
  }

  useEffect(() => {
    if (!doc?.id) return;

    loadPreview();

    if (currentUser) {
      onRead?.(doc);
    }
  }, [doc?.id, currentUser?.email]);

  async function submitComment(event) {
    event.preventDefault();

    if (!currentUser) {
      alert("Bạn cần đăng nhập để bình luận.");
      return;
    }

    if (!comment.trim()) {
      alert("Vui lòng nhập nội dung bình luận.");
      return;
    }

    await onComment?.(doc, comment.trim());
    setComment("");
  }
async function submitReport(event) {
  event.preventDefault();

  if (!currentUser) {
    alert("Bạn cần đăng nhập để báo cáo vi phạm.");
    return;
  }

  if (!reportReason.trim()) {
    alert("Vui lòng chọn lý do báo cáo.");
    return;
  }

  try {
    setReportLoading(true);

    await api.reportDocument({
      docId: doc.id,
      docTitle: doc.title,
      reporterEmail: currentUser.email,
      reporterName: currentUser.fullName,
      reason: reportReason,
      detail: reportDetail,
    });

    alert("Đã gửi báo cáo vi phạm. Admin sẽ kiểm tra tài liệu này.");

    setReportOpen(false);
    setReportReason("File không mở được");
    setReportDetail("");
  } catch (error) {
    alert("Lỗi gửi báo cáo: " + error.message);
  } finally {
    setReportLoading(false);
  }
}
  if (!doc) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <BookOpen size={60} className="mx-auto mb-4 text-amber-300" />

          <h2 className="text-3xl font-black">Không tìm thấy tài liệu</h2>

          <p className="mt-3 text-slate-400">
            Tài liệu có thể đã bị xóa, chưa được duyệt hoặc dữ liệu chưa tải từ
            SQL Server.
          </p>

          <Link
            to="/documents"
            className="mt-6 inline-flex rounded-2xl bg-amber-400 px-5 py-3 font-black text-slate-950"
          >
            Quay lại thư viện
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <Link
        to="/documents"
        className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10"
      >
        <ArrowLeft size={18} />
        Quay lại thư viện
      </Link>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
                {doc.documentKind || doc.type || "Tài liệu"}
              </span>

              <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs font-bold text-sky-300">
                {doc.subject || "Chưa có môn học"}
              </span>

              <span className="rounded-full bg-purple-400/10 px-3 py-1 text-xs font-bold text-purple-300">
                {doc.faculty || "Chưa có khoa"}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  doc.status === "APPROVED"
                    ? "bg-emerald-400/10 text-emerald-300"
                    : doc.status === "PENDING"
                    ? "bg-amber-400/10 text-amber-300"
                    : "bg-red-400/10 text-red-300"
                }`}
              >
                {doc.status}
              </span>
            </div>

            <h1 className="text-4xl font-black leading-tight">{doc.title}</h1>

            <p className="mt-3 text-slate-400">
              {doc.author || "Chưa rõ tác giả"} • {doc.year || "N/A"} •{" "}
              {doc.major || "Chưa có ngành"}
            </p>

            <p className="mt-5 leading-8 text-slate-300">
              {doc.description ||
                "Tài liệu học tập được chia sẻ trên DocShare Pro."}
            </p>

            {doc.status === "REJECTED" && doc.rejectReason && (
              <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-200">
                <strong>Lý do từ chối: </strong>
                {doc.rejectReason}
              </div>
            )}
          </div>

          <PreviewBox preview={preview} doc={doc} loading={loadingPreview} />
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-5 text-xl font-black">Thông tin tài liệu</h3>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Eye size={17} />
                  Lượt xem
                </span>
                <strong>{doc.views || 0}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Download size={17} />
                  Lượt tải
                </span>
                <strong>{doc.downloads || 0}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Star size={17} />
                  Đánh giá
                </span>
                <strong>{doc.rating || 0}/5</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Heart size={17} />
                  Yêu thích
                </span>
                <strong>{doc.favoriteCount || 0}</strong>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {doc.fileUrl && (
                <a
                  href={doc.fileUrl}
                  download={doc.fileName}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 font-black text-slate-950 hover:bg-amber-300"
                >
                  <Download size={18} />
                  Tải xuống
                </a>
              )}

              <button
                onClick={() => {
                  if (!currentUser) {
                    alert("Bạn cần đăng nhập để yêu thích tài liệu.");
                    return;
                  }

                  onToggleFavorite?.(doc);
                }}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-black ${
                  isFavorite
                    ? "bg-red-400 text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <Heart size={18} />
                {isFavorite ? "Đã yêu thích" : "Yêu thích"}
              </button>
              <button
  onClick={() => {
    if (!currentUser) {
      alert("Bạn cần đăng nhập để báo cáo vi phạm.");
      return;
    }

    setReportOpen(true);
  }}
  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 px-4 py-3 font-black text-red-300 hover:bg-red-500 hover:text-white"
>
  <Flag size={18} />
  Báo cáo vi phạm
</button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 text-xl font-black">Đánh giá tài liệu</h3>

            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => {
                    if (!currentUser) {
                      alert("Bạn cần đăng nhập để đánh giá.");
                      return;
                    }

                    onRate?.(doc, value);
                  }}
                  className={`rounded-2xl p-3 ${
                    Number(myRating?.value || 0) >= value
                      ? "bg-amber-400 text-slate-950"
                      : "bg-white/10 text-slate-300 hover:bg-white/20"
                  }`}
                >
                  <Star size={20} />
                </button>
              ))}
            </div>

            {myRating && (
              <p className="mt-3 text-sm text-slate-400">
                Bạn đã đánh giá {myRating.value}/5 sao.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 text-xl font-black">Tag</h3>

            <div className="flex flex-wrap gap-2">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <span key={tag} className="tag">
                    #{tag}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400">Chưa có tag.</span>
              )}
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-amber-400 p-2 text-slate-950">
            <MessageCircle size={22} />
          </div>

          <div>
            <h2 className="text-2xl font-black">Bình luận</h2>
            <p className="text-sm text-slate-400">
              Người đọc có thể trao đổi, góp ý hoặc hỏi thêm về tài liệu.
            </p>
          </div>
        </div>

        <form onSubmit={submitComment} className="mb-8 flex gap-3">
          <input
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-amber-400"
            placeholder={
              currentUser
                ? "Nhập bình luận của bạn..."
                : "Đăng nhập để bình luận..."
            }
            disabled={!currentUser}
          />

          <button
            disabled={!currentUser}
            className="rounded-2xl bg-amber-400 px-5 text-slate-950 hover:bg-amber-300 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>

        <div className="space-y-4">
          {comments.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-slate-950 p-6 text-center text-slate-400">
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận tài liệu
              này.
            </div>
          )}

          {comments.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-slate-950 p-5"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-white">
                    {item.userName || item.userEmail}
                  </h4>

                  <p className="text-xs text-slate-500">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString("vi-VN")
                      : ""}
                  </p>
                </div>

                {(currentUser?.role === "ADMIN" ||
                  currentUser?.email === item.userEmail) && (
                  <button
                    onClick={() => onDeleteComment?.(item.id)}
                    className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500 hover:text-white"
                  >
                    Xóa
                  </button>
                )}
              </div>

              <p className="leading-7 text-slate-300">{item.content}</p>
            </div>
          ))}
        </div>
      </section>
      {reportOpen && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4">
    <form
      onSubmit={submitReport}
      className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-sm font-bold text-red-300">
            <Flag size={16} />
            Báo cáo vi phạm
          </div>

          <h3 className="text-2xl font-black text-white">
            Báo cáo tài liệu này
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Admin sẽ kiểm tra nội dung báo cáo và xử lý nếu tài liệu vi phạm.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setReportOpen(false)}
          className="rounded-xl bg-white/10 p-2 text-slate-300 hover:bg-white/20 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-bold text-slate-300">
          Lý do báo cáo
        </label>

        <select
          value={reportReason}
          onChange={(event) => setReportReason(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-red-400"
        >
          <option>File không mở được</option>
          <option>Nội dung sai hoặc không đúng mô tả</option>
          <option>Tài liệu bị trùng</option>
          <option>Nội dung không phù hợp</option>
          <option>Vi phạm bản quyền</option>
          <option>Spam hoặc quảng cáo</option>
          <option>Khác</option>
        </select>
      </div>

      <div className="mb-5">
        <label className="mb-2 block text-sm font-bold text-slate-300">
          Mô tả thêm
        </label>

        <textarea
          value={reportDetail}
          onChange={(event) => setReportDetail(event.target.value)}
          rows={5}
          className="w-full resize-none rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-red-400"
          placeholder="Ví dụ: File tải lên không đúng môn học, file bị lỗi, nội dung không liên quan..."
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setReportOpen(false)}
          className="rounded-2xl bg-white/10 px-5 py-3 font-black text-white hover:bg-white/20"
        >
          Hủy
        </button>

        <button
          disabled={reportLoading}
          className="rounded-2xl bg-red-500 px-5 py-3 font-black text-white hover:bg-red-400 disabled:opacity-60"
        >
          {reportLoading ? "Đang gửi..." : "Gửi báo cáo"}
        </button>
      </div>
    </form>
  </div>
)}
    </main>
  );
}