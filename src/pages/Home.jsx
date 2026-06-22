import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Heart,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Upload,
  Clock,
  Award,
  Layers,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";

const quickCategories = [
  { label: "Giáo trình", icon: BookOpen, keyword: "BOOK" },
  { label: "Slide bài giảng", icon: Layers, keyword: "SLIDE" },
  { label: "Đề thi", icon: FileText, keyword: "EXAM" },
  { label: "Đồ án", icon: GraduationCap, keyword: "THESIS" },
  { label: "PDF", icon: FileText, keyword: "PDF" },
  { label: "Word", icon: FileText, keyword: "WORD" },
  { label: "PowerPoint", icon: Layers, keyword: "PPT" },
  { label: "Excel", icon: FileText, keyword: "EXCEL" },
];

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-400 p-2 text-slate-950">
            <Icon size={22} />
          </div>

          <h2 className="text-2xl font-black text-white">{title}</h2>
        </div>

        {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
      </div>

      <Link
        to="/documents"
        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-amber-400 hover:text-slate-950"
      >
        Xem tất cả
      </Link>
    </div>
  );
}

function DocumentCard({ doc }) {
  return (
    <Link
      to={`/documents/${doc.id}/read`}
      className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-amber-400/40 hover:bg-white/10"
    >
      <div className="relative h-56 overflow-hidden bg-slate-900">
        {doc.coverUrl ? (
          <img
            src={doc.coverUrl}
            alt={doc.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
            <BookOpen size={54} className="text-amber-300" />
          </div>
        )}

        <div className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-bold text-amber-300">
          {doc.documentKind || doc.type || "Tài liệu"}
        </div>

        {doc.status && (
          <div
            className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${
              doc.status === "APPROVED"
                ? "bg-emerald-400/90 text-slate-950"
                : doc.status === "PENDING"
                ? "bg-amber-400/90 text-slate-950"
                : "bg-red-400/90 text-white"
            }`}
          >
            {doc.status}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs text-sky-300">
            {doc.subject || "Chưa có môn"}
          </span>

          <span className="rounded-full bg-purple-400/10 px-3 py-1 text-xs text-purple-300">
            {doc.faculty || "Chưa có khoa"}
          </span>
        </div>

        <h3 className="line-clamp-2 text-lg font-black text-white">
          {doc.title}
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          {doc.author || "Chưa rõ tác giả"} • {doc.year || "N/A"}
        </p>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-300">
          {doc.description || "Tài liệu học tập được chia sẻ trên DocShare Pro."}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-slate-400">
          <span>👁 {doc.views || 0}</span>
          <span>⭐ {doc.rating || 0}</span>
          <span>❤️ {doc.favoriteCount || 0}</span>
        </div>
      </div>
    </Link>
  );
}

function DocumentSection({ icon, title, subtitle, documents }) {
  if (!documents || documents.length === 0) return null;

  return (
    <section className="mt-14">
      <SectionTitle icon={icon} title={title} subtitle={subtitle} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {documents.slice(0, 8).map((doc) => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
      </div>
    </section>
  );
}

export default function Home({ documents = [], currentUser }) {
  const [keyword, setKeyword] = useState("");
  const [homeSections, setHomeSections] = useState(null);
  const [loading, setLoading] = useState(false);

  const approvedDocuments = useMemo(() => {
    return documents.filter((doc) => doc.status === "APPROVED");
  }, [documents]);

  async function loadHomeSections() {
    try {
      setLoading(true);
      const data = await api.getHomeSections(currentUser?.email);
      setHomeSections(data);
    } catch (error) {
      console.log("Không tải được home-sections:", error.message);
      setHomeSections(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHomeSections();
  }, [currentUser?.email]);

  const fallbackSections = useMemo(() => {
    const popular = [...approvedDocuments].sort(
      (a, b) => (b.views || 0) - (a.views || 0)
    );

    const latest = [...approvedDocuments].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    const topRated = [...approvedDocuments].sort(
      (a, b) => (b.rating || 0) - (a.rating || 0)
    );

    const mostFavorite = [...approvedDocuments].sort(
      (a, b) => (b.favoriteCount || 0) - (a.favoriteCount || 0)
    );

    return {
      popular,
      latest,
      topRated,
      mostFavorite,
      recommended: topRated,
    };
  }, [approvedDocuments]);

  const sections = homeSections || fallbackSections;

  const filteredQuick = approvedDocuments.filter((doc) => {
    const text = [
      doc.title,
      doc.author,
      doc.subject,
      doc.faculty,
      doc.major,
      doc.type,
      doc.documentKind,
      doc.tags?.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return text.includes(keyword.toLowerCase());
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 shadow-2xl md:p-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-300">
              <Sparkles size={18} />
              Kho tài liệu học tập thông minh
            </div>

            <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
              Tìm tài liệu học tập nhanh hơn với{" "}
              <span className="text-amber-300">DocShare Pro</span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              Website hỗ trợ sinh viên tìm kiếm, đọc trước, upload, đánh giá,
              yêu thích và quản lý tài liệu học tập. Hệ thống có admin kiểm
              duyệt nội dung, chatbot hỗ trợ và thuật toán gợi ý theo hành vi.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/documents"
                className="rounded-2xl bg-amber-400 px-6 py-3 font-black text-slate-950 hover:bg-amber-300"
              >
                Khám phá tài liệu
              </Link>

              <Link
                to="/upload"
                className="rounded-2xl border border-white/10 bg-white/10 px-6 py-3 font-black text-white hover:bg-white/20"
              >
                Upload tài liệu
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <h2 className="mb-5 text-xl font-black text-white">
              Bảng lựa chọn nhanh
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {quickCategories.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    onClick={() => setKeyword(item.keyword)}
                    className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-left transition hover:border-amber-400/50 hover:bg-amber-400 hover:text-slate-950"
                  >
                    <Icon size={26} className="mb-3" />
                    <p className="font-black">{item.label}</p>
                    <p className="mt-1 text-xs opacity-70">
                      Lọc nhanh tài liệu
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-bold text-slate-300">
              Tìm nhanh trên trang chủ
            </label>

            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-3.5 text-slate-400"
              />

              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-12 py-3 text-white outline-none focus:border-amber-400"
                placeholder="Nhập Java, SQL, PDF, Word, Slide, Đề thi..."
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center md:w-[420px]">
            <div className="rounded-2xl bg-slate-950 p-4">
              <p className="text-2xl font-black text-amber-300">
                {documents.length}
              </p>
              <p className="text-xs text-slate-400">Tổng tài liệu</p>
            </div>

            <div className="rounded-2xl bg-slate-950 p-4">
              <p className="text-2xl font-black text-emerald-300">
                {approvedDocuments.length}
              </p>
              <p className="text-xs text-slate-400">Đã duyệt</p>
            </div>

            <div className="rounded-2xl bg-slate-950 p-4">
              <p className="text-2xl font-black text-sky-300">
                {sections.recommended?.length || 0}
              </p>
              <p className="text-xs text-slate-400">Gợi ý</p>
            </div>
          </div>
        </div>

        {keyword && (
          <div className="mt-8">
            <SectionTitle
              icon={Search}
              title={`Kết quả nhanh: ${keyword}`}
              subtitle="Danh sách tài liệu phù hợp với từ khóa hoặc loại tài liệu bạn vừa chọn"
            />

            {filteredQuick.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                {filteredQuick.slice(0, 8).map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-slate-950 p-8 text-center text-slate-400">
                Chưa tìm thấy tài liệu phù hợp.
              </div>
            )}
          </div>
        )}
      </section>

      {loading && (
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
          Đang tải dữ liệu trang chủ từ SQL Server...
        </div>
      )}

      <DocumentSection
        icon={Sparkles}
        title="Đề xuất cho bạn"
        subtitle="Gợi ý dựa trên lịch sử đọc, yêu thích, bình luận, đánh giá và các chủ đề bạn hay xem"
        documents={sections.recommended}
      />

      <DocumentSection
        icon={TrendingUp}
        title="Tài liệu phổ biến"
        subtitle="Các tài liệu có nhiều lượt xem nhất trong hệ thống"
        documents={sections.popular}
      />

      <DocumentSection
        icon={Star}
        title="Đánh giá cao"
        subtitle="Các tài liệu có điểm đánh giá tốt nhất từ người dùng"
        documents={sections.topRated}
      />

      <DocumentSection
        icon={Clock}
        title="Vừa thêm"
        subtitle="Các tài liệu mới được cập nhật gần đây"
        documents={sections.latest}
      />

      <DocumentSection
        icon={Heart}
        title="Được yêu thích nhất"
        subtitle="Các tài liệu có nhiều lượt lưu yêu thích"
        documents={sections.mostFavorite}
      />

      <section className="mt-16 rounded-[2rem] border border-white/10 bg-gradient-to-br from-amber-400/20 to-slate-900 p-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="mb-3 flex items-center gap-3 text-amber-300">
              <Award size={28} />
              <h2 className="text-2xl font-black">Điểm mới của hệ thống</h2>
            </div>

            <p className="text-lg leading-8 text-slate-200">
              DocShare Pro không chỉ là nơi upload tài liệu. Hệ thống còn có
              kiểm duyệt nội dung, lý do từ chối gửi về người dùng, chatbot hỗ
              trợ tìm kiếm, đọc trước tài liệu và thuật toán gợi ý theo hành vi
              học tập.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <Link
              to="/upload"
              className="flex items-center gap-3 rounded-3xl bg-amber-400 px-8 py-5 text-lg font-black text-slate-950 hover:bg-amber-300"
            >
              <Upload size={24} />
              Đóng góp tài liệu
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}