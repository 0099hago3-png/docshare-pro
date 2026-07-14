import { Save, UploadCloud } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BotanicalHero from '../components/BotanicalHero.jsx';
import Loading from '../components/Loading.jsx';
import UploadDropzone from '../components/UploadDropzone.jsx';
import { useApp } from '../context/AppContext.jsx';
import { ACADEMIC_YEARS, DOCUMENT_LANGUAGES } from '../lib/constants.js';
import { normalizeError, safeFileName, toTags } from '../lib/helpers.js';
import { isPremiumActive } from '../components/PremiumBadge.jsx';
import { supabase } from '../lib/supabase.js';

const emptyForm = {
  title: '', description: '', categoryId: '', subject: '', schoolName: '', faculty: '', major: '', isbn: '', academicYear: new Date().getFullYear(), language: 'vi', priceCredit: 0, tags: '', coverFrame: 'none',
};

const PREMIUM_FRAMES = [
  { value: 'none', label: 'Không dùng khung' },
  { value: 'leaf', label: 'Lá tri thức' },
  { value: 'emerald', label: 'Ngọc lục bảo' },
  { value: 'aurora', label: 'Ánh sáng Premium' },
  { value: 'academic', label: 'Học thuật danh dự' },
];

export default function UploadPage({ mode = 'create' }) {
  const { id } = useParams();
  const editing = mode === 'edit' || Boolean(id);
  const { currentUser, toast } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [demoFile, setDemoFile] = useState(null);
  const [fullFile, setFullFile] = useState(null);
  const [existingFiles, setExistingFiles] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const premiumActive = isPremiumActive(currentUser);

  const canSubmit = useMemo(() => form.title.trim() && form.description.trim() && form.categoryId && (editing || fullFile), [form, editing, fullFile]);
  const set = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => setCategories(data || []));
  }, []);

  useEffect(() => {
    if (!editing || !id) return;
    (async () => {
      try {
        const { data, error } = await supabase.from('documents').select('*,document_files(*)').eq('id', id).single();
        if (error) throw error;
        if (data.author_id !== currentUser.id && currentUser.role !== 'admin') throw new Error('Bạn không có quyền sửa tài liệu này.');
        setForm({
          title: data.title || '', description: data.description || '', categoryId: data.category_id || '', subject: data.subject || '', schoolName: data.school_name || '', faculty: data.faculty || '', major: data.major || '', isbn: data.isbn || '', academicYear: data.academic_year || new Date().getFullYear(), language: data.language || 'vi', priceCredit: data.price_credit || 0, tags: (data.tags || []).join(', '), coverFrame: data.cover_frame || 'none',
        });
        setExistingFiles(data.document_files || []);
      } catch (error) {
        toast(normalizeError(error), 'error');
        navigate('/documents');
      } finally {
        setLoading(false);
      }
    })();
  }, [editing, id, currentUser, navigate, toast]);

  async function uploadFile(documentId, file, kind, bucket) {
    if (!file) return null;
    const path = `${currentUser.id}/${documentId}/${safeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (uploadError) throw uploadError;
    const { data, error } = await supabase.from('document_files').insert({ document_id: documentId, owner_id: currentUser.id, file_kind: kind, storage_bucket: bucket, storage_path: path, original_name: file.name, mime_type: file.type, size_bytes: file.size }).select().single();
    if (error) throw error;
    return data;
  }

  async function replaceFile(documentId, file, kind, bucket) {
    if (!file) return;
    const oldRows = existingFiles.filter((item) => item.file_kind === kind);
    for (const row of oldRows) {
      await supabase.storage.from(row.storage_bucket).remove([row.storage_path]);
      await supabase.from('document_files').delete().eq('id', row.id);
    }
    await uploadFile(documentId, file, kind, bucket);
  }

  async function submit(event, draft = false) {
    event?.preventDefault();
    if (!canSubmit && !draft) return toast('Hãy điền đủ thông tin và chọn file tài liệu đầy đủ.', 'error');
    try {
      setBusy(true);
      const payload = {
        author_id: currentUser.id,
        category_id: form.categoryId || null,
        title: form.title.trim(),
        description: form.description.trim(),
        subject: form.subject.trim() || null,
        school_name: form.schoolName.trim() || null,
        faculty: form.faculty.trim() || null,
        major: form.major.trim() || null,
        isbn: form.isbn.trim() || null,
        academic_year: Number(form.academicYear) || null,
        language: form.language,
        price_credit: Math.max(0, Number(form.priceCredit) || 0),
        tags: toTags(form.tags),
        cover_frame: premiumActive ? form.coverFrame : 'none',
        status: draft ? 'draft' : 'published',
        published_at: draft ? null : new Date().toISOString(),
      };

      let documentId = id;
      if (editing) {
        const { error } = await supabase.from('documents').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('documents').insert(payload).select('id').single();
        if (error) throw error;
        documentId = data.id;
      }

      if (editing) {
        await replaceFile(documentId, coverFile, 'cover', 'document-covers');
        await replaceFile(documentId, demoFile, 'demo', 'document-demos');
        await replaceFile(documentId, fullFile, 'full', 'documents-private');
      } else {
        await uploadFile(documentId, coverFile, 'cover', 'document-covers');
        await uploadFile(documentId, demoFile, 'demo', 'document-demos');
        await uploadFile(documentId, fullFile, 'full', 'documents-private');
      }

      toast(draft ? 'Đã lưu bản nháp.' : editing ? 'Đã cập nhật tài liệu.' : 'Đăng tài liệu thành công.');
      navigate(`/documents/${documentId}`);
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading label="Đang tải tài liệu..." />;

  return (
    <div className="page">
      <BotanicalHero compact eyebrow={editing ? 'CHỈNH SỬA TÀI LIỆU' : 'LAN TỎA TRI THỨC'} title={editing ? 'Cập nhật tài liệu' : 'Đăng tải tài liệu'} description="Điền thông tin rõ ràng, chọn danh mục có sẵn và tải tệp lên bằng khu vực đám mây." />
      <form className="upload-layout" onSubmit={submit}>
        <section className="upload-form botanical-card">
          <div className="form-section-title"><span>01</span><div><h2>Thông tin tài liệu</h2><p>Thông tin chính giúp người đọc tìm thấy tài liệu dễ hơn.</p></div></div>
          <div className="form-grid">
            <label>Tiêu đề tài liệu *<input value={form.title} onChange={set('title')} required /></label>
            <label>Danh mục *<select value={form.categoryId} onChange={set('categoryId')} required><option value="">Chọn danh mục</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label className="span-2">Mô tả tài liệu *<textarea rows="5" value={form.description} onChange={set('description')} required /></label>
            <label>Chủ đề / môn học<input value={form.subject} onChange={set('subject')} /></label>
            <label>Trường / đơn vị<input value={form.schoolName} onChange={set('schoolName')} /></label>
            <label>Khoa<input value={form.faculty} onChange={set('faculty')} /></label>
            <label>Ngành<input value={form.major} onChange={set('major')} /></label>
            <label>ISBN<input value={form.isbn} onChange={set('isbn')} placeholder="Không bắt buộc" /></label>
            <label>Năm học / xuất bản<select value={form.academicYear} onChange={set('academicYear')}>{ACADEMIC_YEARS.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
            <label>Ngôn ngữ<select value={form.language} onChange={set('language')}>{DOCUMENT_LANGUAGES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label>Giá credit<input type="number" min="0" value={form.priceCredit} onChange={set('priceCredit')} /></label>
            <label className="span-2">Tag, cách nhau bằng dấu phẩy<input value={form.tags} onChange={set('tags')} placeholder="giải tích, react, cơ sở dữ liệu" /></label>
            <label className="span-2 premium-frame-selector-v70">
              Khung ảnh bìa Premium
              <select
                value={form.coverFrame}
                onChange={set('coverFrame')}
                disabled={!premiumActive}
              >
                {PREMIUM_FRAMES.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
              <small>
                {premiumActive
                  ? 'Khung sẽ hiển thị quanh ảnh bìa tại trang chủ, danh sách và chi tiết tài liệu.'
                  : 'Chỉ thành viên Premium mới có thể dùng hiệu ứng khung ảnh bìa.'}
              </small>
            </label>
          </div>

          <div className="form-section-title form-section-title--files"><span>02</span><div><h2>Tệp tài liệu</h2><p>File đầy đủ được lưu riêng tư. Người có quyền mới truy cập được.</p></div></div>
          <div className="upload-zone-grid">
            <UploadDropzone kind="image" label="Ảnh bìa" hint="JPG, PNG hoặc WEBP" accept="image/jpeg,image/png,image/webp" file={coverFile} onChange={setCoverFile} />
            <UploadDropzone label="File xem trước" hint="PDF, không bắt buộc" accept="application/pdf" file={demoFile} onChange={setDemoFile} />
            <UploadDropzone label="File tài liệu đầy đủ" hint="PDF, Word, PowerPoint, Excel hoặc ZIP" file={fullFile} onChange={setFullFile} required={!editing} />
          </div>
          {editing && <p className="muted">Không chọn tệp mới thì hệ thống giữ nguyên tệp hiện tại.</p>}
          <div className="form-actions form-actions--between">
            <button className="button button--ghost" type="button" disabled={busy} onClick={(event) => submit(event, true)}><Save size={18} /> Lưu nháp</button>
            <button className="button button--large" type="submit" disabled={busy || !canSubmit}><UploadCloud size={19} /> {busy ? 'Đang lưu...' : editing ? 'Lưu thay đổi' : 'Đăng tài liệu'}</button>
          </div>
        </section>

        <aside className="upload-preview botanical-card">
          <h3>Xem trước bài đăng</h3>
          <div className={`upload-preview__cover document-card--frame-${premiumActive ? form.coverFrame : 'none'}`}><span className="document-card__premium-frame-v70" aria-hidden="true" />{coverFile ? <img src={URL.createObjectURL(coverFile)} alt="Xem trước" /> : <img src="/assets/default-cover.svg" alt="Bìa mặc định" />}</div>
          <h4>{form.title || 'Tiêu đề tài liệu'}</h4>
          <p>{form.description || 'Mô tả tài liệu sẽ xuất hiện tại đây.'}</p>
          <ul><li>Thông tin tài liệu</li><li>{editing || fullFile ? 'Đã có file đầy đủ' : 'Chưa có file đầy đủ'}</li><li>{coverFile ? 'Đã chọn ảnh bìa' : 'Ảnh bìa không bắt buộc'}</li><li>{demoFile ? 'Đã chọn file demo' : 'File demo không bắt buộc'}</li></ul>
        </aside>
      </form>
    </div>
  );
}
