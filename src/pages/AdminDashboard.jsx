import {
  Eye,
  FileText,
  Heart,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import MessagePage from "../components/MessagePage.jsx";
import StatCard from "../components/StatCard.jsx";

function formatDate(date) {
  if (!date) return "Không rõ thời gian";
  return new Date(date).toLocaleString("vi-VN");
}

function getPreviewType(doc) {
  const fileName = String(doc?.fileName || "").toLowerCase();
  const fileType = String(doc?.fileType || "").toLowerCase();
  const documentKind = String(doc?.documentKind || "").toLowerCase();

  if (
    fileType.includes("pdf") ||
    fileName.endsWith(".pdf") ||
    documentKind === "pdf"
  ) {
    return "pdf";
  }

  if (
    fileType.includes("image") ||
    fileName.endsWith(".png") ||
    fileName.endsWith(".jpg") ||
    fileName.endsWith(".jpeg") ||
    fileName.endsWith(".webp") ||
    documentKind === "image"
  ) {
    return "image";
  }

  return "unsupported";
}

export default function AdminDashboard({
  currentUser,
  users,
  documents,
  activity = {
    comments: [],
  },
  approveDocument,
  rejectDocument,
  toggleUserStatus,
  deleteDocument,
  deleteComment,
  reports = [],
  resolveReport,
}) {
  const [tab, setTab] = useState("overview");
  const [selectedReport, setSelectedReport] = useState(null);

  const [userKeyword, setUserKeyword] = useState("");
  const [documentKeyword, setDocumentKeyword] = useState("");
  const [commentKeyword, setCommentKeyword] = useState("");
  const [reportKeyword, setReportKeyword] = useState("");

  if (currentUser?.role !== "ADMIN") {
    return (
      <MessagePage
        title="Không có quyền truy cập"
        message="Chỉ quản trị viên mới được vào trang này."
      />
    );
  }

  const pending = documents.filter((doc) => doc.status === "PENDING");

  const filteredUsers = useMemo(() => {
    const keyword = userKeyword.toLowerCase();

    return users.filter((user) =>
      [user.fullName, user.email, user.role]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [users, userKeyword]);

  const filteredDocuments = useMemo(() => {
    const keyword = documentKeyword.toLowerCase();

    return documents.filter((doc) =>
      [doc.title, doc.author, doc.subject, doc.status, doc.uploadedBy]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [documents, documentKeyword]);

  const filteredComments = useMemo(() => {
    const keyword = commentKeyword.toLowerCase();

    return activity.comments.filter((comment) =>
      [
        comment.userName,
        comment.userEmail,
        comment.docTitle,
        comment.content,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [activity.comments, commentKeyword]);

  const filteredReports = useMemo(() => {
    const keyword = reportKeyword.toLowerCase();

    return reports.filter((report) => {
      const text = [
        report.docTitle,
        report.reporterEmail,
        report.reporterName,
        report.reason,
        report.detail,
        report.status,
        report.adminNote,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(keyword);
    });
  }, [reports, reportKeyword]);
  const selectedDocument = selectedReport
    ? documents.find((doc) => String(doc.id) === String(selectedReport.docId))
    : null;

  const selectedPreviewType = getPreviewType(selectedDocument);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h2 className="mb-8 flex items-center gap-3 text-4xl font-black">
        <LayoutDashboard className="text-amber-300" />
        Admin Dashboard
      </h2>

      <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard icon={<User />} label="Người dùng" value={users.length} />
        <StatCard icon={<FileText />} label="Tài liệu" value={documents.length} />
        <StatCard
          icon={<ShieldCheck />}
          label="Chờ duyệt"
          value={pending.length}
        />
        <StatCard
          icon={<Heart />}
          label="Bình luận"
          value={activity.comments.length}
        />
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <button
          onClick={() => setTab("overview")}
          className={tab === "overview" ? "btn-primary" : "btn-soft"}
        >
          Tổng quan quản trị
        </button>

        <button
          onClick={() => setTab("reports")}
          className={tab === "reports" ? "btn-primary" : "btn-soft"}
        >
          Báo cáo vi phạm ({reports.filter((item) => item.status === "PENDING").length})
        </button>
      </div>

      <section className="glass-card mb-8">
        <h3 className="mb-5 text-2xl font-bold">Tài liệu chờ duyệt</h3>

        <div className="space-y-4">
          {pending.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col justify-between gap-4 rounded-2xl bg-white/5 p-5 md:flex-row md:items-center"
            >
              <div className="flex items-center gap-4">
                {doc.coverUrl && (
                  <img
                    src={doc.coverUrl}
                    alt={doc.title}
                    className="h-24 w-16 rounded-xl object-cover"
                  />
                )}

                <div>
                  <h4 className="font-bold">{doc.title}</h4>
                  <p className="text-sm text-slate-400">
                    {doc.author} • {doc.subject}
                  </p>
                  <p className="text-sm text-slate-500">
                    Người đăng: {doc.uploadedBy}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => approveDocument(doc.id)}
                  className="btn-success"
                >
                  Duyệt
                </button>

                <button
                  onClick={() => rejectDocument(doc.id)}
                  className="btn-danger"
                >
                  Từ chối
                </button>

                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="btn-danger"
                >
                  <Trash2 size={17} />
                  Xóa
                </button>
              </div>
            </div>
          ))}

          {!pending.length && (
            <p className="text-slate-400">Không có tài liệu chờ duyệt.</p>
          )}
        </div>
      </section>

      <section className="glass-card mb-8">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="text-2xl font-bold">Quản lý người dùng</h3>
            <p className="text-sm text-slate-400">
              Tìm tài khoản theo tên, email hoặc vai trò để khóa / mở khóa.
            </p>
          </div>

          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-4 top-3.5 text-slate-400"
              size={20}
            />
            <input
              className="input pl-12"
              placeholder="Tìm tên hoặc email..."
              value={userKeyword}
              onChange={(event) => setUserKeyword(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex flex-col justify-between gap-3 rounded-2xl bg-white/5 p-4 md:flex-row md:items-center"
            >
              <div>
                <p className="font-bold">{user.fullName}</p>
                <p className="text-sm text-slate-400">
                  {user.email} • {user.role}
                </p>
                <p
                  className={
                    user.enabled
                      ? "text-sm text-emerald-300"
                      : "text-sm text-red-300"
                  }
                >
                  {user.enabled ? "Đang hoạt động" : "Đã bị khóa"}
                </p>
              </div>

              <button
                onClick={() => toggleUserStatus(user.id)}
                className={user.enabled ? "btn-danger" : "btn-success"}
              >
                {user.enabled ? "Khóa tài khoản" : "Mở khóa"}
              </button>
            </div>
          ))}

          {!filteredUsers.length && (
            <p className="text-slate-400">Không tìm thấy tài khoản phù hợp.</p>
          )}
        </div>
      </section>

      <section className="glass-card mb-8">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="text-2xl font-bold">Quản lý bài đăng</h3>
            <p className="text-sm text-slate-400">
              Admin có thể tìm và xóa tài liệu vi phạm.
            </p>
          </div>

          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-4 top-3.5 text-slate-400"
              size={20}
            />
            <input
              className="input pl-12"
              placeholder="Tìm tên tài liệu, tác giả..."
              value={documentKeyword}
              onChange={(event) => setDocumentKeyword(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col justify-between gap-4 rounded-2xl bg-white/5 p-5 md:flex-row md:items-center"
            >
              <div className="flex items-center gap-4">
                {doc.coverUrl && (
                  <img
                    src={doc.coverUrl}
                    alt={doc.title}
                    className="h-24 w-16 rounded-xl object-cover"
                  />
                )}

                <div>
                  <h4 className="font-bold">{doc.title}</h4>
                  <p className="text-sm text-slate-400">
                    {doc.author} • {doc.subject} • {doc.status}
                  </p>
                  <p className="text-sm text-slate-500">
                    Người đăng: {doc.uploadedBy}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {doc.status !== "APPROVED" && (
                  <button
                    onClick={() => approveDocument(doc.id)}
                    className="btn-success"
                  >
                    Duyệt
                  </button>
                )}

                {doc.status !== "REJECTED" && (
                  <button
                    onClick={() => rejectDocument(doc.id)}
                    className="btn-danger"
                  >
                    Từ chối
                  </button>
                )}

                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="btn-danger"
                >
                  <Trash2 size={17} />
                  Xóa bài
                </button>
              </div>
            </div>
          ))}

          {!filteredDocuments.length && (
            <p className="text-slate-400">Không tìm thấy bài đăng phù hợp.</p>
          )}
        </div>
      </section>

      <section className="glass-card">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="text-2xl font-bold">Quản lý bình luận</h3>
            <p className="text-sm text-slate-400">
              Admin có thể xóa bình luận không phù hợp.
            </p>
          </div>

          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-4 top-3.5 text-slate-400"
              size={20}
            />
            <input
              className="input pl-12"
              placeholder="Tìm bình luận, người viết..."
              value={commentKeyword}
              onChange={(event) => setCommentKeyword(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="flex flex-col justify-between gap-4 rounded-2xl bg-white/5 p-5 md:flex-row md:items-start"
            >
              <div>
                <p className="font-bold">{comment.userName}</p>
                <p className="text-sm text-slate-400">
                  {comment.userEmail} • {formatDate(comment.createdAt)}
                </p>
                <p className="mt-2 text-sm text-amber-300">
                  Tài liệu: {comment.docTitle}
                </p>
                <p className="mt-3 leading-7 text-slate-200">
                  {comment.content}
                </p>
              </div>

              <button
                onClick={() => deleteComment(comment.id)}
                className="btn-danger"
              >
                <Trash2 size={17} />
                Xóa bình luận
              </button>
            </div>
          ))}

          {!filteredComments.length && (
            <p className="text-slate-400">Không tìm thấy bình luận phù hợp.</p>
          )}
        </div>
      </section>

      {tab === "reports" && (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black">Báo cáo vi phạm</h2>
              <p className="mt-2 text-slate-400">
                Admin xem các tài liệu bị người dùng báo cáo và xử lý nếu có vi phạm.
              </p>
            </div>

            <div className="relative w-full md:w-96">
              <Search
                size={18}
                className="absolute left-4 top-3.5 text-slate-400"
              />

              <input
                value={reportKeyword}
                onChange={(event) => setReportKeyword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-12 py-3 outline-none focus:border-amber-400"
                placeholder="Tìm báo cáo..."
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="cursor-pointer rounded-2xl border border-white/10 bg-slate-950 p-5 transition hover:border-amber-400/50 hover:bg-slate-900"
              >
                <div className="mb-3 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${report.status === "PENDING"
                          ? "bg-red-400/10 text-red-300"
                          : report.status === "IGNORED"
                            ? "bg-slate-400/10 text-slate-300"
                            : "bg-emerald-400/10 text-emerald-300"
                          }`}
                      >
                        {report.status}
                      </span>

                      <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
                        Báo cáo #{report.id}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white">
                      {report.docTitle}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      Người báo cáo: {report.reporterName || report.reporterEmail || "Ẩn danh"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {report.createdAt
                        ? new Date(report.createdAt).toLocaleString("vi-VN")
                        : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {report.status === "PENDING" && (
                      <>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            resolveReport?.(report.id, "RESOLVED");
                          }}
                          className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-black text-slate-950 hover:bg-emerald-300"
                        >
                          Đã xử lý
                        </button>

                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            resolveReport?.(report.id, "IGNORED");
                          }}
                          className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/20"
                        >
                          Bỏ qua
                        </button>
                      </>
                    )}

                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteDocument?.(report.docId);
                      }}
                      className="rounded-xl bg-red-500 px-4 py-2 text-sm font-black text-white hover:bg-red-400"
                    >
                      Xóa tài liệu
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-100">
                  <p>
                    <strong>Lý do:</strong> {report.reason}
                  </p>

                  {report.detail && (
                    <p className="mt-2">
                      <strong>Mô tả thêm:</strong> {report.detail}
                    </p>
                  )}
                </div>

                {report.adminNote && (
                  <div className="mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                    <strong>Ghi chú admin:</strong> {report.adminNote}
                  </div>
                )}
              </div>
            ))}

            {filteredReports.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-slate-950 p-8 text-center text-slate-400">
                Chưa có báo cáo vi phạm nào.
              </div>
            )}
          </div>
        </section>
      )}
      {selectedReport && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-sm font-bold text-red-300">
                  <Eye size={16} />
                  Xem lại tài liệu bị báo cáo
                </div>

                <h2 className="text-2xl font-black text-white">
                  {selectedReport.docTitle}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Người báo cáo:{" "}
                  {selectedReport.reporterName ||
                    selectedReport.reporterEmail ||
                    "Ẩn danh"}
                </p>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-xl bg-white/10 p-2 text-slate-300 hover:bg-white/20 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-100">
              <p>
                <strong>Lý do báo cáo:</strong> {selectedReport.reason}
              </p>

              {selectedReport.detail && (
                <p className="mt-2">
                  <strong>Mô tả thêm:</strong> {selectedReport.detail}
                </p>
              )}
            </div>

            {!selectedDocument ? (
              <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center text-slate-400">
                Không tìm thấy tài liệu này. Có thể tài liệu đã bị xóa.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_330px]">
                <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                  {selectedPreviewType === "pdf" && selectedDocument.fileUrl && (
                    <iframe
                      src={selectedDocument.fileUrl}
                      title={selectedDocument.title}
                      className="h-[620px] w-full rounded-2xl bg-white"
                    />
                  )}

                  {selectedPreviewType === "image" && selectedDocument.fileUrl && (
                    <img
                      src={selectedDocument.fileUrl}
                      alt={selectedDocument.title}
                      className="mx-auto max-h-[620px] rounded-2xl object-contain"
                    />
                  )}

                  {selectedPreviewType === "unsupported" && (
                    <div className="flex min-h-[420px] items-center justify-center text-center">
                      <div>
                        <FileText
                          size={70}
                          className="mx-auto mb-4 text-amber-300"
                        />

                        <h3 className="text-xl font-black text-white">
                          File này chưa xem trước trực tiếp được
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                          Nếu là Word, PowerPoint hoặc Excel, admin có thể mở trang đọc
                          hoặc tải về để kiểm tra trước khi xử lý báo cáo.
                        </p>

                        {selectedDocument.fileUrl && (
                          <a
                            href={selectedDocument.fileUrl}
                            download={selectedDocument.fileName}
                            className="mt-5 inline-flex rounded-2xl bg-amber-400 px-5 py-3 font-black text-slate-950 hover:bg-amber-300"
                          >
                            Tải file kiểm tra
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <h3 className="mb-4 text-xl font-black text-white">
                    Thông tin tài liệu
                  </h3>

                  <div className="space-y-3 text-sm text-slate-300">
                    <p>
                      <strong>Tiêu đề:</strong> {selectedDocument.title}
                    </p>

                    <p>
                      <strong>Tác giả:</strong> {selectedDocument.author || "N/A"}
                    </p>

                    <p>
                      <strong>Môn học:</strong> {selectedDocument.subject || "N/A"}
                    </p>

                    <p>
                      <strong>Khoa:</strong> {selectedDocument.faculty || "N/A"}
                    </p>

                    <p>
                      <strong>Người đăng:</strong>{" "}
                      {selectedDocument.uploadedBy ||
                        selectedDocument.uploadedByEmail ||
                        "N/A"}
                    </p>

                    <p>
                      <strong>Trạng thái:</strong> {selectedDocument.status}
                    </p>

                    <p>
                      <strong>Loại file:</strong>{" "}
                      {selectedDocument.documentKind ||
                        selectedDocument.type ||
                        selectedDocument.fileType ||
                        "N/A"}
                    </p>

                    <p>
                      <strong>Lượt xem:</strong> {selectedDocument.views || 0}
                    </p>

                    <p>
                      <strong>Đánh giá:</strong> {selectedDocument.rating || 0}/5
                    </p>
                  </div>

                  <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-slate-300">
                    {selectedDocument.description ||
                      "Tài liệu này chưa có mô tả chi tiết."}
                  </div>

                  <div className="mt-5 space-y-3">
                    <button
                      onClick={() =>
                        (window.location.href = `/documents/${selectedDocument.id}/read`)
                      }
                      className="w-full rounded-2xl bg-amber-400 px-4 py-3 font-black text-slate-950 hover:bg-amber-300"
                    >
                      Mở trang đọc tài liệu
                    </button>

                    {selectedReport.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => {
                            resolveReport?.(selectedReport.id, "RESOLVED");
                            setSelectedReport(null);
                          }}
                          className="w-full rounded-2xl bg-emerald-400 px-4 py-3 font-black text-slate-950 hover:bg-emerald-300"
                        >
                          Đánh dấu đã xử lý
                        </button>

                        <button
                          onClick={() => {
                            resolveReport?.(selectedReport.id, "IGNORED");
                            setSelectedReport(null);
                          }}
                          className="w-full rounded-2xl bg-white/10 px-4 py-3 font-black text-white hover:bg-white/20"
                        >
                          Bỏ qua báo cáo
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        deleteDocument?.(selectedDocument.id);
                        setSelectedReport(null);
                      }}
                      className="w-full rounded-2xl bg-red-500 px-4 py-3 font-black text-white hover:bg-red-400"
                    >
                      Xóa tài liệu vi phạm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}