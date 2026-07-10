import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BadgeDollarSign, Check, FileArchive, FileImage, FileText, ImagePlus,
  Search, Sparkles, Tag, UploadCloud,
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
    price: 0, coverEmoji: '📘', color: 'blue', tags: [], visibility: 'public',
    coverFileName: '', coverPreview: '', demoFileName: '', fullFileNames: [],
  });
  const [tagText, setTagText] = useState('');
  const [schoolText, setSchoolText] = useState('');
  const [schoolFocused, setSchoolFocused] = useState(false);
  const [tagFocused, setTagFocused] = useState(false);
  const todayLimit = currentUser.premium ? 20 : 2;

  const steps = useMemo(() => [
    { label: 'Thông tin', done: Boolean(form.title && form.subject) },
    { label: 'Tệp đầy đủ', done: Boolean(form.fullFileNames.length) },
    { label: 'Ảnh bìa', done: Boolean(form.coverFileName || form.coverEmoji) },
    { label: 'Tags & giá', done: Boolean(form.tags.length || form.price >= 0) },
  ], [form]);

  const schoolSuggestions = useMemo(() => {
    const query = schoolText || form.school;
    return state.schools
      .map((school) => ({ school, score: fuzzyScore(query, school) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((item) => item.school);
  }, [schoolText, form.school, state.schools]);

  const tagSuggestions = useMemo(() => {
    const pool = Array.from(new Set([...suggestedTags, ...state.documents.flatMap((doc) => doc.tags || [])]));
    return pool
      .map((tag) => ({ tag, score: fuzzyScore(tagText, tag) }))
      .filter((item) => item.score > 0 && !form.tags.includes(item.tag))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((item) => item.tag);
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
    if (!form.fullFileNames.length) {
      showToast('Bạn cần chọn ít nhất một file tài liệu đầy đủ.');
      return;
    }
    if (uploadDocument({ ...form, school: form.school.trim() })) navigate('/documents');
  }

  return (
    <div className="page universe-page upload-v22-page">
      <section className="upload-v22-hero">
        <div><span className="eyebrow"><Sparkles size={15}/> STUDIO ĐĂNG TẢI DOCSHARE</span><h1>Đăng tài liệu mới</h1><p>Đăng nhanh, hỗ trợ nhiều định dạng, gợi ý trường gần đúng và hashtag thông minh.</p></div>
        <div className="upload-limit-card"><UploadCloud/><span><small>Hạn mức hôm nay</small><b>{todayLimit} tài liệu</b><em>{currentUser.premium ? 'Premium · file dung lượng lớn hơn' : 'Tài khoản thường'}</em></span></div>
      </section>

      <div className="upload-stepper-v22">{steps.map((step, index) => <div key={step.label} className={step.done ? 'done' : ''}><span>{step.done ? <Check size={15}/> : index + 1}</span><b>{step.label}</b></div>)}</div>

      <form className="upload-workspace-v22" onSubmit={submit}>
        <main className="upload-form-v22">
          <section className="upload-block-v22">
            <header><span><FileText/></span><div><h2>1. Thông tin tài liệu</h2><p>Tiêu đề rõ ràng, mô tả đủ ý và môn học chính xác giúp tài liệu dễ được tìm thấy.</p></div></header>
            <div className="upload-grid-v22 two">
              <label className="span-2">Tên tài liệu<input value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="VD: Kiến trúc React hiện đại từ nền tảng đến triển khai" required/></label>
              <label className="span-2">Mô tả<textarea value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Tài liệu gồm nội dung gì, phù hợp với ai, có điểm nổi bật nào..." maxLength={800}/><small>{form.description.length}/800</small></label>
              <label>Môn học<input value={form.subject} onChange={(event) => update('subject', event.target.value)} placeholder="VD: Cơ sở dữ liệu" required/></label>
              <label>Danh mục<select value={form.category} onChange={(event) => update('category', event.target.value)}>{state.categories.filter((item) => item.id !== 'all').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label className="span-2 school-autocomplete-v22">Trường / đơn vị <em>không bắt buộc</em><div className="smart-input-v22"><Search size={16}/><input value={form.school} onFocus={() => setSchoolFocused(true)} onChange={(event) => { update('school', event.target.value); setSchoolText(event.target.value); setSchoolFocused(true); }} placeholder="Gõ gần đúng tên trường hoặc để trống..."/></div>{schoolFocused && schoolSuggestions.length > 0 && <div className="suggestion-popover-v22 custom-scroll">{schoolSuggestions.map((school) => <button type="button" key={school} onMouseDown={(event) => event.preventDefault()} onClick={() => { update('school', school); setSchoolText(school); setSchoolFocused(false); }}>{school}</button>)}</div>}</label>
            </div>
          </section>

          <section className="upload-block-v22">
            <header><span><FileArchive/></span><div><h2>2. Tải file</h2><p>File demo là tùy chọn. File đầy đủ có thể chọn nhiều tệp và chỉ mở cho người đã mua.</p></div></header>
            <div className="upload-file-grid-v22">
              <label className="dropzone-v22 demo"><FileText/><b>File xem trước <em>không bắt buộc</em></b><small>{form.demoFileName || 'PDF, DOCX, PPTX, ảnh, TXT...'}</small><input type="file" accept={fileAccept} onChange={(event) => setFile('demoFileName', event.target.files)}/><span>{form.demoFileName ? 'Đổi file demo' : 'Chọn file demo'}</span></label>
              <label className="dropzone-v22 primary"><UploadCloud/><b>File tài liệu đầy đủ <em>bắt buộc</em></b><small>{form.fullFileNames.length ? `${form.fullFileNames.length} file: ${form.fullFileNames.join(', ')}` : 'Có thể chọn nhiều file cùng lúc'}</small><input type="file" accept={fileAccept} multiple required onChange={(event) => setFile('fullFileNames', event.target.files)}/><span>{form.fullFileNames.length ? 'Đổi danh sách file' : 'Chọn file đầy đủ'}</span></label>
            </div>
            <label className="file-type-row-v22">Loại tài liệu<select value={form.type} onChange={(event) => update('type', event.target.value)}>{fileTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
          </section>

          <section className="upload-block-v22">
            <header><span><ImagePlus/></span><div><h2>3. Ảnh bìa</h2><p>Tải ảnh bìa dọc rõ chữ để tăng khả năng được xem và mua.</p></div></header>
            <div className="cover-upload-row-v22">
              <label className="cover-drop-v22"><FileImage/><b>Tải ảnh bìa</b><small>{form.coverFileName || 'Khuyên dùng tỉ lệ 3:4, JPG/PNG/WEBP'}</small><input type="file" accept="image/*" onChange={(event) => setFile('coverFileName', event.target.files)}/><span>Chọn ảnh</span></label>
              <div className="upload-grid-v22 two compact"><label>Biểu tượng dự phòng<input value={form.coverEmoji} onChange={(event) => update('coverEmoji', event.target.value)} maxLength={4}/></label><label>Màu nhận diện<select value={form.color} onChange={(event) => update('color', event.target.value)}><option value="blue">Xanh công nghệ</option><option value="purple">Tím sáng tạo</option><option value="orange">Cam năng lượng</option><option value="green">Lục tri thức</option><option value="red">Đỏ nổi bật</option><option value="cyan">Lam hiện đại</option></select></label></div>
            </div>
          </section>

          <section className="upload-block-v22">
            <header><span><Tag/></span><div><h2>4. Hashtag thông minh</h2><p>Gõ để nhận gợi ý từ khóa gần đúng. Hashtag giúp tìm kiếm và thuật toán đề xuất chính xác hơn.</p></div></header>
            <div className="selected-tags-v22">{form.tags.map((tag) => <button type="button" key={tag} onClick={() => removeTag(tag)}>#{tag}<span>×</span></button>)}{!form.tags.length && <small>Chưa có hashtag nào.</small>}</div>
            <div className="tag-autocomplete-v22"><div className="smart-input-v22"><Tag size={16}/><input value={tagText} onFocus={() => setTagFocused(true)} onChange={(event) => { setTagText(event.target.value); setTagFocused(true); }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addTag(tagText); } }} placeholder="Gõ React, cơ sở dữ liệu, AI..."/><button type="button" onClick={() => addTag(tagText)}>+ Thêm</button></div>{tagFocused && tagSuggestions.length > 0 && <div className="suggestion-popover-v22 tags custom-scroll">{tagSuggestions.map((tag) => <button type="button" key={tag} onMouseDown={(event) => event.preventDefault()} onClick={() => addTag(tag)}>#{tag}</button>)}</div>}</div>
          </section>

          <section className="upload-block-v22">
            <header><span><BadgeDollarSign/></span><div><h2>5. Giá & xuất bản</h2><p>Tài liệu có giá chỉ mở file đầy đủ sau khi người dùng xác nhận mua bằng credit.</p></div></header>
            <div className="upload-grid-v22 two compact"><label>Giá tài liệu (credit)<input type="number" min="0" value={form.price} onChange={(event) => update('price', Number(event.target.value))}/><small>Đặt 0 nếu muốn chia sẻ miễn phí.</small></label><label>Quyền hiển thị<select value={form.visibility} onChange={(event) => update('visibility', event.target.value)}><option value="public">Công khai</option><option value="unlisted">Chỉ người có liên kết</option><option value="private">Riêng tư</option></select></label></div>
          </section>

          <div className="upload-submit-bar-v22"><button type="button" className="space-btn secondary" onClick={() => navigate('/documents')}>Hủy bỏ</button><button className="space-btn primary"><UploadCloud size={18}/>Đăng tài liệu</button></div>
        </main>

        <aside className="upload-preview-v22">
          <section className="preview-card-v22"><div className={`preview-cover-v22 ${form.color}`} style={form.coverPreview ? { backgroundImage: `linear-gradient(180deg,rgba(2,7,18,.04),rgba(2,7,18,.9)),url(${form.coverPreview})` } : undefined}><span>{form.type}</span>{!form.coverPreview && <div>{form.coverEmoji}</div>}<h3>{form.title || 'Tên tài liệu của bạn'}</h3><p>{form.subject || 'Môn học'}</p></div><div className="preview-info-v22"><h3>{form.title || 'Bản xem trước tài liệu'}</h3><p>{form.description || 'Mô tả ngắn sẽ hiển thị tại đây.'}</p><div><span>{form.fullFileNames.length || 0} file đầy đủ</span><span>{form.price > 0 ? `${form.price} credit` : 'Miễn phí'}</span></div></div></section>
          <section className="upload-checklist-v22"><h3>Kiểm tra trước khi đăng</h3>{steps.map((step) => <p key={step.label} className={step.done ? 'done' : ''}><span>{step.done ? '✓' : '○'}</span>{step.label}</p>)}<small>Tài liệu được đăng ngay. Nội dung vi phạm từ khóa cộng đồng sẽ bị chặn.</small></section>
        </aside>
      </form>
    </div>
  );
}
