import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Bookmark, CheckCircle2, ChevronDown, Download, Edit3, Eye, FileArchive, FileText,
  Flag, Gift, Heart, Lock, MoreHorizontal, Save, ShoppingCart, Star, Trash2, X,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Avatar from '../components/Avatar.jsx';
import BookCover from '../components/BookCover.jsx';
import DonateModal from '../components/DonateModal.jsx';
import GiftArtwork from '../components/GiftArtwork.jsx';
import ReportModal from '../components/ReportModal.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { PremiumBadge, TitleBadge, VerifyBadge } from '../components/Badges.jsx';
import { formatNumber } from '../utils/helpers.js';

const reportReasons = ['Spam / quảng cáo', 'Lừa đảo', 'Ngôn từ xúc phạm', 'Nội dung phản cảm', 'Thông tin sai lệch', 'Lý do khác'];

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    state,
    currentUser,
    getUser,
    toggleLikeDocument,
    addDocumentComment,
    reactDocumentComment,
    replyDocumentComment,
    editDocumentComment,
    deleteDocumentComment,
    reportDocumentComment,
    adminDeleteDocument,
    toggleSaveDocument,
    showToast,
    canAccessDocument,
    purchaseDocument,
    getDocumentPreviewPageCount,
  } = useApp();

  const doc = state.documents.find((item) => item.id === id);
  const [previewSection, setPreviewSection] = useState(1);
  const [donateOpen, setDonateOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
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


  if (!doc) {
    return (
      <div className="page universe-page">
        <section className="panel-universe">
          <h1>Không tìm thấy tài liệu</h1>
          <Link to="/documents">Quay lại thư viện</Link>
        </section>
      </div>
    );
  }

  const author = getUser(doc.authorId);
  const liked = state.likes.documents.includes(doc.id);
  const saved = (state.savedDocuments || []).includes(doc.id);
  const comments = state.documentComments?.[doc.id] || [];
  const fullFiles = doc.fullFileNames?.length ? doc.fullFileNames : (doc.files || []).filter((name) => !name.toLowerCase().includes('demo'));
  const demoFileName = doc.demoFileName || (doc.files || []).find((name) => name.toLowerCase().includes('demo')) || '';
  const hasDemo = Boolean(doc.demoPages || demoFileName);
  const hasFullAccess = canAccessDocument(doc);
  const isPaidDocument = Number(doc.price || 0) > 0;
  const previewCount = getDocumentPreviewPageCount(doc);
  const previewItems = Array.from({ length: previewCount }, (_, index) => index + 1);
  const donorMap = new Map();
  (doc.gifts || []).forEach((gift) => donorMap.set(gift.userId, (donorMap.get(gift.userId) || 0) + gift.credit));
  const donors = [...donorMap.entries()].map(([userId, points]) => ({ user: getUser(userId), points })).sort((a, b) => b.points - a.points);
  const recentGifts = useMemo(() => ([...(doc.gifts || [])].reverse().slice(0, 6).map((item) => ({
    ...item,
    user: getUser(item.userId),
    giftMeta: state.giftStore.find((gift) => gift.id === item.giftId) || { name: item.giftName, theme: 'star' },
  }))), [doc.gifts, getUser, state.giftStore]);
  const isAuthor = currentUser?.id === doc.authorId;
  const canManageDocument = currentUser?.role === 'admin';
  const previewTitle = hasFullAccess ? 'Xem trước toàn bộ tài liệu' : 'Xem trước bản demo';

  function requestFullAccess() {
    if (!hasFullAccess && isPaidDocument) {
      document.getElementById('purchase-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    document.getElementById('full-files-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function submitComment() {
    if (addDocumentComment(doc.id, comment, rating)) setComment('');
  }

  function downloadFile(fileName) {
    if (!hasFullAccess) {
      showToast('Bạn cần mua tài liệu để tải bản đầy đủ.');
      return;
    }
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

  function handlePurchase() {
    if (purchaseDocument(doc.id)) {
      document.getElementById('full-files-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  const visibleFiles = hasFullAccess
    ? (fullFiles.length ? fullFiles : [`${doc.title}.${String(doc.type).toLowerCase()}`])
    : (demoFileName ? [demoFileName] : []);

  return (
    <div className="page universe-page document-detail-universe v22-detail">
      <Link className="back-link" to="/documents">← Quay lại tài liệu</Link>
      <div className={`detail-universe-layout ${previewItems.length ? '' : 'no-demo'}`}>
        {previewItems.length > 0 && (
          <aside className="preview-pages-universe panel-universe">
            <div className="panel-title-row"><div><h3>{previewTitle}</h3><p>{hasFullAccess ? 'Tài liệu miễn phí hoặc bạn đã mua quyền truy cập đầy đủ.' : 'Hiện chỉ xem được các trang demo.'}</p></div></div>
            <div className="preview-page-list custom-scroll">
              {previewItems.map((number) => (
                <button key={number} className={previewSection === number ? 'active' : ''} onClick={() => setPreviewSection(number)}>
                  <span className="preview-thumb"><i /><b>{number}</b></span>
                  <span>
                    <strong>{number === 1 ? 'Trang bìa' : number === 2 ? 'Mục lục' : `Trang ${number}`}</strong>
                    <small>{hasFullAccess ? 'Toàn bộ tài liệu' : 'Bản demo'}</small>
                  </span>
                </button>
              ))}
            </div>
            <small>{hasFullAccess ? `Có thể xem trước ${previewCount}/${doc.pages || previewCount} trang.` : `File demo: ${demoFileName || 'Bản mô phỏng'}`}</small>
          </aside>
        )}

        <main>
          <section className="panel-universe document-hero-universe">
            <div className="detail-book-wrap-v24">
              <BookCover doc={doc} size="detail" />
            </div>
            <div className="detail-main-copy">
              <div className="detail-title-row">
                <div>
                  <h1>{doc.title}</h1>
                  <p>{doc.subject} · {doc.school || 'Chưa cập nhật đơn vị'}</p>
                </div>
                <div className="detail-menu-wrap">
                  <button className="icon-btn" onClick={() => setMenuOpen((value) => !value)}><MoreHorizontal /></button>
                  {menuOpen && (
                    <div className="detail-more-menu">
                      <button onClick={() => { setReportOpen(true); setMenuOpen(false); }}><Flag size={16} />Báo cáo tài liệu</button>
                      {canManageDocument && <button className="danger-text" onClick={() => { setDeleteOpen(true); setMenuOpen(false); }}><Trash2 size={16} />Xóa tài liệu</button>}
                    </div>
                  )}
                </div>
              </div>

              <Link className="detail-author detail-author-link-v24" to={`/users/${author.id}`} title={`Xem hồ sơ ${author.name}`}>
                <Avatar user={author} size="lg" />
                <div>
                  <b>{author.name}<VerifyBadge show={author.verified} /></b>
                  <PremiumBadge show={author.premium} />
                  <small>{formatNumber(author.followers)} người theo dõi · Cấp {author.level} · Bấm để xem hồ sơ</small>
                </div>
              </Link>

              <p className="detail-description">{doc.description || 'Tài liệu học tập được chia sẻ trên cộng đồng DocShare.'}</p>
              <div className="detail-tags">{(doc.tags || []).map((tag) => <span key={tag}>#{tag}</span>)}</div>
              <div className="detail-metrics">
                <span><Eye />{formatNumber(doc.views)} lượt xem</span>
                <span><Download />{formatNumber(doc.downloads)} lượt tải</span>
                <span><Star />{doc.rating} điểm</span>
                <span><FileArchive />{formatNumber(doc.pages || 0)} trang</span>
              </div>
              <div className="detail-access-note-v30">
                {isPaidDocument ? (
                  hasFullAccess ? <span className="success"><CheckCircle2 size={16} /> Bạn đã có quyền xem toàn bộ tài liệu này.</span> : <span className="warning"><Lock size={16} /> Tài liệu này cần {formatNumber(doc.price)} credit để xem toàn bộ.</span>
                ) : (
                  <span className="success"><CheckCircle2 size={16} /> Tài liệu miễn phí: có thể xem trước toàn bộ.</span>
                )}
              </div>
              <div className="detail-action-row detail-action-row-v39">
                <button className={liked ? 'liked' : ''} onClick={() => toggleLikeDocument(doc.id)}><Heart fill={liked ? 'currentColor' : 'none'} />{formatNumber(doc.likes)}</button>
                <button className={saved ? 'saved' : ''} onClick={() => toggleSaveDocument(doc.id)}><Bookmark fill={saved ? 'currentColor' : 'none'} />{saved ? 'Đã yêu thích' : 'Thêm vào yêu thích'}</button>
                <button className="document-donate-btn-v39" onClick={() => setDonateOpen(true)}><Gift size={18}/>Gửi quà tặng</button>
              </div>
              <div className="detail-primary-cta">
                <button className="download-full-cta" onClick={requestFullAccess}>
                  {hasFullAccess ? <><Download />Xem & tải tài liệu</> : <><ShoppingCart />Mua để xem toàn bộ</>}
                </button>
                {previewItems.length > 0 && <button className="demo-jump-cta" onClick={() => document.getElementById('demo-file-section')?.scrollIntoView({ behavior: 'smooth' })}><Eye />{hasFullAccess ? 'Xem trước toàn bộ' : 'Xem trước bản demo'}</button>}
              </div>
            </div>

            <aside id={hasFullAccess ? 'full-files-section' : 'purchase-section'} className={`ownership-card-universe ${hasFullAccess ? 'owned' : 'locked'}`}>
              {hasFullAccess ? (
                <>
                  <CheckCircle2 className="owned-check" />
                  <h3>Tài liệu sẵn sàng truy cập</h3>
                  <p>Bạn có thể xem và tải các file mà tác giả đã cung cấp.</p>
                  <div className="full-file-list custom-scroll">
                    {visibleFiles.map((fileName, index) => (
                      <button key={`${fileName}-${index}`} onClick={() => downloadFile(fileName)}>
                        <FileText />
                        <span><b>{fileName}</b><small>File tài liệu #{index + 1}</small></span>
                        <Download />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <Lock className="owned-check" />
                  <h3>Cần mua để mở toàn bộ</h3>
                  <p>Bạn đang xem bản demo. Sau khi mua, toàn bộ trang xem trước và file đầy đủ sẽ được mở.</p>
                  <div className="purchase-price-v30"><b>{formatNumber(doc.price)}</b><span>credit</span></div>
                  <button className="purchase-doc-btn-v30" onClick={handlePurchase}><ShoppingCart size={17} /> Mua tài liệu</button>
                  {demoFileName && <small className="purchase-hint-v30">Hiện tại chỉ có thể xem bản demo: {demoFileName}</small>}
                </>
              )}
            </aside>
          </section>

          {previewItems.length > 0 && (
            <section id="demo-file-section" className="panel-universe demo-reader-universe">
              <div className="demo-page-heading">
                <span>{previewSection === 1 ? 'Trang bìa' : previewSection === 2 ? 'Mục lục' : `Trang ${previewSection}`}</span>
                <small>{hasFullAccess ? 'Bản xem trước toàn bộ' : 'Bản demo tương tác'}</small>
              </div>
              <div className="demo-page-canvas">
                <div className="demo-watermark">{hasFullAccess ? 'DOCSHARE PREVIEW' : 'DOCSHARE DEMO'}</div>
                <h2>{previewSection === 1 ? doc.title : `${doc.subject} · trang ${previewSection}`}</h2>
                <p>
                  {hasFullAccess
                    ? 'Bạn đang xem trước toàn bộ tài liệu. Có thể tải file đầy đủ ở khung bên phải.'
                    : 'Đây là nội dung demo. Muốn xem toàn bộ, bạn cần mua tài liệu bằng credit.'}
                </p>
                <div className="fake-paragraphs"><i /><i /><i /><i /><i /></div>
              </div>
            </section>
          )}

          <section className="panel-universe support-rating-universe">
            <div className="panel-title-row"><div><h2>Ủng hộ & đánh giá</h2><p>Gửi một biểu trưng trang trọng để ghi nhận nội dung hữu ích của tác giả.</p></div><button className="donate-open-btn donate-board-open-v36" onClick={() => setDonateOpen(true)}><Gift />Gửi quà tặng</button></div>
            <div className="support-rating-grid">
              <div className="donor-board donor-board-v35">
                <h3>Top người ủng hộ tài liệu</h3>
                <div className="donor-scroll custom-scroll">{donors.length ? donors.map((item, index) => <Link to={`/users/${item.user.id}`} key={item.user.id}><b>#{index + 1}</b><Avatar user={item.user} /><span><strong>{item.user.name}</strong><small>{formatNumber(item.points)} điểm ủng hộ</small></span></Link>) : <p className="muted">Chưa có quà tặng. Hãy là người đầu tiên.</p>}</div>
                <div className="recent-gift-strip-v35">
                  <h4>Quà vừa được tặng</h4>
                  <div className="recent-gift-list-v35">
                    {recentGifts.length ? recentGifts.map((item, index) => (
                      <div key={`${item.userId}-${item.giftId}-${index}`} className="recent-gift-chip-v35">
                        <GiftArtwork gift={item.giftMeta || { theme: 'star', name: item.giftName }} size="mini" />
                        <div>
                          <b>{item.giftName}</b>
                          <small>{item.user?.name || 'Thành viên'} · {formatNumber(item.credit)} credit</small>
                        </div>
                      </div>
                    )) : <p className="muted">Chưa có lịch sử tặng quà.</p>}
                  </div>
                </div>
              </div>
              <div className="rating-summary"><strong>{doc.rating}</strong><div><span>★★★★★</span><small>{comments.length + 312} đánh giá</small></div>{[5, 4, 3, 2, 1].map((value) => <p key={value}><b>{value} sao</b><i><em style={{ width: `${value === 5 ? 82 : value === 4 ? 13 : value === 3 ? 3 : 1}%` }} /></i></p>)}</div>
            </div>
          </section>

          <section className="panel-universe document-comments-universe">
            <div className="panel-title-row"><div><h2>Bình luận & đánh giá</h2><p>Có thể sửa, xóa, báo cáo, thả tim và xem/ẩn phản hồi.</p></div></div>
            <div className="comment-composer"><Avatar user={currentUser} /><div><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Viết đánh giá của bạn..." /><div><select value={rating} onChange={(event) => setRating(Number(event.target.value))}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} sao</option>)}</select><button onClick={submitComment}>Gửi đánh giá</button></div></div></div>
            <div className="document-comment-list">{comments.map((item) => {
              const user = getUser(item.userId);
              const replyVisible = Boolean(visibleReplies[item.id]);
              const replyCount = item.authorReply ? 1 : 0;
              const canManage = currentUser?.id === item.userId || currentUser?.role === 'admin';
              const isEditing = editing?.id === item.id;
              return <article key={item.id} className={`document-comment-card ${user.premium ? 'premium-comment' : ''} ${user.activePanels?.review || 'panel-skin-default'}`}>
                <Avatar user={user} /><div>
                  <header><Link to={`/users/${user.id}`}><b>{user.name}</b><VerifyBadge show={user.verified} /><PremiumBadge show={user.premium} /><TitleBadge user={user} compact /><span>Lv.{user.level}</span></Link><small>{item.editedAt ? `${item.createdAt} · đã sửa` : item.createdAt}</small></header>
                  {isEditing ? <div className="comment-edit-box-v22"><textarea value={editing.text} onChange={(event) => setEditing({ ...editing, text: event.target.value })} /><div><select value={editing.rating} onChange={(event) => setEditing({ ...editing, rating: Number(event.target.value) })}>{[5, 4, 3, 2, 1].map((value) => <option value={value} key={value}>{value} sao</option>)}</select><button onClick={saveEdit}><Save size={15} />Lưu</button><button onClick={() => setEditing(null)}><X size={15} />Hủy</button></div></div> : <><div className="comment-stars">{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</div><p>{item.text}</p></>}
                  <div className="comment-actions"><button onClick={() => reactDocumentComment(doc.id, item.id)}>♥ {item.reactions || 0}</button>{replyCount > 0 && <button className="view-replies-btn" onClick={() => setVisibleReplies((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}>{replyVisible ? 'Ẩn trả lời' : `Xem trả lời (${replyCount})`}<ChevronDown size={14} /></button>}{isAuthor && <button onClick={() => setReplying(replying === item.id ? '' : item.id)}>Trả lời với tư cách tác giả</button>}{canManage && !isEditing && <button onClick={() => startEdit(item)}><Edit3 size={14} />Sửa</button>}{canManage && <button className="danger-text" onClick={() => deleteDocumentComment(doc.id, item.id)}><Trash2 size={14} />Xóa</button>}{!canManage && <button onClick={() => setCommentReport(item)}><Flag size={14} />Báo cáo</button>}</div>
                  {item.authorReply && replyVisible && <div className={`author-reply ${getUser(item.authorReply.userId).activePanels?.comment || 'panel-skin-default'}`}><Avatar user={getUser(item.authorReply.userId)} /><div><b>{getUser(item.authorReply.userId).name} · Tác giả</b><TitleBadge user={getUser(item.authorReply.userId)} compact /><p>{item.authorReply.text}</p></div></div>}
                  {isAuthor && replying === item.id && <div className="reply-box"><input value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder="Viết phản hồi của tác giả..." /><button onClick={() => { if (replyDocumentComment(doc.id, item.id, replyText)) { setReplyText(''); setReplying(''); setVisibleReplies((prev) => ({ ...prev, [item.id]: true })); } }}>Gửi</button></div>}
                </div>
              </article>;
            })}</div>
          </section>
        </main>
      </div>

      <DonateModal open={donateOpen} onClose={() => setDonateOpen(false)} mode="document" targetId={doc.id} />
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} type="document" targetId={doc.id} userId={doc.authorId} />
      <ConfirmModal open={deleteOpen} title="Xác nhận xóa tài liệu" confirmText="Xóa tài liệu" danger onClose={() => setDeleteOpen(false)} onConfirm={() => { adminDeleteDocument(doc.id, deleteReason); setDeleteOpen(false); navigate('/documents'); }}><p>Bạn sắp xóa <b>{doc.title}</b>. Người đăng sẽ nhận thông báo kèm lý do.</p><label>Lý do xóa<textarea value={deleteReason} onChange={(event) => setDeleteReason(event.target.value)} /></label></ConfirmModal>
      {commentReport && <div className="modal-backdrop" onMouseDown={() => setCommentReport(null)}><div className="modal-card report-modal" onMouseDown={(event) => event.stopPropagation()}><div className="modal-head"><h3>🚩 Báo cáo bình luận / đánh giá</h3><button onClick={() => setCommentReport(null)}>×</button></div><p className="muted">Chọn lý do phù hợp để Admin kiểm tra.</p><div className="reason-grid">{reportReasons.map((reason) => <button key={reason} className={commentReportReason === reason ? 'active' : ''} onClick={() => setCommentReportReason(reason)}>{reason}</button>)}</div>{commentReportReason === 'Lý do khác' && <textarea value={commentReportOther} onChange={(event) => setCommentReportOther(event.target.value)} placeholder="Nhập lý do chi tiết..." />}<div className="modal-actions"><button className="btn ghost" onClick={() => setCommentReport(null)}>Hủy</button><button className="btn primary" onClick={submitCommentReport}>Gửi báo cáo</button></div></div></div>}
    </div>
  );
}
