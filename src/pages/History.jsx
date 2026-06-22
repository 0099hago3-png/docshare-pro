import {
  BookOpen,
  Clock,
  FileText,
  Heart,
  MessageCircle,
  Star,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import MessagePage from "../components/MessagePage.jsx";

function formatDate(date) {
  if (!date) return "Không rõ thời gian";
  return new Date(date).toLocaleString("vi-VN");
}

export default function History({
  currentUser,
  documents = [],
  activity = {
    reads: [],
    favorites: [],
    comments: [],
    ratings: [],
  },
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  if (!currentUser) {
    return (
      <MessagePage
        title="Bạn chưa đăng nhập"
        message="Đăng nhập để xem lịch sử hoạt động của bạn."
      />
    );
  }

  const tab = searchParams.get("tab") || "all";

  const reads = activity.reads.filter(
    (item) => item.userEmail === currentUser.email
  );

  const favorites = activity.favorites.filter(
    (item) => item.userEmail === currentUser.email
  );

  const comments = activity.comments.filter(
    (item) => item.userEmail === currentUser.email
  );

  const ratings = activity.ratings.filter(
    (item) => item.userEmail === currentUser.email
  );

  const uploadedDocs = documents.filter(
    (doc) => doc.uploadedBy === currentUser.email
  );

  const pendingDocs = uploadedDocs.filter((doc) => doc.status === "PENDING");

  const approvedDocs = uploadedDocs.filter((doc) => doc.status === "APPROVED");

  const favoriteDocs = favorites
    .map((item) => documents.find((doc) => doc.id === item.docId))
    .filter(Boolean);

  const tabs = [
    {
      key: "all",
      label: "Tất cả",
      icon: <Clock size={18} />,
    },
    {
      key: "reads",
      label: "Đã đọc",
      icon: <BookOpen size={18} />,
    },
    {
      key: "favorites",
      label: "Đã thích",
      icon: <Heart size={18} />,
    },
    {
      key: "comments",
      label: "Bình luận",
      icon: <MessageCircle size={18} />,
    },
    {
      key: "ratings",
      label: "Đánh giá",
      icon: <Star size={18} />,
    },
    {
      key: "uploaded",
      label: "Đã đăng",
      icon: <FileText size={18} />,
    },
    {
      key: "pending",
      label: "Chờ duyệt",
      icon: <Clock size={18} />,
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <span className="inline-flex rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-sm text-amber-300">
          Nhật ký hoạt động
        </span>

        <h1 className="mt-4 text-4xl font-black">Lịch sử của tôi</h1>

        <p className="mt-3 text-slate-400">
          Theo dõi tài liệu đã đọc, đã thích, bình luận, đánh giá và tài liệu đã
          đăng.
        </p>
      </div>

      <div className="glass-card mb-8">
        <div className="flex flex-wrap gap-3">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setSearchParams({ tab: item.key })}
              className={tab === item.key ? "btn-primary" : "btn-soft"}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "all" && (
        <>
          <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">
            <SummaryCard
              icon={<BookOpen />}
              label="Đã đọc"
              value={reads.length}
            />

            <SummaryCard
              icon={<Heart />}
              label="Đã thích"
              value={favorites.length}
            />

            <SummaryCard
              icon={<MessageCircle />}
              label="Bình luận"
              value={comments.length}
            />

            <SummaryCard
              icon={<Star />}
              label="Đánh giá"
              value={ratings.length}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <HistoryBox
              icon={<BookOpen />}
              title="Lịch sử đã đọc"
              items={reads}
              documents={documents}
              emptyText="Bạn chưa đọc tài liệu nào."
              renderItem={(item, doc) => (
                <>
                  <p className="font-bold">{doc?.title || item.docTitle}</p>
                  <p className="text-sm text-slate-400">
                    Đã đọc lúc {formatDate(item.createdAt)}
                  </p>
                </>
              )}
            />

            <HistoryBox
              icon={<Heart />}
              title="Tài liệu đã thích"
              items={favorites}
              documents={documents}
              emptyText="Bạn chưa thích tài liệu nào."
              renderItem={(item, doc) => (
                <>
                  <p className="font-bold">{doc?.title || item.docTitle}</p>
                  <p className="text-sm text-slate-400">
                    Đã thích lúc {formatDate(item.createdAt)}
                  </p>
                </>
              )}
            />

            <HistoryBox
              icon={<MessageCircle />}
              title="Bình luận của tôi"
              items={comments}
              documents={documents}
              emptyText="Bạn chưa bình luận tài liệu nào."
              renderItem={(item, doc) => (
                <>
                  <p className="font-bold">{doc?.title || item.docTitle}</p>
                  <p className="mt-1 text-slate-300">“{item.content}”</p>
                  <p className="text-sm text-slate-400">
                    Bình luận lúc {formatDate(item.createdAt)}
                  </p>
                </>
              )}
            />

            <HistoryBox
              icon={<Star />}
              title="Đánh giá của tôi"
              items={ratings}
              documents={documents}
              emptyText="Bạn chưa đánh giá tài liệu nào."
              renderItem={(item, doc) => (
                <>
                  <p className="font-bold">{doc?.title || item.docTitle}</p>
                  <p className="mt-1 text-amber-300">{item.value} / 5 sao</p>
                  <p className="text-sm text-slate-400">
                    Đánh giá lúc {formatDate(item.createdAt)}
                  </p>
                </>
              )}
            />
          </div>
        </>
      )}

      {tab === "reads" && (
        <HistoryBox
          icon={<BookOpen />}
          title="Lịch sử đã đọc"
          items={reads}
          documents={documents}
          emptyText="Bạn chưa đọc tài liệu nào."
          renderItem={(item, doc) => (
            <>
              <p className="font-bold">{doc?.title || item.docTitle}</p>
              <p className="text-sm text-slate-400">
                Đã đọc lúc {formatDate(item.createdAt)}
              </p>
            </>
          )}
        />
      )}

      {tab === "favorites" && (
        <section>
          <h2 className="mb-6 text-2xl font-black">Tài liệu đã thích</h2>
          <DocumentHistoryGrid documents={favoriteDocs} />
        </section>
      )}

      {tab === "comments" && (
        <HistoryBox
          icon={<MessageCircle />}
          title="Bình luận của tôi"
          items={comments}
          documents={documents}
          emptyText="Bạn chưa bình luận tài liệu nào."
          renderItem={(item, doc) => (
            <>
              <p className="font-bold">{doc?.title || item.docTitle}</p>
              <p className="mt-1 text-slate-300">“{item.content}”</p>
              <p className="text-sm text-slate-400">
                Bình luận lúc {formatDate(item.createdAt)}
              </p>
            </>
          )}
        />
      )}

      {tab === "ratings" && (
        <HistoryBox
          icon={<Star />}
          title="Đánh giá của tôi"
          items={ratings}
          documents={documents}
          emptyText="Bạn chưa đánh giá tài liệu nào."
          renderItem={(item, doc) => (
            <>
              <p className="font-bold">{doc?.title || item.docTitle}</p>
              <p className="mt-1 text-amber-300">{item.value} / 5 sao</p>
              <p className="text-sm text-slate-400">
                Đánh giá lúc {formatDate(item.createdAt)}
              </p>
            </>
          )}
        />
      )}

      {tab === "uploaded" && (
        <section>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-black">Tài liệu đã đăng</h2>

            <div className="flex gap-3 text-sm">
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-300">
                Đã duyệt: {approvedDocs.length}
              </span>

              <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-yellow-300">
                Chờ duyệt: {pendingDocs.length}
              </span>
            </div>
          </div>

          <DocumentHistoryGrid documents={uploadedDocs} />
        </section>
      )}

      {tab === "pending" && (
        <section>
          <h2 className="mb-6 text-2xl font-black">Tài liệu chờ duyệt</h2>
          <DocumentHistoryGrid documents={pendingDocs} />
        </section>
      )}
    </main>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 inline-flex rounded-2xl bg-amber-400 p-3 text-slate-950">
        {icon}
      </div>

      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}

function HistoryBox({
  icon,
  title,
  items,
  documents,
  emptyText,
  renderItem,
}) {
  function getDocument(docId) {
    return documents.find((doc) => doc.id === docId);
  }

  return (
    <div className="glass-card">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-amber-400 p-3 text-slate-950">
          {icon}
        </div>

        <div>
          <h3 className="text-2xl font-black">{title}</h3>
          <p className="text-sm text-slate-400">{items.length} hoạt động</p>
        </div>
      </div>

      <div className="max-h-[520px] space-y-4 overflow-y-auto pr-2">
        {items.map((item) => {
          const doc = getDocument(item.docId);

          return (
            <div
              key={item.id}
              className="flex gap-4 rounded-3xl bg-white/5 p-4"
            >
              {doc?.coverUrl ? (
                <img
                  src={doc.coverUrl}
                  alt={doc.title}
                  className="h-20 w-14 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-14 items-center justify-center rounded-xl bg-white/10">
                  {icon}
                </div>
              )}

              <div className="min-w-0 flex-1">{renderItem(item, doc)}</div>
            </div>
          );
        })}

        {!items.length && <p className="text-slate-400">{emptyText}</p>}
      </div>
    </div>
  );
}

function DocumentHistoryGrid({ documents }) {
  if (!documents.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-400">
        Chưa có tài liệu nào trong mục này.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
      {documents.map((doc) => (
        <article key={doc.id} className="document-card">
          <div className="mb-5 overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
            {doc.coverUrl ? (
              <img
                src={doc.coverUrl}
                alt={doc.title}
                className="h-72 w-full object-cover"
              />
            ) : (
              <div className="flex h-72 items-center justify-center bg-slate-900">
                <BookOpen size={54} className="text-amber-300" />
              </div>
            )}
          </div>

          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
              {doc.type}
            </span>

            <span
              className={
                doc.status === "APPROVED"
                  ? "rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300"
                  : doc.status === "PENDING"
                  ? "rounded-full bg-yellow-400/10 px-3 py-1 text-xs text-yellow-300"
                  : "rounded-full bg-red-400/10 px-3 py-1 text-xs text-red-300"
              }
            >
              {doc.status}
            </span>
          </div>

          <h3 className="line-clamp-2 text-xl font-black">{doc.title}</h3>

          <p className="mt-2 text-sm text-slate-400">
            {doc.author} • {doc.year}
          </p>

          <p className="mt-4 line-clamp-3 text-slate-300">
            {doc.description}
          </p>

          <div className="mt-6 grid grid-cols-4 gap-3 text-sm text-slate-300">
            <span>{doc.views || 0} xem</span>
            <span>{doc.downloads || 0} tải</span>
            <span>{doc.rating || 0} sao</span>
            <span>{doc.favoriteCount || 0} thích</span>
          </div>
        </article>
      ))}
    </div>
  );
} 