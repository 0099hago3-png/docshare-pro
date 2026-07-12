import { useMemo, useState } from 'react';
import { CloudUpload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { PageHeader } from '../components/LiveUI.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';

const initialForm = {
  title: '',
  description: '',
  subject: '',
  categoryId: '',
  schoolId: '',
  faculty: '',
  major: '',
  isbn: '',
  academicYear: '',
  tags: '',
  language: 'vi',
  price: 0,
  visibility: 'public',
};

function UploadCloud({ selected }) {
  return (
    <span className={selected ? 'live-upload-cloud-v42 selected' : 'live-upload-cloud-v42'}>
      <CloudUpload size={42} strokeWidth={1.7} />
    </span>
  );
}

export default function UploadPage() {
  const navigate = useNavigate();
  const { state, uploadDocument } = useApp();

  const [form, setForm] = useState(initialForm);
  const [coverFile, setCoverFile] = useState(null);
  const [demoFile, setDemoFile] = useState(null);
  const [fullFiles, setFullFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const coverPreview = useMemo(() => (
    coverFile ? URL.createObjectURL(coverFile) : ''
  ), [coverFile]);

  const selectedCategory = useMemo(
    () => state.categories.find((category) => category.id === form.categoryId) || null,
    [form.categoryId, state.categories],
  );

  function updateField(key, value) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.categoryId) {
      window.alert('Bạn cần chọn một danh mục có sẵn.');
      return;
    }

    if (!fullFiles.length) {
      window.alert('Bạn cần chọn ít nhất một file tài liệu đầy đủ.');
      return;
    }

    setLoading(true);

    const documentId = await uploadDocument({
      ...form,
      coverFile,
      demoFile,
      fullFiles,
    });

    setLoading(false);

    if (documentId) {
      navigate(`/documents/${documentId}`);
    }
  }

  return (
    <div className="live-page">
      <PageHeader
        eyebrow="ĐĂNG DỮ LIỆU THẬT"
        title="Đăng tài liệu lên Supabase"
        text="Thông tin lưu vào PostgreSQL; ảnh bìa, file demo và file đầy đủ lưu vào Supabase Storage."
      />

      {!state.categories.length && (
        <div className="live-alert error live-category-warning">
          Chưa có danh mục để chọn. Hãy chạy file SQL danh mục trong Supabase trước khi đăng tài liệu.
        </div>
      )}

      <form className="live-upload-layout" onSubmit={handleSubmit}>
        <div className="live-upload-main">
          <section className="live-panel">
            <div className="live-panel-head">
              <span>01</span>
              <div>
                <h2>Thông tin tài liệu</h2>
                <p>Điền thông tin thật, không dùng dữ liệu mẫu.</p>
              </div>
            </div>

            <label className="live-field">
              <span>Tên tài liệu *</span>
              <input
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="Ví dụ: Giáo trình React cơ bản"
                required
              />
            </label>

            <label className="live-field">
              <span>Mô tả</span>
              <textarea
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Mô tả nội dung, đối tượng phù hợp và điểm nổi bật..."
              />
            </label>

            <div className="live-form-grid two">
              <label className="live-field">
                <span>Môn học</span>
                <input
                  value={form.subject}
                  onChange={(event) => updateField('subject', event.target.value)}
                  placeholder="Cơ sở dữ liệu"
                />
              </label>

              <label className="live-field">
                <span>Danh mục *</span>
                <select
                  value={form.categoryId}
                  onChange={(event) => updateField('categoryId', event.target.value)}
                  required
                  disabled={!state.categories.length}
                >
                  <option value="">
                    {state.categories.length
                      ? 'Chọn danh mục có sẵn'
                      : 'Chưa có danh mục trong Supabase'}
                  </option>
                  {state.categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <small className="live-category-note">
                  Người dùng chỉ được chọn. Danh mục mới chỉ do Admin thêm trong SQL.
                </small>
              </label>
            </div>

            <div className="live-form-grid two">
              <label className="live-field">
                <span>Trường / đơn vị</span>
                <select
                  value={form.schoolId}
                  onChange={(event) => updateField('schoolId', event.target.value)}
                >
                  <option value="">Không chọn</option>
                  {state.schools.map((school) => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </label>

              <label className="live-field">
                <span>Khoa</span>
                <input
                  value={form.faculty}
                  onChange={(event) => updateField('faculty', event.target.value)}
                  placeholder="Công nghệ thông tin"
                />
              </label>
            </div>

            <div className="live-form-grid two">
              <label className="live-field">
                <span>Ngành</span>
                <input
                  value={form.major}
                  onChange={(event) => updateField('major', event.target.value)}
                  placeholder="Lập trình ứng dụng"
                />
              </label>

              <label className="live-field">
                <span>ISBN</span>
                <input
                  value={form.isbn}
                  onChange={(event) => updateField('isbn', event.target.value)}
                  placeholder="Không bắt buộc"
                />
              </label>
            </div>

            <div className="live-form-grid three">
              <label className="live-field">
                <span>Năm học thuật</span>
                <input
                  type="number"
                  value={form.academicYear}
                  onChange={(event) => updateField('academicYear', event.target.value)}
                  placeholder="2026"
                  min="1900"
                  max="2100"
                />
              </label>

              <label className="live-field">
                <span>Ngôn ngữ</span>
                <select
                  value={form.language}
                  onChange={(event) => updateField('language', event.target.value)}
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </label>

              <label className="live-field">
                <span>Giá credit</span>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(event) => updateField('price', event.target.value)}
                />
              </label>
            </div>

            <label className="live-field">
              <span>Tag, cách nhau bằng dấu phẩy</span>
              <input
                value={form.tags}
                onChange={(event) => updateField('tags', event.target.value)}
                placeholder="react, vite, javascript"
              />
            </label>
          </section>

          <section className="live-panel">
            <div className="live-panel-head">
              <span>02</span>
              <div>
                <h2>Tệp tài liệu</h2>
                <p>Bấm vào từng vùng có biểu tượng đám mây để chọn file.</p>
              </div>
            </div>

            <div className="live-file-grid live-file-grid-v42">
              <label className="live-file-box live-file-box-v42">
                <UploadCloud selected={Boolean(coverFile)} />
                <b>Ảnh bìa</b>
                <small>JPG, PNG hoặc WEBP</small>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
                />
                <span className="live-file-name">
                  {coverFile?.name || 'Bấm để tải ảnh bìa lên'}
                </span>
              </label>

              <label className="live-file-box live-file-box-v42">
                <UploadCloud selected={Boolean(demoFile)} />
                <b>File xem trước</b>
                <small>PDF, không bắt buộc</small>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => setDemoFile(event.target.files?.[0] || null)}
                />
                <span className="live-file-name">
                  {demoFile?.name || 'Bấm để tải file xem trước lên'}
                </span>
              </label>

              <label className="live-file-box live-file-box-v42 full">
                <UploadCloud selected={fullFiles.length > 0} />
                <b>File tài liệu đầy đủ *</b>
                <small>PDF, Word, PowerPoint, Excel hoặc ZIP</small>
                <input
                  type="file"
                  multiple
                  onChange={(event) => setFullFiles(Array.from(event.target.files || []))}
                />
                <span className="live-file-name">
                  {fullFiles.length
                    ? `${fullFiles.length} file đã chọn`
                    : 'Bấm để tải file tài liệu đầy đủ lên'}
                </span>
              </label>
            </div>
          </section>
        </div>

        <aside className="live-upload-side">
          <section className="live-panel sticky">
            <h2>Bản xem trước</h2>

            <div className="live-upload-preview-cover">
              {coverPreview ? (
                <img src={coverPreview} alt="Ảnh bìa xem trước" />
              ) : (
                <span>📘</span>
              )}
            </div>

            <h3>{form.title || 'Tên tài liệu sẽ hiện ở đây'}</h3>
            <p>{form.description || 'Mô tả ngắn sẽ hiện ở đây.'}</p>
            <div className="live-selected-category live-selected-category-v42">
              <span className="live-selected-category-icon-v42">
                <CategoryIcon category={selectedCategory} size={22} />
              </span>
              <span>Danh mục</span>
              <b>{selectedCategory?.name || 'Chưa chọn'}</b>
            </div>

            <ul className="live-check-list">
              <li className={form.title ? 'done' : ''}>Thông tin tài liệu</li>
              <li className={fullFiles.length ? 'done' : ''}>File đầy đủ</li>
              <li className={coverFile ? 'done' : ''}>Ảnh bìa</li>
              <li className={demoFile ? 'done' : ''}>File demo</li>
            </ul>

            <button className="live-primary-button live-upload-submit-button" type="submit" disabled={loading || !state.categories.length}>
              {loading ? 'Đang tải lên Supabase...' : 'Đăng tài liệu'}
            </button>

            <p className="live-note">
              Không có dữ liệu giả. Tài liệu chỉ xuất hiện sau khi tải lên thành công.
            </p>
          </section>
        </aside>
      </form>
    </div>
  );
}
