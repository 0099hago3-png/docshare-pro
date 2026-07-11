import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check, FileArchive, FileImage, FileText, ImagePlus, LibraryBig, Search, Tag, UploadCloud,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const suggestedTags = [
  'Python','React','ReactJS','Vite','NodeJS','Express','Supabase','PostgreSQL','SQL Server','JavaScript',
  'TypeScript','Java','C++','C#','HTML','CSS','Cơ sở dữ liệu','Giải tích','Đại số','Vật lý','Hóa học',
  'Marketing','Kế toán','Tài chính','Quản trị','Tiếng Anh','IELTS','TOEIC','AI','Machine Learning',
  'Khoa học dữ liệu','Đồ án','Luận văn','Bài giảng','Đề thi','Slide','Giáo trình','PDF','Excel','PowerPoint',
];

const fileAccept = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.md,.epub,.zip,.rar,.7z,.jpg,.jpeg,.png,.webp';
const fileTypes = ['PDF','DOC','DOCX','PPT','PPTX','XLS','XLSX','TXT','CSV','EPUB','ZIP','RAR','7Z','Ảnh','Nhiều định dạng','Khác'];

function normalize(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase().trim();
}

function fuzzyScore(query, value) {
  const q = normalize(query);
  const text = normalize(value);
  if (!q) return 1;
  if (text === q) return 100;
  if (text.startsWith(q)) return 80;
  if (text.includes(q)) return 65;
  const words = q.split(/\s+/).filter(Boolean);
  const matched = words.filter((word) => text.includes(word)).length;
  if (matched === words.length) return 50 + matched;
  let cursor = 0;
  for (const char of q) {
    cursor = text.indexOf(char, cursor);
    if (cursor < 0) return 0;
    cursor += 1;
  }
  return 18;
}

export default function UploadPage() {
  const navigate = useNavigate();
  const { state, currentUser, uploadDocument, showToast } = useApp();
  const [form, setForm] = useState({
    title: '', description: '', subject: '', category: 'it', school: '', type: 'PDF',
    price: 0, coverEmoji: '', color: 'green', tags: [], visibility: 'public',
    coverFileName: '', coverPreview: '', demoFileName: '', fullFileNames: [],
  });
  const [tagText, setTagText] = useState('');
  const [schoolText, setSchoolText] = useState('');
  const [schoolFocused, setSchoolFocused] = useState(false);
  const [tagFocused, setTagFocused] = useState(false);
  const todayLimit = currentUser.premium ? 20 : 2;

  const steps = useMemo(() => [
    { label: 'Thông tin', done: Boolean(form.title && form.subject) },
    { label: 'Tệp tài liệu', done: Boolean(form.fullFileNames.length) },
    { label: 'Ảnh bìa 9:16', done: Boolean(form.coverFileName) },
    { label: 'Hashtag & phát hành', done: Boolean(form.tags.length && form.visibility) },
  ], [form]);

  const schoolSuggestions = useMemo(() => {
    const query = schoolText || form.school;
    return state.schools.map((school) => ({ school, score: fuzzyScore(query, school) })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 8).map((item) => item.school);
  }, [schoolText, form.school, state.schools]);

  const tagSuggestions = useMemo(() => {
    const pool = Array.from(new Set([...suggestedTags, ...state.documents.flatMap((doc) => doc.tags || [])]));
    return pool.map((tag) => ({ tag, score: fuzzyScore(tagText, tag) })).filter((item) => item.score > 0 && !form.tags.includes(item.tag)).sort((a, b) => b.score - a.score).slice(0, 10).map((item) => item.tag);
  }, [tagText, form.tags, state.documents]);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setFile(key, files) {
    const list = Array.from(files || []);
    if (key === 'fullFileNames') {
      update(key, list.map((file) => file.name));
      return;
    }
    update(key, list[0]?.name || '');
    if (key === 'coverFileName' && list[0]) {
      const reader = new FileReader();
      reader.onload = () => update('coverPreview', reader.result);
      reader.readAsDataURL(list[0]);
    }
  }

  function addTag(tag) {
    const clean = String(tag || '').replace(/^#/, '').trim();
    if (!clean || form.tags.some((item) => normalize(item) === normalize(clean))) return;
    update('tags', [...form.tags, clean]);
    setTagText('');
    setTagFocused(false);
  }

  function removeTag(tag) {
    update('tags', form.tags.filter((item) => item !== tag));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.fullFileNames.length) return showToast('Bạn cần chọn ít nhất một file tài liệu.');
    if (!form.coverFileName) return showToast('Bạn cần tải ảnh bìa tỷ lệ 9:16.');
    if (uploadDocument({ ...form, price: 0, school: form.school.trim() })) navigate('/documents');
  }

  return (
    <div className="page upload-page-v25">
      <section className="upload-hero-v25">
        <div><span className="eyebrow"><LibraryBig size={15}/> STUDIO XUẤT BẢN DOCSHARE PRO</span><h1>Chia sẻ tri thức, trình bày chuyên nghiệp</h1><p>Tải lên tài liệu với ảnh bìa 9:16, thông tin rõ ràng và hệ thống gợi ý hashtag thông minh.</p></div>
        <div className="upload-limit-v25"><UploadCloud size={24}/><span><small>Hạn mức hôm nay</small><b>{todayLimit} tài liệu</b><em>{currentUser.premium ? 'Premium · dung lượng mở rộng' : 'Tài khoản thường'}</em></span></div>
      </section>

      <div className="upload-stepper-v25">{steps.map((step, index) => <div key={step.label} className={step.done ? 'done' : ''}><span>{step.done ? <Check size={15}/> : index + 1}</span><b>{step.label}</b></div>)}</div>

      <form className="upload-layout-v25" onSubmit={submit}>
        <main className="upload-form-v25">
          <section className="upload-section-v25">
            <header><span><FileText/></span><div><h2>Thông tin tài liệu</h2><p>Tiêu đề, mô tả và chuyên ngành chính xác giúp tài liệu dễ được tìm thấy.</p></div></header>
            <div className="upload-grid-v25 two">
              <label className="span-2">Tên tài liệu<input value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Ví dụ: Kiến trúc React hiện đại từ nền tảng đến triển khai" required/></label>
              <label className="span-2">Mô tả<textarea value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Tài liệu gồm nội dung gì, phù hợp với ai, có điểm nổi bật nào..." maxLength={1000}/><small>{form.description.length}/1000</small></label>
              <label>Môn học<input value={form.subject} onChange={(event) => update('subject', event.target.value)} placeholder="Ví dụ: Cơ sở dữ liệu" required/></label>
              <label>Danh mục<select value={form.category} onChange={(event) => update('category', event.target.value)}>{state.categories.filter((item) => item.id !== 'all').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label className="span-2 school-autocomplete-v22">Trường / đơn vị <em>không bắt buộc</em><div className="smart-input-v25"><Search size={16}/><input value={form.school} onFocus={() => setSchoolFocused(true)} onChange={(event) => { update('school', event.target.value); setSchoolText(event.target.value); setSchoolFocused(true); }} placeholder="Gõ gần đúng tên trường hoặc để trống..."/></div>{schoolFocused && schoolSuggestions.length > 0 && <div className="suggestion-popover-v22 custom-scroll">{schoolSuggestions.map((school) => <button type="button" key={school} onMouseDown={(event) => event.preventDefault()} onClick={() => { update('school', school); setSchoolText(school); setSchoolFocused(false); }}>{school}</button>)}</div>}</label>
            </div>
          </section>

          <section className="upload-section-v25">
            <header><span><FileArchive/></span><div><h2>Tệp tài liệu</h2><p>Hỗ trợ PDF, Word, PowerPoint, Excel, tệp nén, ảnh và nhiều định dạng khác.</p></div></header>
            <div className="upload-file-grid-v25">
              <label className="dropzone-v25"><FileText/><b>File xem trước <em>không bắt buộc</em></b><small>{form.demoFileName || 'Chọn bản demo hoặc phần trích dẫn'}</small><input type="file" accept={fileAccept} onChange={(event) => setFile('demoFileName', event.target.files)}/><span>{form.demoFileName ? 'Đổi file xem trước' : 'Chọn file xem trước'}</span></label>
              <label className="dropzone-v25 primary"><UploadCloud/><b>File tài liệu <em>bắt buộc</em></b><small>{form.fullFileNames.length ? `${form.fullFileNames.length} file đã chọn` : 'Có thể chọn nhiều file cùng lúc'}</small><input type="file" accept={fileAccept} multiple required onChange={(event) => setFile('fullFileNames', event.target.files)}/><span>{form.fullFileNames.length ? 'Đổi danh sách file' : 'Chọn file tài liệu'}</span></label>
            </div>
            <label className="file-type-row-v25">Loại tài liệu<select value={form.type} onChange={(event) => update('type', event.target.value)}>{fileTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
          </section>

          <section className="upload-section-v25">
            <header><span><ImagePlus/></span><div><h2>Ảnh bìa 9:16</h2><p>Ảnh bìa chỉ hiển thị hình ảnh, không chèn lại tiêu đề để giao diện gọn và chuyên nghiệp.</p></div></header>
            <label className="cover-drop-v25"><FileImage/><b>Tải ảnh bìa dọc</b><small>{form.coverFileName || 'Khuyến nghị 1080 × 1920 px · JPG, PNG hoặc WEBP'}</small><input type="file" accept="image/*" required onChange={(event) => setFile('coverFileName', event.target.files)}/><span>Chọn ảnh bìa</span></label>
          </section>

          <section className="upload-section-v25">
            <header><span><Tag/></span><div><h2>Hashtag & phát hành</h2><p>Thêm từ khóa để tìm kiếm chính xác hơn, sau đó chọn phạm vi hiển thị.</p></div></header>
            <div className="selected-tags-v22">{form.tags.map((tag) => <button type="button" key={tag} onClick={() => removeTag(tag)}>#{tag}<span>×</span></button>)}{!form.tags.length && <small>Chưa có hashtag nào.</small>}</div>
            <div className="tag-autocomplete-v22"><div className="smart-input-v25"><Tag size={16}/><input value={tagText} onFocus={() => setTagFocused(true)} onChange={(event) => { setTagText(event.target.value); setTagFocused(true); }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addTag(tagText); } }} placeholder="Gõ React, cơ sở dữ liệu, AI..."/><button type="button" onClick={() => addTag(tagText)}>Thêm</button></div>{tagFocused && tagSuggestions.length > 0 && <div className="suggestion-popover-v22 tags custom-scroll">{tagSuggestions.map((tag) => <button type="button" key={tag} onMouseDown={(event) => event.preventDefault()} onClick={() => addTag(tag)}>#{tag}</button>)}</div>}</div>
            <label className="publish-visibility-v25">Quyền hiển thị<select value={form.visibility} onChange={(event) => update('visibility', event.target.value)}><option value="public">Công khai</option><option value="unlisted">Chỉ người có liên kết</option><option value="private">Riêng tư</option></select></label>
          </section>

          <div className="upload-submit-v25"><button type="button" className="space-btn secondary" onClick={() => navigate('/documents')}>Hủy bỏ</button><button className="space-btn primary"><UploadCloud size={18}/>Đăng tài liệu</button></div>
        </main>

        <aside className="upload-preview-v25">
          <section className="cover-preview-card-v25"><div className="cover-preview-head"><h3>Ảnh bìa</h3><span>9:16</span></div><div className="cover-preview-stage-v25">{form.coverPreview ? <img src={form.coverPreview} alt="Ảnh bìa xem trước"/> : <div><FileImage size={38}/><span>Ảnh bìa 9:16</span></div>}</div></section>
          <section className="document-preview-card-v25"><h3>Bản xem trước tài liệu</h3><b>{form.title || 'Tên tài liệu sẽ hiển thị tại đây'}</b><p>{form.description || 'Mô tả ngắn sẽ hiển thị tại đây.'}</p><div><span>{form.fullFileNames.length || 0} file</span><span>{form.visibility === 'public' ? 'Công khai' : form.visibility === 'private' ? 'Riêng tư' : 'Có liên kết'}</span></div></section>
          <section className="upload-checklist-v25"><h3>Kiểm tra trước khi đăng</h3>{steps.map((step) => <p key={step.label} className={step.done ? 'done' : ''}><span>{step.done ? '✓' : '○'}</span>{step.label}</p>)}</section>
        </aside>
      </form>
    </div>
  );
}
