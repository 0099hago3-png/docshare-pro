import { Bookmark, Download, Edit3, Eye, Gift, Heart, MessageCircle, MoreHorizontal, Reply, Send, Star, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import DonateModal from '../components/DonateModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import Modal from '../components/Modal.jsx';
import { useApp } from '../context/AppContext.jsx';
import { formatDate, formatNumber, getProfileName, normalizeError, publicAssetUrl } from '../lib/helpers.js';
import { safeFileName } from '../lib/analytics.js';
import '../analytics-dashboard.css';
import { supabase } from '../lib/supabase.js';

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, toast, refreshProfile } = useApp();
  const [document, setDocument] = useState(null);
  const [stats, setStats] = useState({});
  const [comments, setComments] = useState([]);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [myRating, setMyRating] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [review, setReview] = useState('');
  const [commentValue, setCommentValue] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [commentEditValue, setCommentEditValue] = useState('');
  const [deleteDocumentOpen, setDeleteDocumentOpen] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [giftOpen, setGiftOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const recorded = useRef(false);

  const load = useCallback(async () => {
    try {
      const [docResult, statsResult, commentsResult, likeResult, bookmarkResult, ratingResult, purchaseResult] = await Promise.all([
        supabase.from('documents').select('*,profiles:author_id(*),categories(*),document_files(*)').eq('id', id).single(),
        supabase.from('document_stats').select('*').eq('document_id', id).maybeSingle(),
        supabase.from('document_comments').select('*,profiles:user_id(id,full_name,username,email,avatar_path,premium)').eq('document_id', id).order('created_at', { ascending: true }),
        supabase.from('document_likes').select('document_id').eq('document_id', id).eq('user_id', currentUser.id).maybeSingle(),
        supabase.from('document_bookmarks').select('document_id').eq('document_id', id).eq('user_id', currentUser.id).maybeSingle(),
        supabase.from('document_ratings').select('*').eq('document_id', id).eq('user_id', currentUser.id).maybeSingle(),
        supabase.from('document_purchases').select('id').eq('document_id', id).eq('buyer_id', currentUser.id).maybeSingle(),
      ]);
      if (docResult.error) throw docResult.error;
      setDocument(docResult.data);
      setStats(statsResult.data || {});
      setComments(commentsResult.data || []);
      setLiked(Boolean(likeResult.data));
      setBookmarked(Boolean(bookmarkResult.data));
      setHasPurchased(Boolean(purchaseResult.data));
      setMyRating(ratingResult.data || null);
      setRatingValue(ratingResult.data?.rating || 5);
      setReview(ratingResult.data?.review || '');
    } catch (error) {
      toast(normalizeError(error), 'error');
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  }, [id, currentUser.id, navigate, toast]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (recorded.current || !id) return;
    recorded.current = true;
    supabase.rpc('record_document_view', { p_document_id: id }).then(() => {});
  }, [id]);

  const coverPath = document?.document_files?.find((file) => file.file_kind === 'cover')?.storage_path;
  const fullFile = document?.document_files?.find((file) => file.file_kind === 'full');
  const canManage = document && (document.author_id === currentUser.id || currentUser.role === 'admin');
  const hasAccess = Boolean(document && (document.price_credit === 0 || canManage || hasPurchased));
  const topLevelComments = useMemo(() => comments.filter((item) => !item.parent_id), [comments]);
  const repliesFor = (commentId) => comments.filter((item) => item.parent_id === commentId);

  async function toggleLike() {
    try {
      if (liked) {
        const { error } = await supabase.from('document_likes').delete().eq('document_id', id).eq('user_id', currentUser.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('document_likes').insert({ document_id: id, user_id: currentUser.id });
        if (error) throw error;
      }
      setLiked((value) => !value);
      setStats((value) => ({ ...value, like_count: Math.max(0, Number(value.like_count || 0) + (liked ? -1 : 1)) }));
    } catch (error) {
      toast(normalizeError(error), 'error');
    }
  }

  async function toggleBookmark() {
    try {
      if (bookmarked) {
        const { error } = await supabase.from('document_bookmarks').delete().eq('document_id', id).eq('user_id', currentUser.id);
        if (error) throw error;
        toast('Đã bỏ lưu tài liệu.');
      } else {
        const { error } = await supabase.from('document_bookmarks').insert({ document_id: id, user_id: currentUser.id });
        if (error) throw error;
        toast('Đã lưu tài liệu.');
      }
      setBookmarked((value) => !value);
    } catch (error) {
      toast(normalizeError(error), 'error');
    }
  }

  async function saveRating(event) {
    event.preventDefault();
    try {
      setBusy(true);
      const { error } = await supabase.from('document_ratings').upsert({ document_id: id, user_id: currentUser.id, rating: Number(ratingValue), review: review.trim() || null }, { onConflict: 'document_id,user_id' });
      if (error) throw error;
      toast(myRating ? 'Đã cập nhật đánh giá.' : 'Đã gửi đánh giá.');
      await load();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function deleteRating() {
    try {
      setBusy(true);
      const { error } = await supabase.from('document_ratings').delete().eq('document_id', id).eq('user_id', currentUser.id);
      if (error) throw error;
      toast('Đã xóa đánh giá.');
      setMyRating(null);
      setRatingValue(5);
      setReview('');
      await load();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function addComment(event) {
    event.preventDefault();
    if (!commentValue.trim()) return;
    try {
      setBusy(true);
      const { error } = await supabase.from('document_comments').insert({ document_id: id, user_id: currentUser.id, parent_id: replyTo?.id || null, content: commentValue.trim() });
      if (error) throw error;
      setCommentValue('');
      setReplyTo(null);
      await load();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function saveCommentEdit(event) {
    event.preventDefault();
    try {
      setBusy(true);
      const { error } = await supabase.from('document_comments').update({ content: commentEditValue.trim() }).eq('id', editingComment.id);
      if (error) throw error;
      setEditingComment(null);
      setCommentEditValue('');
      toast('Đã cập nhật bình luận.');
      await load();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function deleteComment() {
    try {
      setBusy(true);
      const { error } = await supabase.from('document_comments').delete().eq('id', deleteCommentId);
      if (error) throw error;
      setDeleteCommentId(null);
      toast('Đã xóa bình luận.');
      await load();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function toggleCommentHeart(commentId) {
    try {
      const { data } = await supabase.from('document_comment_reactions').select('comment_id').eq('comment_id', commentId).eq('user_id', currentUser.id).maybeSingle();
      if (data) await supabase.from('document_comment_reactions').delete().eq('comment_id', commentId).eq('user_id', currentUser.id);
      else await supabase.from('document_comment_reactions').insert({ comment_id: commentId, user_id: currentUser.id, reaction: 'heart' });
      toast(data ? 'Đã bỏ thích bình luận.' : 'Đã thích bình luận.');
    } catch (error) {
      toast(normalizeError(error), 'error');
    }
  }

  async function removeDocument() {
    try {
      setBusy(true);
      for (const file of document.document_files || []) {
        await supabase.storage.from(file.storage_bucket).remove([file.storage_path]);
      }
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
      toast('Đã xóa tài liệu.');
      navigate('/documents');
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function getFullFile(action = 'open', forceAccess = false) {
    try {
      if (!fullFile) throw new Error('Tài liệu chưa có file đầy đủ.');
      if (!hasAccess && !forceAccess) throw new Error('Bạn cần mua tài liệu trước khi tải xuống.');

      const { data, error } = await supabase.storage
        .from(fullFile.storage_bucket)
        .createSignedUrl(fullFile.storage_path, 120);

      if (error) throw error;

      if (action === 'download') {
        await supabase.rpc('record_document_download', { p_document_id: id });

        const originalName = fullFile.original_name || `${safeFileName(document.title)}.pdf`;
        const separator = data.signedUrl.includes('?') ? '&' : '?';
        const downloadUrl = `${data.signedUrl}${separator}download=${encodeURIComponent(originalName)}`;

        const anchor = window.document.createElement('a');
        anchor.href = downloadUrl;
        anchor.download = originalName;
        anchor.rel = 'noopener noreferrer';
        window.document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();

        setStats((value) => ({
          ...value,
          download_count: Number(value.download_count || 0) + 1,
        }));
        toast('Đã bắt đầu tải tài liệu.');
        return;
      }

      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast(normalizeError(error), 'error');
    }
  }

  async function purchase() {
    try {
      setBusy(true);
      const { data, error } = await supabase.rpc('purchase_document', { p_document_id: id });
      if (error) throw error;
      if (!data?.ok) {
        if (data?.code === 'INSUFFICIENT_CREDIT') throw new Error(`Không đủ credit. Bạn có ${data.balance || 0} credit, tài liệu cần ${data.price || 0} credit.`);
        throw new Error('Không thể mua tài liệu.');
      }
      toast(data.code === 'PURCHASED' ? 'Mua tài liệu thành công.' : 'Bạn đã có quyền truy cập tài liệu.');
      setPurchaseOpen(false);
      await refreshProfile();
      setHasPurchased(true);
      await getFullFile('download', true);
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading label="Đang tải chi tiết tài liệu..." />;
  if (!document) return <EmptyState title="Không tìm thấy tài liệu" />;

  return (
    <div className="page document-detail-page">
      <div className="document-detail-layout">
        <aside className="document-detail-cover"><img src={coverPath ? publicAssetUrl('document-covers', coverPath) : '/assets/default-cover.svg'} alt={document.title} /></aside>
        <section className="document-detail-main botanical-card">
          <div className="detail-topline"><span>{document.categories?.name || 'Học thuật'}</span>{canManage && <div className="detail-owner-actions"><Link className="button button--small button--outline" to={`/documents/${id}/edit`}><Edit3 size={16} /> Sửa</Link><button className="button button--small button--danger-soft" type="button" onClick={() => setDeleteDocumentOpen(true)}><Trash2 size={16} /> Xóa</button></div>}</div>
          <h1>{document.title}</h1>
          <p className="document-detail-description">{document.description}</p>
          <Link className="author-card" to={`/profile/${document.author_id}`}><Avatar profile={document.profiles} size={50} /><div><strong>{getProfileName(document.profiles)}</strong><small>{document.profiles?.school_name || 'Thành viên DocShare'}</small></div></Link>
          <div className="tag-row">{(document.tags || []).map((tag) => <span key={tag}>#{tag}</span>)}</div>
          <div className="document-detail-stats"><span><Eye size={15} /> {formatNumber(stats.view_count || 0)} lượt xem</span><span><Heart size={15} /> {formatNumber(stats.like_count || 0)} lượt thích</span><span><Star size={15} /> {Number(stats.average_rating || 0).toFixed(1)} / 5</span><span><MessageCircle size={15} /> {formatNumber(stats.comment_count || 0)} bình luận</span><span><Download size={15} /> {formatNumber(stats.download_count || 0)} lượt tải</span></div>
          <div className="document-detail-actions"><button className={liked ? 'button is-liked' : 'button button--outline'} type="button" onClick={toggleLike}><Heart size={17} fill={liked ? 'currentColor' : 'none'} /> {liked ? 'Đã thích' : 'Thích'}</button><button className={bookmarked ? 'button' : 'button button--outline'} type="button" onClick={toggleBookmark}><Bookmark size={17} /> {bookmarked ? 'Đã lưu' : 'Lưu tài liệu'}</button><button className="button button--outline" type="button" onClick={() => setGiftOpen(true)}><Gift size={17} /> Tặng quà</button></div>
        </section>
        <aside className="access-card botanical-card"><span className="eyebrow">QUYỀN TRUY CẬP</span><h2>Tài liệu sẵn sàng</h2><strong>{document.price_credit > 0 ? `${document.price_credit} credit` : 'Miễn phí'}</strong>{!hasAccess ? <button className="button button--wide" type="button" onClick={() => setPurchaseOpen(true)}>Mua tài liệu</button> : <div className="document-file-actions"><button className="button button--wide button--outline" type="button" onClick={() => getFullFile('open')}><Eye size={18} /> Mở file</button><button className="button button--wide document-download-button" type="button" onClick={() => getFullFile('download')}><Download size={18} /> Tải xuống tài liệu</button></div>}<small>Đăng ngày {formatDate(document.created_at)}</small></aside>
      </div>

      <section className="reviews-section botanical-card">
        <div className="section-heading"><div><Star size={23} /><h2>Bình luận và đánh giá</h2></div><span>{comments.length} bình luận</span></div>
        <form className="rating-form" onSubmit={saveRating}>
          <div className="star-picker"><span>Đánh giá:</span>{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" className={value <= ratingValue ? 'is-active' : ''} onClick={() => setRatingValue(value)}><Star size={24} fill={value <= ratingValue ? 'currentColor' : 'none'} /></button>)}</div>
          <textarea rows="3" value={review} onChange={(event) => setReview(event.target.value)} placeholder="Viết nhận xét về tài liệu..." />
          <div className="form-actions"><button className="button" disabled={busy}>{myRating ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}</button>{myRating && <button className="button button--danger-soft" type="button" onClick={deleteRating} disabled={busy}>Xóa đánh giá</button>}</div>
        </form>

        <form className="main-comment-form" onSubmit={addComment}>
          <Avatar profile={currentUser} size={40} />
          <div><textarea rows="3" value={commentValue} onChange={(event) => setCommentValue(event.target.value)} placeholder={replyTo ? `Trả lời ${getProfileName(replyTo.profiles)}...` : 'Viết bình luận...'} />{replyTo && <button className="link-button" type="button" onClick={() => setReplyTo(null)}>Hủy trả lời</button>}</div>
          <button className="button" type="submit" disabled={busy}><Send size={17} /> Gửi</button>
        </form>

        <div className="comment-list">{topLevelComments.map((comment) => <CommentItem key={comment.id} comment={comment} replies={repliesFor(comment.id)} currentUser={currentUser} onReply={setReplyTo} onEdit={(item) => { setEditingComment(item); setCommentEditValue(item.content); }} onDelete={setDeleteCommentId} onHeart={toggleCommentHeart} />)}</div>
      </section>

      <Modal open={Boolean(editingComment)} onClose={() => setEditingComment(null)} title="Sửa bình luận" width={600}><form className="stack-form" onSubmit={saveCommentEdit}><label>Nội dung<textarea rows="5" value={commentEditValue} onChange={(event) => setCommentEditValue(event.target.value)} required /></label><div className="form-actions form-actions--end"><button className="button button--ghost" type="button" onClick={() => setEditingComment(null)}>Hủy</button><button className="button" disabled={busy}>Lưu thay đổi</button></div></form></Modal>
      <ConfirmDialog open={deleteDocumentOpen} onClose={() => setDeleteDocumentOpen(false)} onConfirm={removeDocument} title="Xóa tài liệu" message="Tài liệu, file, lượt thích, bình luận và đánh giá liên quan sẽ bị xóa. Bạn có chắc chắn không?" confirmLabel="Xóa tài liệu" danger loading={busy} />
      <ConfirmDialog open={Boolean(deleteCommentId)} onClose={() => setDeleteCommentId(null)} onConfirm={deleteComment} title="Xóa bình luận" message="Bạn có chắc chắn muốn xóa bình luận này?" confirmLabel="Xóa bình luận" danger loading={busy} />
      <Modal open={purchaseOpen} onClose={() => setPurchaseOpen(false)} title="Xác nhận mua tài liệu" width={500}><div className="purchase-confirm"><img src={coverPath ? publicAssetUrl('document-covers', coverPath) : '/assets/default-cover.svg'} alt="" /><div><strong>{document.title}</strong><span>Tác giả: {getProfileName(document.profiles)}</span><b>Giá: {document.price_credit} credit</b></div></div><div className="form-actions form-actions--end"><button className="button button--ghost" type="button" onClick={() => setPurchaseOpen(false)}>Hủy</button><button className="button" type="button" onClick={purchase} disabled={busy}>{busy ? 'Đang xử lý...' : 'Xác nhận mua'}</button></div></Modal>
      <DonateModal open={giftOpen} onClose={() => setGiftOpen(false)} receiver={document.profiles} targetType="document" targetId={document.id} />
    </div>
  );
}

function CommentItem({ comment, replies, currentUser, onReply, onEdit, onDelete, onHeart }) {
  const canManage = comment.user_id === currentUser.id || currentUser.role === 'admin';
  return (
    <div className="comment-item">
      <Avatar profile={comment.profiles} size={38} />
      <div className="comment-item__body"><div className="comment-item__bubble"><strong>{getProfileName(comment.profiles)}</strong><p>{comment.content}</p></div><div className="comment-item__actions"><button type="button" onClick={() => onHeart(comment.id)}><Heart size={14} /> Thích</button><button type="button" onClick={() => onReply(comment)}><Reply size={14} /> Trả lời</button>{canManage && <><button type="button" onClick={() => onEdit(comment)}><Edit3 size={14} /> Sửa</button><button type="button" onClick={() => onDelete(comment.id)}><Trash2 size={14} /> Xóa</button></>}</div>{replies.map((reply) => <div className="comment-reply" key={reply.id}><Avatar profile={reply.profiles} size={32} /><div><strong>{getProfileName(reply.profiles)}</strong><p>{reply.content}</p></div></div>)}</div>
    </div>
  );
}
