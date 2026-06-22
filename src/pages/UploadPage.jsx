import { FileUp, ImagePlus, Upload } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import MessagePage from "../components/MessagePage.jsx";

export default function UploadPage({ currentUser, addDocument }) {
  const navigate = useNavigate();

  const [coverPreview, setCoverPreview] = useState("");
  const [fileInfo, setFileInfo] = useState(null);

  const [form, setForm] = useState({
    title: "",
    author: "",
    faculty: "Công nghệ thông tin",
    major: "Kỹ thuật phần mềm",
    subject: "Đồ án tốt nghiệp",
    year: new Date().getFullYear(),
    isbn: "",
    description: "",
    coverUrl: "",
    fileName: "",
    fileUrl: "",
    fileType: "",
    fileSize: 0,
  });

  if (!currentUser) {
    return (
      <MessagePage
        title="Bạn cần đăng nhập"
        message="Vui lòng đăng nhập để upload tài liệu."
      />
    );
  }

  function handleCoverChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh JPG, PNG hoặc WEBP.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setCoverPreview(reader.result);
      setForm((prev) => ({
        ...prev,
        coverUrl: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  }

  function handleDocumentFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const maxSize = 3 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("File quá lớn. Bản demo chỉ nên chọn file dưới 3MB.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Chỉ hỗ trợ PDF, TXT, DOC, DOCX.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setFileInfo(file);

      setForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileUrl: reader.result,
        fileType: file.type,
        fileSize: file.size,
      }));
    };

    reader.readAsDataURL(file);
  }

  function submit(event) {
    event.preventDefault();

    if (!form.title || !form.author || !form.description) {
      alert("Vui lòng nhập tên tài liệu, tác giả và mô tả.");
      return;
    }

    if (!form.fileUrl) {
      alert("Vui lòng chọn file PDF hoặc tài liệu.");
      return;
    }

    addDocument({
      id: Date.now(),
      ...form,
      type: "BOOK",
      status: "PENDING",
      views: 0,
      downloads: 0,
      rating: 0,
      favoriteCount: 0,
      tags: ["new", "upload"],
      uploadedBy: currentUser.email,
    });

    alert("Đã gửi tài liệu. Vui lòng chờ admin duyệt.");
    navigate("/profile");
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h2 className="mb-8 text-4xl font-black">Upload tài liệu</h2>

      <form onSubmit={submit} className="glass-card space-y-5">
        <input
          className="input"
          placeholder="Tên tài liệu"
          value={form.title}
          onChange={(event) =>
            setForm({ ...form, title: event.target.value })
          }
        />

        <input
          className="input"
          placeholder="Tác giả"
          value={form.author}
          onChange={(event) =>
            setForm({ ...form, author: event.target.value })
          }
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            className="input"
            placeholder="Khoa"
            value={form.faculty}
            onChange={(event) =>
              setForm({ ...form, faculty: event.target.value })
            }
          />

          <input
            className="input"
            placeholder="Ngành"
            value={form.major}
            onChange={(event) =>
              setForm({ ...form, major: event.target.value })
            }
          />

          <input
            className="input"
            placeholder="Môn học"
            value={form.subject}
            onChange={(event) =>
              setForm({ ...form, subject: event.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            className="input"
            type="number"
            placeholder="Năm xuất bản"
            value={form.year}
            onChange={(event) =>
              setForm({ ...form, year: event.target.value })
            }
          />

          <input
            className="input"
            placeholder="ISBN / Mã tài liệu"
            value={form.isbn}
            onChange={(event) =>
              setForm({ ...form, isbn: event.target.value })
            }
          />
        </div>

        <textarea
          className="input min-h-32"
          placeholder="Mô tả ngắn về tài liệu"
          value={form.description}
          onChange={(event) =>
            setForm({ ...form, description: event.target.value })
          }
        />

        <div>
          <label className="label">File PDF / tài liệu</label>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/5 p-8 text-center transition hover:border-amber-300 hover:bg-white/10">
            <FileUp size={48} className="mb-3 text-amber-300" />

            {fileInfo ? (
              <>
                <p className="font-bold text-white">{fileInfo.name}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {(fileInfo.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-slate-300">
                  Bấm để chọn file tài liệu
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Hỗ trợ PDF, TXT, DOC, DOCX. Nên dùng file dưới 3MB.
                </p>
              </>
            )}

            <input
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleDocumentFileChange}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <label className="label">Ảnh bìa sách / tài liệu</label>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/5 p-6 text-center transition hover:border-amber-300 hover:bg-white/10">
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Ảnh bìa"
                className="h-80 w-56 rounded-2xl object-cover shadow-2xl"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <ImagePlus size={46} className="text-amber-300" />
                <p className="font-semibold">Bấm để chọn ảnh bìa</p>
                <p className="text-sm">Hỗ trợ JPG, PNG, WEBP</p>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />
          </label>
        </div>

        <button className="btn-primary w-full justify-center">
          <Upload size={18} />
          Gửi tài liệu chờ duyệt
        </button>
      </form>
    </main>
  );
}