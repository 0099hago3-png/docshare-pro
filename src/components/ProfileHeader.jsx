import {
  CheckCircle,
  Clock,
  FileText,
  Mail,
  ShieldCheck,
  XCircle,
} from "lucide-react";

export default function ProfileHeader({
  user,
  documents = [],
  isOwner = false,
  onEditClick,
}) {
  const approved = documents.filter((doc) => doc.status === "APPROVED").length;
  const pending = documents.filter((doc) => doc.status === "PENDING").length;
  const rejected = documents.filter((doc) => doc.status === "REJECTED").length;

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
      <div className="relative h-64 bg-gradient-to-r from-amber-500 via-purple-600 to-sky-500">
        {user.coverUrl && (
          <img
            src={user.coverUrl}
            alt="Ảnh bìa"
            className="h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" />

        {isOwner && (
          <button
            onClick={onEditClick}
            className="absolute right-6 top-6 rounded-2xl bg-white/20 px-4 py-2 font-bold text-white backdrop-blur-xl hover:bg-white/30"
          >
            Chỉnh sửa hồ sơ
          </button>
        )}
      </div>

      <div className="relative px-8 pb-8">
        <div className="-mt-16 flex flex-col gap-5 md:flex-row md:items-end">
          <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-slate-950 bg-amber-400 text-4xl font-black text-slate-950 shadow-2xl">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div className="pb-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-black">{user.fullName}</h1>

              <span className="rounded-full bg-amber-400/15 px-3 py-1 text-sm font-bold text-amber-300">
                {user.role === "ADMIN" ? "Quản trị viên" : "Người dùng"}
              </span>

              {user.enabled ? (
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm text-emerald-300">
                  Đang hoạt động
                </span>
              ) : (
                <span className="rounded-full bg-red-400/15 px-3 py-1 text-sm text-red-300">
                  Đã bị khóa
                </span>
              )}
            </div>

            <p className="mt-2 flex items-center gap-2 text-slate-400">
              <Mail size={16} />
              {user.email}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white/5 p-5">
            <p className="text-sm text-slate-400">Giới thiệu</p>
            <p className="mt-2 text-slate-200">
              {user.bio || "Người dùng chưa cập nhật giới thiệu."}
            </p>
          </div>

          <div className="rounded-3xl bg-white/5 p-5">
            <p className="text-sm text-slate-400">Thông tin học tập</p>
            <p className="mt-2 text-slate-200">
              {user.school || "Chưa cập nhật trường"}
            </p>
            <p className="text-slate-400">
              {user.majorName || "Chưa cập nhật ngành/lớp"}
            </p>
          </div>

          <div className="rounded-3xl bg-white/5 p-5">
            <p className="text-sm text-slate-400">Vai trò hệ thống</p>
            <p className="mt-2 flex items-center gap-2 text-slate-200">
              <ShieldCheck size={18} className="text-amber-300" />
              {user.role === "ADMIN"
                ? "Có quyền quản trị"
                : "Tài khoản người dùng"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white/5 p-5">
            <FileText className="mb-2 text-amber-300" />
            <p className="text-2xl font-black">{documents.length}</p>
            <p className="text-sm text-slate-400">Bài đã đăng</p>
          </div>

          <div className="rounded-3xl bg-white/5 p-5">
            <CheckCircle className="mb-2 text-emerald-300" />
            <p className="text-2xl font-black">{approved}</p>
            <p className="text-sm text-slate-400">Đã duyệt</p>
          </div>

          <div className="rounded-3xl bg-white/5 p-5">
            <Clock className="mb-2 text-yellow-300" />
            <p className="text-2xl font-black">{pending}</p>
            <p className="text-sm text-slate-400">Chờ duyệt</p>
          </div>

          <div className="rounded-3xl bg-white/5 p-5">
            <XCircle className="mb-2 text-red-300" />
            <p className="text-2xl font-black">{rejected}</p>
            <p className="text-sm text-slate-400">Từ chối</p>
          </div>
        </div>
      </div>
    </section>
  );
}