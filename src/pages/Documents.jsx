import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import DocumentGrid from "../components/DocumentGrid.jsx";

export default function Documents({
  documents,
  currentUser,
  activity,
  onRead,
  onToggleFavorite,
  onComment,
  onRate,
}) {
  const [keyword, setKeyword] = useState("");
  const [faculty, setFaculty] = useState("ALL");
  const [sort, setSort] = useState("newest");

  const approved = documents.filter((doc) => doc.status === "APPROVED");
  const faculties = ["ALL", ...new Set(approved.map((doc) => doc.faculty))];

  const filtered = useMemo(() => {
    let result = approved.filter((doc) => {
      const text = [
        doc.title,
        doc.author,
        doc.faculty,
        doc.major,
        doc.subject,
        doc.year,
        doc.isbn,
        doc.tags?.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      const matchKeyword = text.includes(keyword.toLowerCase());
      const matchFaculty = faculty === "ALL" || doc.faculty === faculty;

      return matchKeyword && matchFaculty;
    });

    if (sort === "downloads") {
      result = [...result].sort((a, b) => b.downloads - a.downloads);
    }

    if (sort === "views") {
      result = [...result].sort((a, b) => b.views - a.views);
    }

    if (sort === "az") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [documents, keyword, faculty, sort]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h2 className="text-4xl font-black">Thư viện tài liệu</h2>

      <p className="mt-3 text-slate-400">
        Tìm kiếm thông minh theo tên, tác giả, khoa, ngành, môn học, năm, ISBN
        và tag.
      </p>

      <div className="glass-card my-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="label">Tìm kiếm</label>

            <div className="relative">
              <Search
                className="absolute left-4 top-3.5 text-slate-400"
                size={20}
              />

              <input
                className="input pl-12"
                placeholder="Tên tài liệu, tác giả, môn học..."
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Khoa</label>

            <select
              className="input"
              value={faculty}
              onChange={(event) => setFaculty(event.target.value)}
            >
              {faculties.map((item) => (
                <option key={item} value={item}>
                  {item === "ALL" ? "Tất cả khoa" : item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Sắp xếp</label>

            <select
              className="input"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="newest">Mới nhất</option>
              <option value="downloads">Tải nhiều</option>
              <option value="views">Xem nhiều</option>
              <option value="az">A-Z</option>
            </select>
          </div>
        </div>
      </div>

      <DocumentGrid
        documents={filtered}
        currentUser={currentUser}
        activity={activity}
        onRead={onRead}
        onToggleFavorite={onToggleFavorite}
        onComment={onComment}
        onRate={onRate}
      />
    </main>
  );
}