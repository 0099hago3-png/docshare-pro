import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Bookmark, CheckCircle2, ChevronDown, Download, Edit3, Eye, FileArchive, FileText,
  Flag, Gift, Heart, MoreHorizontal, Save, Star, Trash2, X,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Avatar from '../components/Avatar.jsx';
import BookCover from '../components/BookCover.jsx';
import DonateModal from '../components/DonateModal.jsx';
import ReportModal from '../components/ReportModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { PremiumBadge, VerifyBadge } from '../components/Badges.jsx';
import { formatNumber } from '../utils/helpers.js';

const reportReasons = ['Spam / quảng cáo', 'Lừa đảo', 'Ngôn từ xúc phạm', 'Nội dung phản cảm', 'Thông tin sai lệch', 'Lý do khác'];

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    state, currentUser, getUser, toggleLikeDocument, buyDocument, addDocumentComment,
    reactDocumentComment, replyDocumentComment, editDocumentComment, deleteDocumentComment,
    reportDocumentComment, adminDeleteDocument, toggleSaveDocument, showToast,
  } = useApp();
  const doc = state.documents.find((item) => item.id === id);
  const [previewSection, setPreviewSection] = useState(1);
  const [donateOpen, setDonateOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('Nội dung vi phạm quy định cộng đồng.');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [replying, setReplying] = useState('');
  const [replyText, setReplyText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [visibleReplies, setVisibleReplies] = useState({});
  const [editing, setEditing] = useState(null);
  const [commentReport, setCommentReport] = useState(null);
  const [commentReportReason, setCommentReportReason] = useState(reportReasons[0]);
  const [commentReportOther, setCommentReportOther] = useState('');

  if (!doc) return <div className="page universe-page"><section className="panel-universe"><h1>Không tìm thấy tài liệu</h1><Link to="/documents">Quay lại thư viện</Link></section></div>;

  const author = getUser(doc.authorId);
  const liked = state.likes.documents.includes(doc.id);
  const saved = (state.savedDocuments || []).includes(doc.id);
  const owned = doc.price <= 0 || (state.purchasedDocuments || []).includes(doc.id) || currentUser?.id === doc.authorId || currentUser?.role === 'admin';
  const comments = state.documentComments?.[doc.id] || [];
  const fullFiles = doc.fullFileNames?.length ? doc.fullFileNames : (doc.files || []).filter((name) => !name.toLowerCase().includes('demo'));
  const hasDemo = Boolean(doc.demoFileName || doc.demoPages || (doc.files || []).some((name) => name.toLowerCase().includes('demo')));
  const previewItems = hasDemo ? [1, 2, 3, 4, 5] : [];
  const donorMap = new Map();
  (doc.gifts || []).forEach((gift) => donorMap.set(gift.userId, (donorMap.get(gift.userId) || 0) + gift.credit));
  const donors = [...donorMap.entries()].map(([userId, points]) => ({ user: getUser(userId), points })).sort((a, b) => b.points - a.points);
  const isAuthor = currentUser?.id === doc.authorId;

  function confirmBuy() {
    const result = buyDocument(doc.id);
    if (!result.ok) showToast(result.message);
    else setPurchaseOpen(false);
  }

  function requestFullAccess() {
    if (owned) document.getElementById('full-files-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else setPurchaseOpen(true);
  }

  function submitComment() {
    if (addDocumentComment(doc.id, comment, rating)) setComment('');
  }

  function downloadFile(fileName) {
    showToast(`Đang chuẩn bị tải ${fileName}...`);
  }

  function startEdit(item) {
    setEditing({ id: item.id, text: item.text, rating: item.rating });
  }

  function saveEdit() {
    if (editDocumentComment(doc.id, editing.id, editing.text, editing.rating)) setEditing(null);
  }

  function submitCommentReport() {
    if (!commentReport) return;
    if (commentReportReason === 'Lý do khác' && !commentReportOther.trim()) {
      showToast('Vui lòng nhập lý do báo cáo.');
      return;
    }
    reportDocumentComment(doc.id, commentReport.id, commentReport.userId, commentReportReason === 'Lý do khác' ? 'other' : commentReportReason, commentReportOther);
    setCommentReport(null);
    setCommentReportOther('');
  }

  return (
    <div className="page universe-page document-detail-universe v22-detail">
      <Link className="back-link" to="/documents">← Quay lại tài liệu</Link>
      <div className={`detail-universe-layout ${hasDemo ? '' : 'no-demo'}`}>
        {hasDemo && <aside className="preview-pages-universe panel-universe">
          <div className="panel-title-row"><div><h3>Xem trước file demo</h3><p>Bấm từng mục để xem phần nội dung mẫu.</p></div></div>
          <div className="preview-page-list custom-scroll">{previewItems.map((number) => <button key={number} className={previewSection === number ? 'active' : ''} onClick={() => setPreviewSection(number)}><span className="preview-thumb"><i/><b>{number}</b></span><span><strong>{number === 1 ? 'Trang bìa' : number === 2 ? 'Mục lục' : `Nội dung mẫu ${number - 2}`}</strong><small>File demo</small></span></button>)}</div>
          <small>File demo: {doc.demoFileName || (doc.files || []).find((name) => name.toLowerCase().includes('demo')) || 'Bản mô phỏng'}</small>
        </aside>}

        <main>
          <section className="panel-universe document-hero-universe">
            <div className="detail-book-wrap-v24">
              <BookCover doc={doc} size="detail"/>
              {doc.price > 0 && <span className="detail-book-price-v24">{doc.price} credit</span>}
            </div>
            <div className="detail-main-copy">
              <div className="detail-title-row"><div><h1>{doc.title}</h1><p>{doc.subject} · {doc.school || 'Chưa cập nhật đơn vị'}</p></div><div className="detail-menu-wrap"><button className="icon-btn" onClick={() => setMenuOpen((value) => !value)}><MoreHorizontal/></button>{menuOpen && <div className="detail-more-menu"><button onClick={() => { setReportOpen(true); setMenuOpen(false); }}><Flag size={16}/>Báo cáo tài liệu</button>{currentUser?.role === 'admin' && <button className="danger-text" onClick={() => { setDeleteOpen(true); setMenuOpen(false); }}><Trash2 size={16}/>Xóa tài liệu</button>}</div>}</div></div>
              <Link className="detail-author detail-author-link-v24" to={`/users/${author.id}`} title={`Xem hồ sơ ${author.name}`}><Avatar user={author} size="lg"/><div><b>{author.name}<VerifyBadge show={author.verified}/></b><PremiumBadge show={author.premium}/><small>{formatNumber(author.followers)} người theo dõi · Cấp {author.level} · Bấm để xem hồ sơ</small></div></Link>
              <p className="detail-description">{doc.description || 'Tài liệu học tập được chia sẻ trên cộng đồng DocShare.'}</p>
              <div className="detail-tags">{(doc.tags || []).map((tag) => <span key={tag}>#{tag}</span>)}</div>
              <div className="detail-metrics"><span><Eye/>{formatNumber(doc.views)} lượt xem</span><span><Download/>{formatNumber(doc.downloads)} lượt tải</span><span><Star/>{doc.rating} điểm</span><span><FileArchive/>{fullFiles.length || 1} file đầy đủ</span></div>
              <div className="detail-action-row">
                <button className={liked ? 'liked' : ''} onClick={() => toggleLikeDocument(doc.id)}><Heart fill={liked ? 'currentColor' : 'none'}/>{formatNumber(doc.likes)}</button>
                <button className={saved ? 'saved' : ''} onClick={() => toggleSaveDocument(doc.id)}><Bookmark fill={saved ? 'currentColor' : 'none'}/>{saved ? 'Đã yêu thích' : 'Thêm vào yêu thích'}</button>
              </div>
              <div className="detail-primary-cta">
                <button className={owned ? 'download-full-cta' : 'buy-full-cta'} onClick={requestFullAccess}>{owned ? <Download/> : <FileArchive/>}{owned ? 'Xem & tải tài liệu đầy đủ' : `Mua tài liệu đầy đủ · ${doc.price} credit`}</button>
                {hasDemo && <button className="demo-jump-cta" onClick={() => document.getElementById('demo-file-section')?.scrollIntoView({ behavior: 'smooth' })}><Eye/>Xem trước file demo</button>}
              </div>
            </div>

            <aside id="full-files-section" className={`ownership-card-universe ${owned ? 'owned' : 'locked'}`}>
              {owned ? <>
                <CheckCircle2 className="owned-check"/><h3>Đã mở khóa tài liệu đầy đủ</h3><p>Bạn có thể xem và tải tất cả file mà tác giả đã cung cấp.</p>
                <div className="full-file-list custom-scroll">{(fullFiles.length ? fullFiles : [`${doc.title}.${String(doc.type).toLowerCase()}`]).map((fileName, index) => <button key={`${fileName}-${index}`} onClick={() => downloadFile(fileName)}><FileText/><span><b>{fileName}</b><small>File đầy đủ #{index + 1}</small></span><Download/></button>)}</div>
              </> : <>
                <FileArchive className="locked-file-icon"/><h3>Tài liệu đầy đủ đang khóa</h3><p>Bấm mua để mở toàn bộ danh sách file. Bạn chỉ trả credit một lần và có thể tải lại bất cứ lúc nào.</p>
                <div className="purchase-price"><strong>{doc.price}</strong><span>credit</span></div>
                <button className="buy-main" onClick={() => setPurchaseOpen(true)}>Mua tài liệu đầy đủ</button>
              </>}
            </aside>
          </section>

          {hasDemo && <section id="demo-file-section" className="panel-universe demo-reader-universe">
            <div className="demo-page-heading"><span>{previewSection === 1 ? 'Trang bìa' : previewSection === 2 ? 'Mục lục' : `Nội dung mẫu ${previewSection - 2}`}</span><small>File demo tương tác</small></div>
            <div className="demo-page-canvas"><div className="demo-watermark">DOCSHARE DEMO</div><h2>{previewSection === 1 ? doc.title : `${doc.subject} · phần xem trước ${previewSection}`}</h2><p>Đây là nội dung xem trước từ file demo mà tác giả cung cấp. Tài liệu đầy đủ chỉ mở sau khi mua.</p><div className="fake-paragraphs"><i/><i/><i/><i/><i/></div>{!owned && <button className="demo-buy-overlay" onClick={() => setPurchaseOpen(true)}>Mua để xem toàn bộ file</button>}</div>
          </section>}

          <section className="panel-universe support-rating-universe">
            <div className="panel-title-row"><div><h2>Ủng hộ & đánh giá</h2><p>Người nhận được cộng 30% credit của món quà.</p></div><button className="donate-open-btn" onClick={() => setDonateOpen(true)}><Gift/>Tặng quà</button></div>
            <div className="support-rating-grid">
              <div className="donor-board"><h3>Top người ủng hộ tài liệu</h3><div className="donor-scroll custom-scroll">{donors.length ? donors.map((item, index) => <Link to={`/users/${item.user.id}`} key={item.user.id}><b>#{index + 1}</b><Avatar user={item.user}/><span><strong>{item.user.name}</strong><small>{formatNumber(item.points)} điểm ủng hộ</small></span></Link>) : <p className="muted">Chưa có quà tặng. Hãy là người đầu tiên.</p>}</div></div>
              <div className="rating-summary"><strong>{doc.rating}</strong><div><span>★★★★★</span><small>{comments.length + 312} đánh giá</small></div>{[5,4,3,2,1].map((value) => <p key={value}><b>{value} sao</b><i><em style={{ width: `${value === 5 ? 82 : value === 4 ? 13 : value === 3 ? 3 : 1}%` }}/></i></p>)}</div>
            </div>
          </section>

          <section className="panel-universe document-comments-universe">
            <div className="panel-title-row"><div><h2>Bình luận & đánh giá</h2><p>Có thể sửa, xóa, báo cáo, thả tim và xem/ẩn phản hồi.</p></div></div>
            <div className="comment-composer"><Avatar user={currentUser}/><div><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Viết đánh giá của bạn..."/><div><select value={rating} onChange={(event) => setRating(Number(event.target.value))}>{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} sao</option>)}</select><button onClick={submitComment}>Gửi đánh giá</button></div></div></div>
            <div className="document-comment-list">{comments.map((item) => {
              const user = getUser(item.userId);
              const replyVisible = Boolean(visibleReplies[item.id]);
              const replyCount = item.authorReply ? 1 : 0;
              const canManage = currentUser?.id === item.userId || currentUser?.role === 'admin';
              const isEditing = editing?.id === item.id;
              return <article key={item.id} className={`document-comment-card ${user.premium ? 'premium-comment' : ''} ${user.activePanels?.review || 'panel-skin-default'}`}>
                <Avatar user={user}/><div>
                  <header><Link to={`/users/${user.id}`}><b>{user.name}</b><VerifyBadge show={user.verified}/><PremiumBadge show={user.premium}/><TitleBadge user={user} compact/><span>Lv.{user.level}</span></Link><small>{item.editedAt ? `${item.createdAt} · đã sửa` : item.createdAt}</small></header>
                  {isEditing ? <div className="comment-edit-box-v22"><textarea value={editing.text} onChange={(event) => setEditing({ ...editing, text: event.target.value })}/><div><select value={editing.rating} onChange={(event) => setEditing({ ...editing, rating: Number(event.target.value) })}>{[5,4,3,2,1].map((value) => <option value={value} key={value}>{value} sao</option>)}</select><button onClick={saveEdit}><Save size={15}/>Lưu</button><button onClick={() => setEditing(null)}><X size={15}/>Hủy</button></div></div> : <><div className="comment-stars">{'★'.repeat(item.rating)}{'☆'.repeat(5-item.rating)}</div><p>{item.text}</p></>}
                  <div className="comment-actions"><button onClick={() => reactDocumentComment(doc.id, item.id)}>♥ {item.reactions || 0}</button>{replyCount > 0 && <button className="view-replies-btn" onClick={() => setVisibleReplies((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}>{replyVisible ? 'Ẩn trả lời' : `Xem trả lời (${replyCount})`}<ChevronDown size={14}/></button>}{isAuthor && <button onClick={() => setReplying(replying === item.id ? '' : item.id)}>Trả lời với tư cách tác giả</button>}{canManage && !isEditing && <button onClick={() => startEdit(item)}><Edit3 size={14}/>Sửa</button>}{canManage && <button className="danger-text" onClick={() => deleteDocumentComment(doc.id, item.id)}><Trash2 size={14}/>Xóa</button>}{!canManage && <button onClick={() => setCommentReport(item)}><Flag size={14}/>Báo cáo</button>}</div>
                  {item.authorReply && replyVisible && <div className={`author-reply ${getUser(item.authorReply.userId).activePanels?.comment || 'panel-skin-default'}`}><Avatar user={getUser(item.authorReply.userId)}/><div><b>{getUser(item.authorReply.userId).name} · Tác giả</b><TitleBadge user={getUser(item.authorReply.userId)} compact/><p>{item.authorReply.text}</p></div></div>}
                  {isAuthor && replying === item.id && <div className="reply-box"><input value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder="Viết phản hồi của tác giả..."/><button onClick={() => { if (replyDocumentComment(doc.id, item.id, replyText)) { setReplyText(''); setReplying(''); setVisibleReplies((prev) => ({ ...prev, [item.id]: true })); } }}>Gửi</button></div>}
                </div>
              </article>;
            })}</div>
          </section>
        </main>
      </div>

      <DonateModal open={donateOpen} onClose={() => setDonateOpen(false)} mode="document" targetId={doc.id}/>
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} type="document" targetId={doc.id} userId={doc.authorId}/>
      <ConfirmModal open={purchaseOpen} title="Xác nhận mua tài liệu đầy đủ" confirmText={`Mua với ${doc.price} credit`} onClose={() => setPurchaseOpen(false)} onConfirm={confirmBuy}>
        <div className="purchase-confirm-v22"><FileArchive/><div><h3>{doc.title}</h3><p>Sau khi xác nhận, tài khoản sẽ trừ <b>{doc.price} credit</b> và toàn bộ file đầy đủ được mở ngay.</p><small>Số dư hiện tại: <b>{currentUser?.credit || 0} credit</b></small></div></div>
      </ConfirmModal>
      <ConfirmModal open={deleteOpen} title="Xác nhận xóa tài liệu" confirmText="Xóa tài liệu" danger onClose={() => setDeleteOpen(false)} onConfirm={() => { adminDeleteDocument(doc.id, deleteReason); setDeleteOpen(false); navigate('/documents'); }}><p>Bạn sắp xóa <b>{doc.title}</b>. Người đăng sẽ nhận thông báo kèm lý do.</p><label>Lý do xóa<textarea value={deleteReason} onChange={(event) => setDeleteReason(event.target.value)}/></label></ConfirmModal>
      {commentReport && <div className="modal-backdrop" onMouseDown={() => setCommentReport(null)}><div className="modal-card report-modal" onMouseDown={(event) => event.stopPropagation()}><div className="modal-head"><h3>🚩 Báo cáo bình luận / đánh giá</h3><button onClick={() => setCommentReport(null)}>×</button></div><p className="muted">Chọn lý do phù hợp để Admin kiểm tra.</p><div className="reason-grid">{reportReasons.map((reason) => <button key={reason} className={commentReportReason === reason ? 'active' : ''} onClick={() => setCommentReportReason(reason)}>{reason}</button>)}</div>{commentReportReason === 'Lý do khác' && <textarea value={commentReportOther} onChange={(event) => setCommentReportOther(event.target.value)} placeholder="Nhập lý do chi tiết..."/>}<div className="modal-actions"><button className="btn ghost" onClick={() => setCommentReport(null)}>Hủy</button><button className="btn primary" onClick={submitCommentReport}>Gửi báo cáo</button></div></div></div>}
    </div>
  );
}
