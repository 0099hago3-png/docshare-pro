import {
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  Flag,
  Gift,
  Heart,
  MessageCircleReply,
  MoreHorizontal,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { supabase } from '../lib/supabase.js';
import { formatRelativeTime, getProfileName, normalizeError } from '../lib/helpers.js';
import Avatar from './Avatar.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import DonateModal from './DonateModal.jsx';
import GiftBurst from './GiftBurst.jsx';
import Modal from './Modal.jsx';
import PremiumBadge from './PremiumBadge.jsx';

const DEFAULT_VISIBLE_COMMENTS = 2;

const REPORT_REASONS = [
  'Spam hoặc quảng cáo',
  'Ngôn từ xúc phạm',
  'Quấy rối hoặc bắt nạt',
  'Thông tin sai lệch',
  'Nội dung không phù hợp',
  'Lý do khác',
];

function sortTopComments(items) {
  return [...items].sort((left, right) => {
    const likeDiff = Number(right.like_count || 0) - Number(left.like_count || 0);
    if (likeDiff !== 0) return likeDiff;

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
  });
}

function sortReplies(items) {
  return [...items].sort(
    (left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
  );
}

function CommentGiftNotice({ giftLog }) {
  const gift = giftLog.gifts || {};
  const sender = giftLog.sender || {};
  const price = Number(giftLog.cost_credit || gift.credit_price || 0);
  const tier = price > 500
    ? 'legendary'
    : price > 200
      ? 'royal'
      : price > 50
        ? 'radiant'
        : price > 10
          ? 'blossom'
          : 'seedling';

  return (
    <div className={`comment-gift-notice comment-gift-notice--${tier}`}>
      <span className="comment-gift-notice__icon">{gift.icon || '🎁'}</span>
      <p className="rainbow-gift-text">
        <b>{getProfileName(sender)}</b>
        {' đã tặng '}
        <strong>{gift.name || 'một món quà'}</strong>
        {' cho bình luận này'}
      </p>
    </div>
  );
}

function CommentItem({
  comment,
  repliesByParent,
  depth,
  currentUser,
  postId,
  onChanged,
  onGift,
}) {
  const { toast } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content || '');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportDetail, setReportDetail] = useState('');
  const [busy, setBusy] = useState(false);

  const author = comment.profiles || {};
  const authorName = getProfileName(author);
  const childReplies = sortReplies(repliesByParent.get(comment.id) || []);
  const canManage = currentUser?.id === comment.user_id || currentUser?.role === 'admin';
  const canReport = currentUser?.id !== comment.user_id;

  function startReply() {
    setReplyOpen(true);
    setReplyContent((current) => current || `@${authorName} `);
  }

  async function toggleLike() {
    try {
      if (comment.liked_by_me) {
        const { error } = await supabase
          .from('post_comment_reactions')
          .delete()
          .eq('comment_id', comment.id)
          .eq('user_id', currentUser.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_comment_reactions')
          .insert({
            comment_id: comment.id,
            user_id: currentUser.id,
            reaction: 'heart',
          });

        if (error) throw error;
      }

      await onChanged?.();
    } catch (error) {
      toast(normalizeError(error), 'error');
    }
  }

  async function submitReply(event) {
    event.preventDefault();
    if (!replyContent.trim()) return;

    try {
      setBusy(true);

      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          parent_id: comment.id,
          content: replyContent.trim(),
          status: 'visible',
        });

      if (error) throw error;

      setReplyContent('');
      setReplyOpen(false);
      setRepliesOpen(true);
      toast(`Đã trả lời ${authorName}.`);
      await onChanged?.();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit(event) {
    event.preventDefault();
    if (!editContent.trim()) return;

    try {
      setBusy(true);

      const { error } = await supabase
        .from('post_comments')
        .update({ content: editContent.trim() })
        .eq('id', comment.id);

      if (error) throw error;

      setEditing(false);
      setMenuOpen(false);
      toast('Đã sửa bình luận.');
      await onChanged?.();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function removeComment() {
    try {
      setBusy(true);

      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', comment.id);

      if (error) throw error;

      setDeleteOpen(false);
      toast('Đã xóa bình luận.');
      await onChanged?.();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function submitReport(event) {
    event.preventDefault();

    try {
      setBusy(true);

      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: currentUser.id,
          target_type: 'post_comment',
          target_id: comment.id,
          reported_user_id: comment.user_id,
          reason: reportReason,
          detail: reportDetail.trim() || null,
          status: 'pending',
        });

      if (error) throw error;

      setReportOpen(false);
      setReportDetail('');
      setMenuOpen(false);
      toast('Đã gửi báo cáo bình luận cho Admin.');
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <article id={`comment-${comment.id}`} className={`feed-comment feed-comment--depth-${Math.min(depth, 3)}`}>
      <Avatar profile={author} size={depth > 0 ? 30 : 34} />

      <div className="feed-comment__body">
        <div className="feed-comment__bubble">
          <div className="feed-comment__head">
            <div>
              <span className="feed-comment__name-row-v63"><strong>{authorName}</strong><PremiumBadge profile={author} compact /></span>
              <span>{formatRelativeTime(comment.created_at)}</span>
            </div>

            <div className="feed-comment__menu-wrap">
              <button
                className="feed-comment__more"
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                aria-label="Tùy chọn bình luận"
              >
                <MoreHorizontal size={16} />
              </button>

              {menuOpen && (
                <div className="feed-comment__menu">
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(true);
                        setEditContent(comment.content || '');
                        setMenuOpen(false);
                      }}
                    >
                      <Edit3 size={14} /> Sửa bình luận
                    </button>
                  )}

                  {canManage && (
                    <button
                      className="is-danger"
                      type="button"
                      onClick={() => {
                        setDeleteOpen(true);
                        setMenuOpen(false);
                      }}
                    >
                      <Trash2 size={14} /> Xóa bình luận
                    </button>
                  )}

                  {canReport && (
                    <button
                      type="button"
                      onClick={() => {
                        setReportOpen(true);
                        setMenuOpen(false);
                      }}
                    >
                      <Flag size={14} /> Báo cáo bình luận
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {editing ? (
            <form className="feed-comment__edit" onSubmit={saveEdit}>
              <textarea
                rows="3"
                value={editContent}
                onChange={(event) => setEditContent(event.target.value)}
                maxLength={1200}
                autoFocus
              />

              <div>
                <button type="button" onClick={() => setEditing(false)}>
                  <X size={14} /> Hủy
                </button>
                <button className="is-save" type="submit" disabled={busy || !editContent.trim()}>
                  <Check size={14} /> Lưu
                </button>
              </div>
            </form>
          ) : (
            <p>{comment.content}</p>
          )}
        </div>

        <div className="feed-comment__actions">
          <button
            className={comment.liked_by_me ? 'is-active' : ''}
            type="button"
            onClick={toggleLike}
          >
            <Heart size={13} fill={comment.liked_by_me ? 'currentColor' : 'none'} />
            Thích {Number(comment.like_count || 0) > 0 ? `· ${comment.like_count}` : ''}
          </button>

          <button type="button" onClick={startReply}>
            <MessageCircleReply size={13} /> Trả lời
          </button>

          <button type="button" onClick={() => onGift?.(comment)}>
            <Gift size={13} /> Tặng quà
          </button>
        </div>

        {!!comment.gifts?.length && (
          <div className="comment-gift-list">
            {comment.gifts.map((giftLog) => (
              <CommentGiftNotice key={giftLog.id} giftLog={giftLog} />
            ))}
          </div>
        )}

        {replyOpen && (
          <form className="feed-comment__reply-form" onSubmit={submitReply}>
            <Avatar profile={currentUser} size={28} />
            <div>
              <input
                value={replyContent}
                onChange={(event) => setReplyContent(event.target.value)}
                placeholder={`Trả lời ${authorName}...`}
                maxLength={1200}
                autoFocus
              />
              <small>
                Tên <b>@{authorName}</b> đã được gắn vào câu trả lời.
              </small>
            </div>
            <button type="submit" disabled={busy || !replyContent.trim()}>
              <Send size={15} />
            </button>
          </form>
        )}

        {childReplies.length > 0 && (
          <button
            className="feed-comment__replies-toggle"
            type="button"
            onClick={() => setRepliesOpen((value) => !value)}
          >
            {repliesOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            {repliesOpen
              ? 'Ẩn các câu trả lời'
              : `Xem ${childReplies.length} câu trả lời`}
          </button>
        )}

        {repliesOpen && childReplies.length > 0 && (
          <div className="feed-comment__replies">
            {childReplies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                repliesByParent={repliesByParent}
                depth={depth + 1}
                currentUser={currentUser}
                postId={postId}
                onChanged={onChanged}
                onGift={onGift}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={removeComment}
        title="Xóa bình luận"
        message="Bình luận và các câu trả lời trực thuộc sẽ bị xóa. Bạn có chắc chắn không?"
        confirmLabel="Xóa bình luận"
        danger
        loading={busy}
      />

      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Báo cáo bình luận"
        width={520}
      >
        <form className="comment-report-form" onSubmit={submitReport}>
          <label>
            Lý do báo cáo
            <select value={reportReason} onChange={(event) => setReportReason(event.target.value)}>
              {REPORT_REASONS.map((reason) => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </label>

          <label>
            Mô tả thêm
            <textarea
              rows="4"
              value={reportDetail}
              onChange={(event) => setReportDetail(event.target.value)}
              placeholder="Mô tả ngắn để Admin dễ kiểm tra..."
              maxLength={500}
            />
          </label>

          <div className="form-actions form-actions--end">
            <button className="button button--ghost" type="button" onClick={() => setReportOpen(false)}>
              Hủy
            </button>
            <button className="button" type="submit" disabled={busy}>
              <Flag size={15} /> {busy ? 'Đang gửi...' : 'Gửi báo cáo'}
            </button>
          </div>
        </form>
      </Modal>
    </article>
  );
}

export default function CommentThread({ postId, comments = [], onChanged }) {
  const { currentUser } = useApp();
  const [showAll, setShowAll] = useState(false);
  const [giftTarget, setGiftTarget] = useState(null);
  const [giftEffect, setGiftEffect] = useState(null);

  const { roots, repliesByParent } = useMemo(() => {
    const replyMap = new Map();
    const rootItems = [];

    comments.forEach((comment) => {
      if (comment.parent_id) {
        const existing = replyMap.get(comment.parent_id) || [];
        existing.push(comment);
        replyMap.set(comment.parent_id, existing);
      } else {
        rootItems.push(comment);
      }
    });

    return {
      roots: sortTopComments(rootItems),
      repliesByParent: replyMap,
    };
  }, [comments]);

  const visibleRoots = showAll ? roots : roots.slice(0, DEFAULT_VISIBLE_COMMENTS);
  const hiddenCount = Math.max(0, roots.length - DEFAULT_VISIBLE_COMMENTS);

  if (!roots.length) return null;

  return (
    <section className="comment-thread">
      <div className="comment-thread__heading">
        <div>
          <strong>Bình luận nổi bật</strong>
          <span>Ưu tiên bình luận được yêu thích nhiều nhất</span>
        </div>
        <b>{comments.length} bình luận</b>
      </div>

      <div className="comment-thread__list">
        {visibleRoots.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            repliesByParent={repliesByParent}
            depth={0}
            currentUser={currentUser}
            postId={postId}
            onChanged={onChanged}
            onGift={setGiftTarget}
          />
        ))}
      </div>

      {hiddenCount > 0 && !showAll && (
        <button className="comment-thread__show-more" type="button" onClick={() => setShowAll(true)}>
          <ChevronDown size={16} />
          Xem thêm {hiddenCount} bình luận
        </button>
      )}

      {showAll && roots.length > DEFAULT_VISIBLE_COMMENTS && (
        <button className="comment-thread__show-more" type="button" onClick={() => setShowAll(false)}>
          <ChevronUp size={16} />
          Thu gọn bình luận
        </button>
      )}

      <DonateModal
        open={Boolean(giftTarget)}
        onClose={() => setGiftTarget(null)}
        receiver={giftTarget?.profiles}
        targetType="post_comment"
        targetId={giftTarget?.id}
        onSent={(gift) => {
          setGiftEffect({
            gift,
            receiverName: getProfileName(giftTarget?.profiles),
          });
          onChanged?.();
        }}
      />

      {giftEffect && (
        <GiftBurst
          gift={giftEffect.gift}
          senderName={getProfileName(currentUser)}
          receiverName={giftEffect.receiverName}
          onDone={() => setGiftEffect(null)}
        />
      )}
    </section>
  );
}
