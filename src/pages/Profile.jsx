import { Camera, ImagePlus, Save, X } from "lucide-react";
import { useState } from "react";

import DocumentGrid from "../components/DocumentGrid.jsx";
import MessagePage from "../components/MessagePage.jsx";
import ProfileHeader from "../components/ProfileHeader.jsx";

export default function Profile({ currentUser, documents, updateProfile }) {
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState(() => ({
    ...currentUser,
    avatar: currentUser?.avatar || "",
    coverUrl: currentUser?.coverUrl || "",
    bio: currentUser?.bio || "",
    school: currentUser?.school || "",
    majorName: currentUser?.majorName || "",
  }));

  if (!currentUser) {
    return (
      <MessagePage
        title="Bạn chưa đăng nhập"
        message="Đăng nhập để xem trang cá nhân."
      />
    );
  }

  const myDocs = documents.filter((doc) => doc.uploadedBy === currentUser.email);

  function handleImageChange(event, fieldName) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        [fieldName]: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  }

  function submit(event) {
    event.preventDefault();

    updateProfile({
      ...currentUser,
      ...form,
    });

    setEditing(false);
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <ProfileHeader
        user={currentUser}
        documents={myDocs}
        isOwner={true}
        onEditClick={() => setEditing(true)}
      />

      {editing && (
        <section className="glass-card mt-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black">Chỉnh sửa hồ sơ</h2>

            <button onClick={() => setEditing(false)} className="btn-danger">
              <X size={18} />
              Đóng
            </button>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="label">Ảnh đại diện</label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/5 p-6 text-center transition hover:border-amber-300">
                  {form.avatar ? (
                    <img
                      src={form.avatar}
                      alt="Avatar"
                      className="h-32 w-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="text-slate-400">
                      <Camera className="mx-auto mb-2 text-amber-300" />
                      Chọn ảnh đại diện
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleImageChange(event, "avatar")}
                  />
                </label>
              </div>

              <div>
                <label className="label">Ảnh bìa hồ sơ</label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/5 p-6 text-center transition hover:border-amber-300">
                  {form.coverUrl ? (
                    <img
                      src={form.coverUrl}
                      alt="Cover"
                      className="h-32 w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="text-slate-400">
                      <ImagePlus className="mx-auto mb-2 text-amber-300" />
                      Chọn ảnh bìa
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleImageChange(event, "coverUrl")}
                  />
                </label>
              </div>
            </div>

            <input
              className="input"
              placeholder="Họ tên"
              value={form.fullName || ""}
              onChange={(event) =>
                setForm({ ...form, fullName: event.target.value })
              }
            />

            <textarea
              className="input min-h-28"
              placeholder="Giới thiệu bản thân"
              value={form.bio || ""}
              onChange={(event) =>
                setForm({ ...form, bio: event.target.value })
              }
            />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <input
                className="input"
                placeholder="Trường học"
                value={form.school || ""}
                onChange={(event) =>
                  setForm({ ...form, school: event.target.value })
                }
              />

              <input
                className="input"
                placeholder="Ngành / Lớp"
                value={form.majorName || ""}
                onChange={(event) =>
                  setForm({ ...form, majorName: event.target.value })
                }
              />
            </div>

            <button className="btn-primary w-full">
              <Save size={18} />
              Lưu hồ sơ
            </button>
          </form>
        </section>
      )}

      <section className="mt-10">
        <h3 className="mb-6 text-2xl font-bold">Bài viết / tài liệu đã đăng</h3>
        <DocumentGrid documents={myDocs} />
      </section>
    </main>
  );
}